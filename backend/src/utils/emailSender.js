const nodemailer = require('nodemailer');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const sendEmail = async ({ to, subject, text, html, templateParams }) => {
    try {
        const config = await prisma.emailIntegration.findFirst({
            where: { isActive: true }
        });

        if (!config) {
            console.log('No active email configuration found.');
            return false;
        }

        if (config.provider === 'EMAILJS') {
            const emailJsData = {
                service_id: config.serviceId,
                template_id: config.templateId,
                user_id: config.publicKey,
                accessToken: config.privateKey,
                template_params: {
                    to_email: to,
                    subject,
                    message: text,
                    ...templateParams
                }
            };
            await axios.post('https://api.emailjs.com/api/v1.0/email/send', emailJsData);
            console.log(`Email sent via EmailJS to ${to}`);
            return true;

        } else if (config.provider === 'SMTP') {
            const transporter = nodemailer.createTransport({
                host: config.host,
                port: config.port,
                secure: config.port === 465,
                auth: {
                    user: config.user,
                    pass: config.pass
                }
            });

            await transporter.sendMail({
                from: config.fromEmail || config.user,
                to,
                subject,
                text,
                html
            });
            console.log(`Email sent via SMTP to ${to}`);
            return true;
        }

    } catch (error) {
        console.error('Email Sending Failed:', error.message);
        return false;
    }
};

module.exports = { sendEmail };
