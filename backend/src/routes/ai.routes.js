const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { authenticate } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Initialize Gemini
const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

// Middleware to optionally authenticate (don't fail if no token)
const optionalAuth = (req, res, next) => {
    // Capture token from header if present
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        authenticate(req, res, (err) => {
            // If valid token, req.user will be set. If invalid/expired, we treat as guest.
            if (err) {
                req.user = null;
            }
            next();
        });
    } else {
        req.user = null;
        next();
    }
};

/**
 * @route   POST /api/ai/chat
 * @desc    Chat with AI Assistant (Handles Auth & Guest/Lead)
 * @access  Public
 */
router.post('/chat', optionalAuth, async (req, res, next) => {
    try {
        // leadDetails: { name, email, phone } - Only required for FIRST Guest message
        const { message, history, leadDetails } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        let userContext = "";
        let systemRole = "";

        // ==========================================
        // SCENARIO 1: LOGGED IN USER
        // ==========================================
        if (req.user) {
            const user = await prisma.user.findUnique({
                where: { id: req.user.id },
                include: {
                    enrollments: {
                        include: { course: { select: { title: true } } }
                    }
                }
            });

            const enrolledCourses = user.enrollments.map(e => e.course.title).join(', ');
            userContext = `User: ${user.name} (${user.role}). Enrolled in: ${enrolledCourses || 'None'}.`;
            systemRole = `
            You are "TechWell Bot", a smart teaching assistant.
            - Answer course-specific questions based on their enrollment.
            - Provide technical guidance on the platform.
            - If stumped, refer to support ticket system.
            `;
        }

        // ==========================================
        // SCENARIO 2: GUEST (LEAD)
        // ==========================================
        else {
            // Check if we need to create a lead (only if details provided)
            if (leadDetails && leadDetails.name && (leadDetails.email || leadDetails.phone)) {
                try {
                    // Check if lead already exists (simple dedupe by email or phone)
                    let existingLead = null;
                    if (leadDetails.email) {
                        existingLead = await prisma.lead.findFirst({ where: { email: leadDetails.email } });
                    }

                    if (!existingLead) {
                        await prisma.lead.create({
                            data: {
                                name: leadDetails.name,
                                email: leadDetails.email || null,
                                phone: leadDetails.phone || null,
                                source: 'AI Chatbot',
                                status: 'NEW',
                                notes: `Initial query: ${message}`,
                                location: 'Auto-detected via Chat',
                            }
                        });
                        console.log("New Lead created from Chatbot:", leadDetails.name);
                    }
                } catch (err) {
                    console.error("Failed to create lead:", err);
                    // Continue chatting even if lead creation fails (don't block user)
                }
            }

            userContext = `User: Guest / Prospective Student. Name: ${leadDetails?.name || 'Visitor'}.`;
            systemRole = `
            You are "TechWell Receptionist", the front-desk AI.
            - Your goal is to explain our services, courses, and pricing to potential students.
            - Be welcoming, professional, and persuasive.
            - Commonly asked: "What courses do you offer?", "Fees?", "Placement?". Answer generally about Tech & Business courses.
            - If they ask for sensitive info (student profiles, deeper tech docs), politely ask them to Login.
            `;
        }

        // ==========================================
        // AI GENERATION
        // ==========================================
        const prompt = `
        ${systemRole}
        ${userContext}
        
        Guidelines:
        - Keep answers concise (max 3-4 sentences unless detailed explanation needed).
        - Use proper formatting (bullet points) if listing items.
        - Do NOT make up fake course prices if you don't know, just say "varies by course".
        `;

        let aiResponse = "";

        if (genAI) {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const chat = model.startChat({
                history: history || [],
                systemInstruction: prompt,
            });

            const result = await chat.sendMessage(message);
            const response = await result.response;
            aiResponse = response.text();
        } else {
            console.warn("GEMINI_API_KEY missing");
            aiResponse = `[MOCK AI] Hello ${req.user ? req.user.name : (leadDetails?.name || 'Guest')}! I received: "${message}". I am simulating a response because the AI key is not configured.`;
        }

        res.json({ message: aiResponse });

    } catch (error) {
        console.error("AI Chat Error:", error);
        res.json({ message: "I'm having a brief brain freeze. Please type that again!" });
    }
});

/**
 * @route   POST /api/ai/draft-email
 * @desc    Generate a sales email based on lead info
 * @access  Private (Admins)
 */
router.post('/draft-email', authenticate, async (req, res) => {
    try {
        const { leadId, topic } = req.body;

        let context = "";
        if (leadId) {
            const lead = await prisma.lead.findUnique({ where: { id: leadId } });
            if (lead) {
                context = `Lead Name: ${lead.name}, Source: ${lead.source}, Notes: ${lead.notes}, Interest: ${lead.college || 'General'}`;
            }
        }

        const prompt = `
        You are a highly professional sales manager at "TechWell".
        Write a short, persuasive email to a potential student.
        
        Context:
        ${context}
        Topic: ${topic || 'Follow up on inquiry'}
        
        Format your response as valid JSON:
        {
          "subject": "Email Subject Line",
          "body": "Email Body Text (use \\n for new lines)"
        }
        `;

        if (!genAI) {
            return res.json({
                subject: "Follow up regarding your inquiry at TechWell",
                body: `Hello ${context ? context.split(',')[0].split(':')[1] : 'there'},\n\nI noticed you inquired about our courses. We have new batches starting soon!\n\nBest,\nTechWell Team`
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean markdown code blocks if any
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const json = JSON.parse(cleanText);
            res.json(json);
        } catch (e) {
            // Fallback if AI didn't return perfect JSON
            res.json({ subject: "TechWell Inquiry", body: text });
        }

    } catch (error) {
        console.error("AI Draft Error:", error);
        res.status(500).json({ error: "Failed to draft email" });
    }
});

/**
 * @route   POST /api/ai/send-email (Simulated)
 */
router.post('/send-email', authenticate, async (req, res) => {
    const { to, subject, body } = req.body;
    console.log("======================================");
    console.log(`[MOCK EMAIL SENT]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    console.log("======================================");

    // Simulate delay
    setTimeout(() => {
        res.json({ success: true, message: "Email sent successfully (Simulated)" });
    }, 1000);
});

module.exports = router;
