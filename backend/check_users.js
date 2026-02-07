const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listUsers() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true
            }
        });
        console.table(users);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

listUsers();
