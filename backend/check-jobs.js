const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkJobs() {
    const jobs = await prisma.job.findMany({
        include: { employer: true }
    });
    console.log('Total Jobs:', jobs.length);
    jobs.forEach(job => {
        console.log(`- Job: ${job.title}, Employer: ${job.employer.email} (ID: ${job.employerId})`);
    });

    // Also check the employer we created
    const employer = await prisma.user.findUnique({ where: { email: 'employer@techwell.com' } });
    if (employer) {
        console.log('Employer "employer@techwell.com" ID:', employer.id);
    }
}

checkJobs()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
