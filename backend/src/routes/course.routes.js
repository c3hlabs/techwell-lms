const express = require('express');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createCourseSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    thumbnail: z.string().url().optional(),
    category: z.string().min(2),
    difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('BEGINNER'),
    price: z.number().min(0).default(0),
    discountPrice: z.number().min(0).default(0),
    courseCode: z.string().optional(),
    jobRoles: z.array(z.string()).optional(),
    bannerUrl: z.string().url().optional(),
    // Course Types
    courseType: z.enum(['RECORDED', 'LIVE', 'HYBRID']).default('RECORDED'),
    liveSchedule: z.any().optional(),
    hybridConfig: z.any().optional(),
    // Interview Integration
    hasInterviewPrep: z.boolean().default(false),
    interviewPrice: z.number().min(0).default(0),
    bundlePrice: z.number().min(0).default(0)
});

/**
 * @route   GET /api/courses
 * @desc    Get all published courses
 * @access  Public
 */
router.get('/', optionalAuth, async (req, res, next) => {
    try {
        const { category, difficulty, search, page = 1, limit = 12 } = req.query;

        const where = { isPublished: true };
        if (category) where.category = category;
        if (difficulty) where.difficulty = difficulty;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [courses, total] = await Promise.all([
            prisma.course.findMany({
                where,
                select: {
                    id: true,
                    title: true,
                    description: true,
                    thumbnail: true,
                    category: true,
                    difficulty: true,
                    price: true,
                    _count: {
                        select: {
                            modules: true,
                            enrollments: true
                        }
                    }
                },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                orderBy: { createdAt: 'desc' }
            }),
            prisma.course.count({ where })
        ]);

        res.json({
            courses,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/courses/:id
 * @desc    Get course details with modules
 * @access  Public
 */
router.get('/:id', optionalAuth, async (req, res, next) => {
    try {
        const course = await prisma.course.findUnique({
            where: { id: req.params.id },
            include: {
                modules: {
                    orderBy: { order: 'asc' },
                    include: {
                        lessons: {
                            orderBy: { order: 'asc' },
                            select: {
                                id: true,
                                title: true,
                                duration: true,
                                order: true
                            }
                        }
                    }
                },
                _count: {
                    select: { enrollments: true }
                }
            }
        });

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Check if user is enrolled
        let isEnrolled = false;
        if (req.user) {
            const enrollment = await prisma.enrollment.findUnique({
                where: {
                    userId_courseId: {
                        userId: req.user.id,
                        courseId: course.id
                    }
                }
            });
            isEnrolled = !!enrollment;
        }

        res.json({ course, isEnrolled });
    } catch (error) {
        next(error);
    }
});



/**
 * @route   PATCH /api/courses/:id/status
 * @desc    Update course publish status (Draft, Review, Published)
 * @access  Private/Admin
 */
router.patch('/:id/status', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'), async (req, res, next) => {
    try {
        const { status } = req.body;
        // status enum: DRAFT, IN_REVIEW, PUBLISHED, ARCHIVED

        const updateData = {
            publishStatus: status,
        };

        if (status === 'PUBLISHED') {
            updateData.isPublished = true;
            updateData.publishedAt = new Date();
        } else if (status === 'IN_REVIEW') {
            updateData.submittedForReviewAt = new Date();
        } else {
            updateData.isPublished = false;
        }

        const course = await prisma.course.update({
            where: { id: req.params.id },
            data: updateData
        });

        res.json({ message: 'Course status updated', course });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/courses
 * @desc    Create a new course (Admin/Instructor only)
 * @access  Private/Admin
 */
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'), async (req, res, next) => {
    try {
        // Pre-process empty strings to null/undefined
        const body = { ...req.body };
        ['courseCode', 'bannerUrl', 'thumbnail'].forEach(field => {
            if (body[field] === '') body[field] = undefined;
        });

        const validatedData = createCourseSchema.parse(body);

        const course = await prisma.course.create({
            data: {
                ...validatedData,
                price: validatedData.price,
                discountPrice: validatedData.discountPrice,
                instructorId: req.user.id
            }
        });

        res.status(201).json({ message: 'Course created', course });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/courses/:id/enroll
 * @desc    Enroll in a course
 * @access  Private
 */
router.post('/:id/enroll', authenticate, async (req, res, next) => {
    try {
        const course = await prisma.course.findUnique({
            where: { id: req.params.id }
        });

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (!course.isPublished) {
            return res.status(400).json({ error: 'Course is not available' });
        }

        // Check if already enrolled
        const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: req.user.id,
                    courseId: course.id
                }
            }
        });

        if (existingEnrollment) {
            return res.status(400).json({ error: 'Already enrolled in this course' });
        }

        const enrollment = await prisma.enrollment.create({
            data: {
                userId: req.user.id,
                courseId: course.id
            }
        });

        res.status(201).json({ message: 'Enrolled successfully', enrollment });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/courses/my/enrolled
 * @desc    Get user's enrolled courses
 * @access  Private
 */
router.get('/my/enrolled', authenticate, async (req, res, next) => {
    try {
        const enrollments = await prisma.enrollment.findMany({
            where: { userId: req.user.id },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        thumbnail: true,
                        category: true,
                        difficulty: true
                    }
                }
            },
            orderBy: { enrolledAt: 'desc' }
        });

        res.json({ enrollments });
    } catch (error) {
        next(error);
    }
});

const { generateCourseStructure } = require('../services/ai-course.service');

/**
 * @route   POST /api/courses/generate
 * @desc    Generate a course structure using JSON-based Gemini AI
 * @access  Private/Admin
 */
router.post('/generate', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'), async (req, res, next) => {
    try {
        const { topic, difficulty } = req.body;
        if (!topic) return res.status(400).json({ error: 'Topic is required' });

        const courseData = await generateCourseStructure(topic, difficulty);
        res.json({ courseData });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/courses/:id/curriculum
 * @desc    Update/Replace entire course curriculum (Modules + Lessons)
 * @access  Private/Admin
 */
router.put('/:id/curriculum', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'), async (req, res, next) => {
    try {
        const { modules } = req.body;
        const courseId = req.params.id;

        // Transaction to delete existing and recreate
        // Note: For a real app, we might want "upsert" logic to preserve IDs/progress
        // For V1 builder, replacing modules is simpler but destroys user progress references.
        // BETTER APPROACH: Upsert logic or checking existing IDs.

        // Since this is "Course Creation", we assume course is in Draft mainly.
        // If course is LIVE, this is dangerous. We should warn.

        await prisma.$transaction(async (tx) => {
            // Delete existing modules (cascade deletes lessons)
            await tx.module.deleteMany({ where: { courseId } });

            // Create new modules and lessons
            for (const mod of modules) {
                await tx.module.create({
                    data: {
                        courseId,
                        title: mod.title,
                        description: mod.description,
                        orderIndex: mod.orderIndex,
                        lessons: {
                            create: mod.lessons.map(l => ({
                                title: l.title,
                                content: l.content,
                                duration: l.duration,
                                order: l.order,
                                quizzes: l.quizzes ? {
                                    create: l.quizzes.map(q => ({
                                        question: q.question,
                                        options: q.options,
                                        correctAnswer: q.correctAnswer
                                    }))
                                } : undefined
                            }))
                        }
                    }
                });
            }
        });

        res.json({ message: 'Curriculum updated successfully' });
    } catch (error) {
        next(error);
    }
});
/**
 * @route   POST /api/courses/:courseId/lessons/:lessonId/complete
 * @desc    Mark a lesson as complete & check for course completion
 * @access  Private
 */
router.post('/:courseId/lessons/:lessonId/complete', authenticate, async (req, res, next) => {
    try {
        const { courseId, lessonId } = req.params;
        const userId = req.user.id;

        // 1. Mark Lesson as Complete
        await prisma.lessonProgress.upsert({
            where: {
                userId_lessonId: { userId, lessonId }
            },
            update: { isCompleted: true },
            create: {
                userId,
                lessonId,
                isCompleted: true
            }
        });

        // 2. Check Course Completion status
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                modules: {
                    include: { lessons: { select: { id: true } } }
                }
            }
        });

        if (!course) return res.status(404).json({ error: 'Course not found' });

        // Flatten all lesson IDs
        const allLessonIds = course.modules.flatMap(m => m.lessons.map(l => l.id));
        const totalLessons = allLessonIds.length;

        // Count user's completed lessons for this course
        const completedCount = await prisma.lessonProgress.count({
            where: {
                userId,
                isCompleted: true,
                lessonId: { in: allLessonIds }
            }
        });

        let isCourseCompleted = false;

        // 3. If All Complete -> Update Enrollment & Send Email
        if (completedCount === totalLessons && totalLessons > 0) {
            const enrollment = await prisma.enrollment.findUnique({
                where: { userId_courseId: { userId, courseId } }
            });

            if (enrollment && !enrollment.completedAt) {
                // First time completion
                await prisma.enrollment.update({
                    where: { id: enrollment.id },
                    data: { completedAt: new Date(), status: 'COMPLETED' }
                });

                isCourseCompleted = true;

                // Fire Email Event
                const { sendCertificateEmail } = require('../services/email.service');
                sendCertificateEmail(req.user, course).catch(err => console.error('Email error:', err));
            }
        }

        res.json({
            message: 'Progress updated',
            progress: Math.round((completedCount / totalLessons) * 100),
            isCompleted: isCourseCompleted
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
