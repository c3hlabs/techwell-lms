const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listUsers() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
                password: true // Only length/existence check conceptually, but let's print partial hash
            }
        });
        console.log("Total Users:", users.length);
        users.forEach(u => {
            console.log(`Email: ${u.email} | Role: ${u.role} | Active: ${u.isActive} | PwdHashLen: ${u.password?.length}`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

listUsers();
