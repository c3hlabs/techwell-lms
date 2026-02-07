const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient();

// ============= PUBLIC ROUTES =============

/**
 * @route   POST /api/ats/apply/external
 * @desc    Apply for a job (External Candidate)
 * @access  Public
 */
router.post('/apply/external', async (req, res, next) => {
    try {
        const { jobId, name, email, phone, resumeUrl, coverLetter } = req.body;

        if (!jobId || !name || !email) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check for existing application
        const existing = await prisma.jobApplication.findFirst({
            where: { jobId, externalEmail: email }
        });

        if (existing) {
            return res.status(400).json({ error: 'You have already applied for this job.' });
        }

        const application = await prisma.jobApplication.create({
            data: {
                jobId,
                source: 'EXTERNAL',
                externalName: name,
                externalEmail: email,
                externalPhone: phone,
                resumeUrl,
                coverLetter,
                status: 'APPLIED',
                statusHistory: [{ status: 'APPLIED', updatedBy: 'SYSTEM', timestamp: new Date() }]
            }
        });

        // Trigger Email (Async)
        // TODO: Call email service to log "APPLICATION_RECEIVED"

        res.status(201).json(application);
    } catch (error) {
        next(error);
    }
});

// ============= RECRUITER ROUTES =============

/**
 * @route   GET /api/ats/applications/detail/:id
 * @desc    Get single application details (Recruiter)
 * @access  Private (Employer)
 */
router.get('/applications/detail/:id', authenticate, authorize('EMPLOYER'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const application = await prisma.jobApplication.findUnique({
            where: { id },
            include: {
                applicant: { select: { name: true, email: true, avatar: true, phone: true } },
                job: { select: { title: true, employerId: true } }
            }
        });

        if (!application || application.job.employerId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(application);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/ats/applications/:jobId
 * @desc    List applications with filters (Recruiter)
 * @access  Private (Employer)
 */
router.get('/applications/:jobId', authenticate, authorize('EMPLOYER'), async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const { source, status, minScore, search } = req.query;

        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job || job.employerId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

        const where = { jobId };

        if (source) where.source = source; // INTERNAL / EXTERNAL
        if (status) where.status = status;
        if (minScore) where.atsScore = { gte: parseFloat(minScore) };

        // Search logic (Internal Name OR External Name)
        if (search) {
            where.OR = [
                { applicant: { name: { contains: search, mode: 'insensitive' } } },
                { externalName: { contains: search, mode: 'insensitive' } }
            ];
        }

        const applications = await prisma.jobApplication.findMany({
            where,
            include: {
                applicant: { select: { name: true, email: true, avatar: true, phone: true } }, // Internal
                interviews: true
            },
            orderBy: { atsScore: 'desc' } // Default sort by ATS Score
        });

        res.json(applications);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PATCH /api/ats/status/:id
 * @desc    Update Status & Workflow (Recruiter)
 * @access  Private (Employer)
 */
router.patch('/status/:id', authenticate, authorize('EMPLOYER'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const application = await prisma.jobApplication.findUnique({
            where: { id },
            include: { job: true }
        });

        if (!application || application.job.employerId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Add to history
        const historyEntry = {
            status,
            updatedBy: req.user.id,
            timestamp: new Date(),
            notes
        };

        const existingHistory = application.statusHistory || [];

        // Update application
        const updated = await prisma.jobApplication.update({
            where: { id },
            data: {
                status,
                statusHistory: [...existingHistory, historyEntry]
            }
        });

        // Create Audit Log
        await prisma.auditLog.create({
            data: {
                entityType: 'APPLICATION',
                entityId: id,
                action: 'STATUS_CHANGE',
                performedBy: req.user.id,
                details: { oldStatus: application.status, newStatus: status, notes },
                applicationId: id
            }
        });

        res.json(updated);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/ats/score/:id
 * @desc    Calculate ATS Score (Mock Implementation)
 * @access  Private (Employer)
 */
router.post('/score/:id', authenticate, authorize('EMPLOYER'), async (req, res, next) => {
    try {
        const { id } = req.params;

        // In real app: Parse resumeUrl content -> Compare with Job Skills -> 0-100
        // Here: Random mock score for demo
        const score = Math.floor(Math.random() * (100 - 60 + 1)) + 60; // 60-100

        const updated = await prisma.jobApplication.update({
            where: { id },
            data: { atsScore: score }
        });

        res.json({ id, atsScore: score });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/ats/interviews
 * @desc    Schedule Interview
 * @access  Private (Employer)
 */
router.post('/interviews', authenticate, authorize('EMPLOYER'), async (req, res, next) => {
    try {
        const { applicationId, roundName, scheduledAt, interviewerId, duration, type } = req.body;

        const interview = await prisma.jobInterview.create({
            data: {
                applicationId,
                roundName,
                roundType: type || 'TECHNICAL',
                scheduledAt: new Date(scheduledAt),
                interviewerId: interviewerId || req.user.id, // Default to self if not assigned
                duration: parseInt(duration) || 30
            }
        });

        // Update application status to INTERVIEW_SCHEDULED
        await prisma.jobApplication.update({
            where: { id: applicationId },
            data: { status: 'INTERVIEW_SCHEDULED' }
        });

        // Create Audit Log
        await prisma.auditLog.create({
            data: {
                entityType: 'INTERVIEW',
                entityId: interview.id,
                action: 'SCHEDULED',
                performedBy: req.user.id,
                details: { round: roundName, date: scheduledAt },
                applicationId
            }
        });

        res.status(201).json(interview);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/ats/export/:jobId
 * @desc    Export Applicants to CSV
 * @access  Private (Employer)
 */
router.get('/export/:jobId', authenticate, authorize('EMPLOYER'), async (req, res, next) => {
    try {
        const { jobId } = req.params;

        const job = await prisma.job.findUnique({
            where: { id: jobId },
            include: { employer: true }
        });

        if (!job || job.employerId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

        const applications = await prisma.jobApplication.findMany({
            where: { jobId },
            include: { applicant: true },
            orderBy: { createdAt: 'desc' }
        });

        // Manual CSV Generation
        const headers = ['Name', 'Email', 'Phone', 'Source', 'Status', 'ATS Score', 'Date Applied'];
        const rows = applications.map(app => {
            const name = app.source === 'INTERNAL' ? app.applicant?.name : app.externalName;
            const email = app.source === 'INTERNAL' ? app.applicant?.email : app.externalEmail;
            const phone = app.source === 'INTERNAL' ? app.applicant?.phone : app.externalPhone;

            return [
                name || 'N/A',
                email || 'N/A',
                phone || 'N/A',
                app.source,
                app.status,
                app.atsScore || 0,
                new Date(app.createdAt).toLocaleDateString()
            ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="applicants-${jobId}.csv"`);
        res.status(200).send(csvContent);

    } catch (error) {
        next(error);
    }
});

module.exports = router;
