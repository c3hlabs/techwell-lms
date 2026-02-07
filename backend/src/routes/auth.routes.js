const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().optional()
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
});

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res, next) => {
    try {
        const validatedData = registerSchema.parse(req.body);

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(validatedData.password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: validatedData.email,
                password: hashedPassword,
                name: validatedData.name,
                phone: validatedData.phone
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true
            }
        });

        // Generate token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Send Welcome Email (Async, don't wait)
        const { sendWelcomeEmail } = require('../services/email.service');
        sendWelcomeEmail(user).catch(err => console.error('Email error:', err));

        res.status(201).json({
            message: 'User registered successfully',
            user,
            token
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', async (req, res, next) => {
    try {
        const validatedData = loginSchema.parse(req.body);

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: validatedData.email }
        });

        if (!user) {
            console.log(`Login failed: User not found for email ${validatedData.email}`);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);

        if (!isPasswordValid) {
            console.log(`Login failed: Invalid password for user ${validatedData.email}`);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check if active
        if (!user.isActive) {
            console.log(`Login failed: Account inactive for user ${validatedData.email}`);
            return res.status(403).json({ error: 'Account is deactivated' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                permissions: user.permissions || []
            },
            token
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Private
 */
router.post('/refresh', async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });

            // Check if user still exists
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, isActive: true }
            });

            if (!user || !user.isActive) {
                return res.status(401).json({ error: 'User not found or inactive' });
            }

            // Generate new token
            const newToken = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            res.json({ token: newToken });
        } catch (error) {
            return res.status(401).json({ error: 'Invalid token' });
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;
