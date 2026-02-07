const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient();

// ============= INTEGRATIONS =============

/**
 * @route   GET /api/video/integrations
 * @desc    Get all video integrations
 * @access  Private (Admin/Staff)
 */
router.get('/integrations', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'STAFF', 'INSTITUTE_ADMIN'), async (req, res, next) => {
    try {
        const integrations = await prisma.videoIntegration.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(integrations);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/video/integrations
 * @desc    Create/Update video integration
 * @access  Private (Admin)
 */
router.post('/integrations', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { platform, name, clientId, clientSecret, apiKey } = req.body;

        const integration = await prisma.videoIntegration.create({
            data: {
                platform,
                name: name || platform,
                clientId,
                clientSecret,
                apiKey,
                isActive: true
            }
        });

        res.status(201).json(integration);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/video/integrations/:id
 * @desc    Update integration status or details
 * @access  Private (Admin)
 */
router.put('/integrations/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const integration = await prisma.videoIntegration.update({
            where: { id },
            data: data
        });

        res.json(integration);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/video/integrations/:id
 * @desc    Delete integration
 * @access  Private (Super Admin)
 */
router.delete('/integrations/:id', authenticate, authorize('SUPER_ADMIN'), async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.videoIntegration.delete({ where: { id } });
        res.json({ message: 'Integration deleted' });
    } catch (error) {
        next(error);
    }
});

// ============= CLASSES =============

/**
 * @route   GET /api/video/classes
 * @desc    Get live classes
 * @access  Private
 */
router.get('/classes', authenticate, async (req, res, next) => {
    try {
        const classes = await prisma.liveClass.findMany({
            include: { course: { select: { title: true } } },
            orderBy: { scheduledAt: 'asc' }
        });
        res.json(classes);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/video/classes
 * @desc    Schedule a live class
 * @access  Private (Instructor/Admin)
 */
router.post('/classes', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'), async (req, res, next) => {
    try {
        const { courseId, title, scheduledAt, duration, platform, meetingLink } = req.body;

        const liveClass = await prisma.liveClass.create({
            data: {
                courseId,
                title,
                scheduledAt: new Date(scheduledAt),
                duration: parseInt(duration),
                platform,
                meetingLink,
                status: 'SCHEDULED',
                hostId: req.user.id,
                hostName: req.user.name
            }
        });

        res.status(201).json(liveClass);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
