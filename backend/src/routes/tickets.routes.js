const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const prisma = new PrismaClient();

// Configure storage for ticket attachments
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/tickets';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'ticket-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * @route   POST /api/tickets
 * @desc    Create a new support ticket
 * @access  Private
 */
router.post('/', authenticate, upload.single('attachment'), async (req, res, next) => {
    try {
        const { subject, description, priority, category } = req.body;
        const attachmentUrl = req.file ? `/uploads/tickets/${req.file.filename}` : null;

        const ticket = await prisma.ticket.create({
            data: {
                subject,
                description,
                priority: priority || 'MEDIUM',
                category: category || 'GENERAL',
                userId: req.user.id,
                messages: {
                    create: {
                        message: description,
                        attachmentUrl,
                        isStaffReply: false
                    }
                }
            },
            include: { messages: true }
        });

        res.status(201).json(ticket);
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        next(error);
    }
});

/**
 * @route   GET /api/tickets
 * @desc    Get all tickets (User gets own, Admin gets all)
 * @access  Private
 */
router.get('/', authenticate, async (req, res, next) => {
    try {
        const { status, priority, category } = req.query;
        let where = {};

        // If not admin, restrict to own tickets
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'ADMIN') {
            where.userId = req.user.id;
        }

        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (category) where.category = category;

        const tickets = await prisma.ticket.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            include: {
                user: { select: { name: true, email: true, role: true } },
                _count: { select: { messages: true } }
            }
        });

        res.json(tickets);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/tickets/:id
 * @desc    Get ticket details with messages
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const ticket = await prisma.ticket.findUnique({
            where: { id: req.params.id },
            include: {
                messages: { orderBy: { createdAt: 'asc' } },
                user: { select: { id: true, name: true, email: true, avatar: true } }
            }
        });

        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

        // Access check
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'ADMIN' && ticket.userId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(ticket);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/tickets/:id/reply
 * @desc    Add a reply to a ticket
 * @access  Private
 */
router.post('/:id/reply', authenticate, upload.single('attachment'), async (req, res, next) => {
    try {
        const { message } = req.body;
        const attachmentUrl = req.file ? `/uploads/tickets/${req.file.filename}` : null;
        const isStaff = ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'].includes(req.user.role);

        // Verify ticket exists
        const ticket = await prisma.ticket.findUnique({ where: { id: req.params.id } });
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

        // Create message
        const newMessage = await prisma.ticketMessage.create({
            data: {
                ticketId: ticket.id,
                message,
                attachmentUrl,
                isStaffReply: isStaff
            }
        });

        // Update ticket status if needed
        let updateData = { updatedAt: new Date() };
        if (isStaff && ticket.status === 'OPEN') {
            updateData.status = 'IN_PROGRESS';
        } else if (!isStaff && ticket.status === 'RESOLVED') {
            updateData.status = 'OPEN'; // Re-open if user replies
        }

        await prisma.ticket.update({
            where: { id: ticket.id },
            data: updateData
        });

        res.json(newMessage);
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        next(error);
    }
});

/**
 * @route   PUT /api/tickets/:id/status
 * @desc    Update ticket status (Admin only)
 * @access  Private/Admin
 */
router.put('/:id/status', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { status, priority } = req.body;
        const ticket = await prisma.ticket.update({
            where: { id: req.params.id },
            data: { status, priority }
        });
        res.json(ticket);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PATCH /api/tickets/:id/assign
 * @desc    Assign ticket to staff
 * @access  Private/Admin
 */
router.patch('/:id/assign', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { assignedTo, internalNotes } = req.body;

        const data = {};
        if (assignedTo) data.assignedTo = assignedTo;
        if (internalNotes) data.internalNotes = internalNotes;

        const ticket = await prisma.ticket.update({
            where: { id: req.params.id },
            data
        });
        res.json(ticket);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
