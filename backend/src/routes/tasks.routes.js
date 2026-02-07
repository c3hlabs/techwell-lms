const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks
 * @access  Private/Admin
 */
router.get('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { status, priority, assignedTo } = req.query;

        const where = {};
        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (assignedTo === 'ME') where.assignedTo = req.user.id;

        const tasks = await prisma.task.findMany({
            where,
            orderBy: [
                { priority: 'desc' }, // High priority first
                { dueDate: 'asc' }    // Due sooner first
            ],
            include: {
                lead: { select: { id: true, name: true, phone: true } },
                assignee: { select: { id: true, name: true, avatar: true } },
                creator: { select: { id: true, name: true } },
                comments: {
                    include: { user: { select: { id: true, name: true, avatar: true } } },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        res.json(tasks);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/tasks/:id/comments
 * @desc    Add a comment to a task
 * @access  Private
 */
router.post('/:id/comments', authenticate, async (req, res, next) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'Comment text required' });

        const comment = await prisma.taskComment.create({
            data: {
                content: text,
                taskId: req.params.id,
                userId: req.user.id
            },
            include: {
                user: { select: { id: true, name: true, avatar: true } }
            }
        });

        res.status(201).json(comment);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private/Admin
 */
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { title, description, priority, dueDate, leadId, assignedTo } = req.body;

        const task = await prisma.task.create({
            data: {
                title,
                description,
                priority: priority || 'MEDIUM',
                dueDate: dueDate ? new Date(dueDate) : null,
                leadId,
                assignedTo: assignedTo || req.user.id,
                createdBy: req.user.id,
                status: 'PENDING'
            },
            include: {
                assignee: { select: { id: true, name: true, avatar: true } }
            }
        });

        res.status(201).json(task);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task status or details
 * @access  Private/Admin
 */
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { status, priority, dueDate, assignedTo, description } = req.body;

        const task = await prisma.task.update({
            where: { id: req.params.id },
            data: {
                status,
                priority,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                assignedTo,
                description
            },
            include: {
                assignee: { select: { id: true, name: true, avatar: true } }
            }
        });

        res.json(task);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        await prisma.task.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
