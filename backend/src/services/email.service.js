/**
 * Email Service
 * Handles sending emails for various events.
 * Currently logs to console/file for V1/Dev.
 * Future: Integrate SendGrid/AWS SES.
 */

const sendEmail = async (to, subject, html) => {
    // In production, we would use a real provider here
    console.log(`\n================ EMAIL SENT ================`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    // console.log(`Body: ${html}`); // Too verbose for console
    console.log(`============================================\n`);

    return true;
};

const sendWelcomeEmail = async (user) => {
    const subject = 'Welcome to TechWell!';
    const html = `
        <h1>Welcome, ${user.name}!</h1>
        <p>Thanks for joining TechWell. We're excited to have you.</p>
        <p>Explore our courses and start your journey today.</p>
    `;
    return sendEmail(user.email, subject, html);
};

const sendCertificateEmail = async (user, course) => {
    const subject = `Certificate Earned: ${course.title}`;
    const html = `
        <h1>Congratulations, ${user.name}!</h1>
        <p>You have successfully completed <strong>${course.title}</strong>.</p>
        <p>You can download your certificate from your dashboard.</p>
    `;
    return sendEmail(user.email, subject, html);
};

module.exports = {
    sendWelcomeEmail,
    sendCertificateEmail
};
