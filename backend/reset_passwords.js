const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetPasswords() {
    try {
        const hashedPassword = await bcrypt.hash('password123', 10);

        const emails = ['admin@techwell.com', 'employer@techwell.com', 'student@techwell.com'];

        const result = await prisma.user.updateMany({
            where: {
                email: { in: emails }
            },
            data: {
                password: hashedPassword,
                isActive: true
            }
        });

        console.log(`Updated passwords for ${result.count} users to 'password123'.`);

        // Also ensure they have the right roles just in case
        await prisma.user.upsert({
            where: { email: 'admin@techwell.com' },
            update: { role: 'SUPER_ADMIN' },
            create: { email: 'admin@techwell.com', name: 'Super Admin', password: hashedPassword, role: 'SUPER_ADMIN' }
        });

        await prisma.user.upsert({
            where: { email: 'employer@techwell.com' },
            update: { role: 'EMPLOYER' },
            create: { email: 'employer@techwell.com', name: 'Demo Employer', password: hashedPassword, role: 'EMPLOYER' }
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

resetPasswords();
