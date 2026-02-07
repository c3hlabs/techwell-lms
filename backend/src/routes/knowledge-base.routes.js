const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @route   GET /api/knowledge-base
 * @desc    Get all knowledge base entries
 * @access  Private/Admin
 */
router.get('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { domain, search } = req.query;

        const where = {};
        if (domain) where.domain = domain;
        if (search) {
            where.OR = [
                { domain: { contains: search, mode: 'insensitive' } },
                { role: { contains: search, mode: 'insensitive' } },
                { question: { contains: search, mode: 'insensitive' } }
            ];
        }

        const entries = await prisma.knowledgeBase.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        res.json({ entries });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/knowledge-base
 * @desc    Create new knowledge base entry
 * @access  Private/Admin
 */
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { domain, role, question, beginnerAnswer, mediumAnswer, hardAnswer, status } = req.body;

        const entry = await prisma.knowledgeBase.create({
            data: {
                domain,
                role,
                question,
                beginnerAnswer,
                mediumAnswer,
                hardAnswer,
                status: status || 'PUBLISHED'
            }
        });

        res.status(201).json({ message: 'Entry created', entry });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/knowledge-base/:id
 * @desc    Update knowledge base entry
 * @access  Private/Admin
 */
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { domain, role, question, beginnerAnswer, mediumAnswer, hardAnswer, status } = req.body;

        const entry = await prisma.knowledgeBase.update({
            where: { id: req.params.id },
            data: {
                domain,
                role,
                question,
                beginnerAnswer,
                mediumAnswer,
                hardAnswer,
                status
            }
        });

        res.json({ message: 'Entry updated', entry });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/knowledge-base/:id
 * @desc    Delete knowledge base entry
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        await prisma.knowledgeBase.delete({
            where: { id: req.params.id }
        });

        res.json({ message: 'Entry deleted' });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/knowledge-base/stats
 * @desc    Get knowledge base statistics
 * @access  Private/Admin
 */
router.get('/stats', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const [total, byDifficulty, byDomain] = await Promise.all([
            prisma.knowledgeBase.count(),
            prisma.knowledgeBase.groupBy({
                by: ['difficulty'],
                _count: { id: true }
            }),
            prisma.knowledgeBase.groupBy({
                by: ['domain'],
                _count: { id: true }
            })
        ]);

        res.json({
            total,
            byDifficulty: byDifficulty.reduce((acc, item) => {
                acc[item.difficulty] = item._count.id;
                return acc;
            }, {}),
            byDomain: byDomain.reduce((acc, item) => {
                acc[item.domain] = item._count.id;
                return acc;
            }, {})
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
