const express = require('express');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Validation Schema
const createLiveClassSchema = z.object({
    courseId: z.string(),
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    platform: z.enum(['ZOOM', 'GOOGLE_MEET', 'MS_TEAMS', 'CUSTOM']).default('ZOOM'),
    meetingLink: z.string().url('Invalid URL').optional().or(z.literal('')),
    scheduledAt: z.string().datetime(), // Expecting ISO string
    duration: z.number().min(15, 'Duration must be at least 15 minutes'),
    timezone: z.string().default('Asia/Kolkata')
});

/**
 * @route   GET /api/live-classes
 * @desc    Get all live classes (optional filter by courseId)
 * @access  Private
 */
router.get('/', authenticate, async (req, res, next) => {
    try {
        const { courseId } = req.query;
        const where = {};

        if (courseId) where.courseId = courseId;

        // If user is STUDENT, only show enrolled course classes
        if (req.user.role === 'STUDENT') {
            const enrollments = await prisma.enrollment.findMany({
                where: { userId: req.user.id },
                select: { courseId: true }
            });
            const enrolledCourseIds = enrollments.map(e => e.courseId);

            if (courseId) {
                // Determine if student is enrolled in the requested course
                if (!enrolledCourseIds.includes(courseId)) {
                    return res.json([]); // Not enrolled
                }
                where.courseId = courseId;
            } else {
                where.courseId = { in: enrolledCourseIds };
            }
        }

        const classes = await prisma.liveClass.findMany({
            where,
            include: {
                course: {
                    select: { id: true, title: true }
                }
            },
            orderBy: { scheduledAt: 'asc' }
        });

        res.json(classes);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/live-classes
 * @desc    Schedule a new live class
 * @access  Private (Admin/Instructor)
 */
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'), async (req, res, next) => {
    try {
        const validatedData = createLiveClassSchema.parse(req.body);

        // Allow empty string for link -> null
        if (validatedData.meetingLink === '') validatedData.meetingLink = undefined;

        const liveClass = await prisma.liveClass.create({
            data: {
                ...validatedData,
                scheduledAt: new Date(validatedData.scheduledAt),
                // Host info from logged in user if not provided?
                hostId: req.user.id,
                hostName: req.user.name
            }
        });

        res.status(201).json(liveClass);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PATCH /api/live-classes/:id
 * @desc    Update live class details
 * @access  Private (Admin/Instructor)
 */
router.patch('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = req.body;

        if (data.meetingLink === '') data.meetingLink = null;
        if (data.scheduledAt) data.scheduledAt = new Date(data.scheduledAt);

        const liveClass = await prisma.liveClass.update({
            where: { id },
            data
        });

        res.json(liveClass);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/live-classes/:id
 * @desc    Cancel/Delete a live class
 * @access  Private (Admin/Instructor)
 */
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'), async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.liveClass.delete({ where: { id } });
        res.json({ message: 'Live class deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
