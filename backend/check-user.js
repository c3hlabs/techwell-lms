const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function check() {
    const user = await prisma.user.findUnique({
        where: { email: 'student@techwell.com' }
    });

    if (user) {
        console.log('User found:');
        console.log('  Email:', user.email);
        console.log('  isActive:', user.isActive);

        // Test password
        const testPassword = 'password123';
        const isMatch = await bcrypt.compare(testPassword, user.password);
        console.log('  Password "password123" matches:', isMatch);
        console.log('  Stored hash starts with:', user.password.substring(0, 20) + '...');
    } else {
        console.log('User NOT found!');
    }

    await prisma.$disconnect();
}

check().catch(console.error);
