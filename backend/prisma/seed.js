const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...\n');

    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create Users (skip if exists)
    let superAdmin = await prisma.user.findUnique({ where: { email: 'admin@techwell.com' } });
    if (!superAdmin) {
        superAdmin = await prisma.user.create({
            data: {
                email: 'admin@techwell.com',
                password: hashedPassword,
                name: 'Super Admin',
                role: 'SUPER_ADMIN',
                isActive: true,
                emailVerified: true,
            },
        });
        console.log('✅ Created Super Admin');
    } else {
        console.log('⏭️  Super Admin exists');
    }

    let instructor = await prisma.user.findUnique({ where: { email: 'instructor@techwell.com' } });
    if (!instructor) {
        instructor = await prisma.user.create({
            data: {
                email: 'instructor@techwell.com',
                password: hashedPassword,
                name: 'John Instructor',
                role: 'INSTRUCTOR',
                isActive: true,
                emailVerified: true,
            },
        });
        console.log('✅ Created Instructor');
    } else {
        console.log('⏭️  Instructor exists');
    }

    let student = await prisma.user.findUnique({ where: { email: 'student@techwell.com' } });
    if (!student) {
        student = await prisma.user.create({
            data: {
                email: 'student@techwell.com',
                password: hashedPassword,
                name: 'Jane Student',
                role: 'STUDENT',
                isActive: true,
                emailVerified: true,
            },
        });
        console.log('✅ Created Student');
    } else {
        console.log('⏭️  Student exists');
    }

    // Give Jane Pro access (interview access)
    const existingProEnrollment = await prisma.enrollment.findFirst({
        where: { userId: student.id, hasInterviewAccess: true }
    });
    if (!existingProEnrollment) {
        // Find any course to enroll in
        const anyCourse = await prisma.course.findFirst();
        if (anyCourse) {
            await prisma.enrollment.create({
                data: {
                    userId: student.id,
                    courseId: anyCourse.id,
                    hasInterviewAccess: true,
                    status: 'ACTIVE'
                }
            });
            console.log('✅ Gave Jane Pro interview access');
        }
    } else {
        console.log('⏭️  Jane already has Pro access');
    }


    // Create Courses
    const coursesData = [
        { title: 'Complete Web Development Bootcamp', description: 'Master HTML, CSS, JavaScript, React, Node.js and more.', category: 'WEB_DEV', difficulty: 'BEGINNER', duration: 40, price: 4999 },
        { title: 'Advanced React & Next.js Masterclass', description: 'Deep dive into React patterns, Next.js 14, Server Components.', category: 'WEB_DEV', difficulty: 'ADVANCED', duration: 25, price: 5999 },
        { title: 'Data Science with Python', description: 'Learn Python, Pandas, NumPy, Machine Learning basics.', category: 'DATA_SCIENCE', difficulty: 'INTERMEDIATE', duration: 35, price: 6999 },
        { title: 'Cloud Computing with AWS', description: 'Master AWS services including EC2, S3, Lambda.', category: 'CLOUD', difficulty: 'INTERMEDIATE', duration: 30, price: 7999 },
        { title: 'Mobile App Development with React Native', description: 'Build cross-platform iOS and Android apps.', category: 'MOBILE', difficulty: 'INTERMEDIATE', duration: 28, price: 5499 },
        { title: 'Machine Learning & AI Fundamentals', description: 'Introduction to ML algorithms and neural networks.', category: 'AI_ML', difficulty: 'ADVANCED', duration: 45, price: 8999 },
    ];

    for (const data of coursesData) {
        const existing = await prisma.course.findFirst({ where: { title: data.title } });
        if (!existing) {
            const course = await prisma.course.create({
                data: {
                    ...data,
                    instructorId: instructor.id,
                    isPublished: true,
                },
            });
            console.log('✅ Created Course:', data.title);

            // Add modules
            for (let i = 0; i < 4; i++) {
                await prisma.module.create({
                    data: {
                        courseId: course.id,
                        title: ['Getting Started', 'Core Concepts', 'Practical Projects', 'Advanced Topics'][i],
                        description: 'Module description',
                        orderIndex: i,
                    },
                });
            }
        } else {
            console.log('⏭️  Course exists:', data.title);
        }
    }

    // Create sample interview
    const existingInterview = await prisma.interview.findFirst({ where: { userId: student.id } });
    if (!existingInterview) {
        await prisma.interview.create({
            data: {
                userId: student.id,
                domain: 'TECHNOLOGY',
                role: 'Frontend Developer',
                company: 'Google',
                difficulty: 'INTERMEDIATE',
                status: 'COMPLETED',
                scheduledAt: new Date(),
                completedAt: new Date(),
            },
        });
        console.log('✅ Created Sample Interview');
    }

    console.log('\n🎉 Seed completed!\n');
    console.log('📋 Test Credentials:');
    console.log('   admin@techwell.com / password123');
    console.log('   instructor@techwell.com / password123');
    console.log('   student@techwell.com / password123');
}

main()
    .catch((e) => {
        console.error('Seed error:', e.message);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
