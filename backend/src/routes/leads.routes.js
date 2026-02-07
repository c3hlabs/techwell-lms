const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const csv = require('csv-parser');
const fs = require('fs');
const multer = require('multer');

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/temp/' });

/**
 * @route   GET /api/leads
 * @desc    Get all leads with filtering
 * @access  Private/Admin
 */
router.get('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { status, source, startDate, endDate, college, location } = req.query;

        const where = {};
        if (status && status !== 'ALL') where.status = status;
        if (source && source !== 'ALL') where.source = source;
        if (college) where.college = { contains: college, mode: 'insensitive' };
        if (location) where.location = { contains: location, mode: 'insensitive' };

        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        const leads = await prisma.lead.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { tasks: true }
                }
            }
        });

        res.json(leads);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/leads
 * @desc    Create a new lead
 * @access  Private/Admin
 */
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { name, email, phone, source, college, qualification, location, dob, notes } = req.body;

        const lead = await prisma.lead.create({
            data: {
                name,
                email,
                phone,
                source,
                college,
                qualification,
                location,
                dob: dob ? new Date(dob) : null,
                notes,
                status: 'NEW'
            }
        });

        // Auto-Reply (Lead Follow-up Automation)
        if (email) {
            const { sendEmail } = require('../utils/emailSender');
            // Non-blocking email send
            sendEmail({
                to: email,
                subject: 'Welcome to TechWell - Your Journey Begins!',
                text: `Hi ${name},\n\nThank you for exploring TechWell. We have received your interest and a career counselor will be in touch shortly.\n\nBest Regards,\nTechWell Team`,
                html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #1469E2;">Welcome to TechWell, ${name}!</h2>
                        <p>Thank you for expressing interest in our career programs.</p>
                        <p>We are dedicated to helping you land your dream job in tech.</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p><strong>Next Steps:</strong></p>
                        <ul>
                            <li>Our team will review your profile.</li>
                            <li>You will receive a call/message within 24 hours.</li>
                            <li>Explore our <a href="https://techwell.co.in/courses">Free Courses</a> in the meantime.</li>
                        </ul>
                        <br/>
                        <p>Best Regards,<br/><strong>The TechWell Team</strong></p>
                       </div>`
            }).catch(err => console.error('Auto-Reply Failed:', err.message));
        }

        res.status(201).json(lead);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/leads/:id
 * @desc    Update lead status or details
 * @access  Private/Admin
 */
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { status, assignedTo, notes, ...updateData } = req.body;

        const lead = await prisma.lead.update({
            where: { id: req.params.id },
            data: {
                ...updateData,
                status,
                assignedTo,
                notes
            }
        });

        res.json(lead);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/leads/import
 * @desc    Import leads from CSV
 * @access  Private/Admin
 */
router.post('/import', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), upload.single('file'), async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    const results = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                // Bulk create leads
                // Expected CSV headers: Name, Email, Phone, Source, College, Location
                const leadsToCreate = results.map(row => ({
                    name: row.Name || row.name,
                    email: row.Email || row.email,
                    phone: row.Phone || row.phone,
                    source: row.Source || row.source || 'Imported',
                    college: row.College || row.college,
                    location: row.Location || row.location,
                    status: 'NEW'
                }));

                const createdCount = await prisma.lead.createMany({
                    data: leadsToCreate,
                    skipDuplicates: true
                });

                // Cleanup temp file
                fs.unlinkSync(req.file.path);

                res.json({ message: `Successfully imported ${createdCount.count} leads` });
            } catch (error) {
                next(error);
            }
        });
});

/**
 * @route   GET /api/leads/analytics
 * @desc    Get advanced analytics for dashboard
 * @access  Private/Admin
 */
router.get('/analytics', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        // Date filter if provided
        const dateFilter = (startDate && endDate) ? {
            createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
        } : {};

        const [
            totalLeads,
            leadsByStatus,
            leadsBySource,
            leadsByCollege,
            leadsByLocation,
            revenue
        ] = await Promise.all([
            prisma.lead.count({ where: dateFilter }),
            prisma.lead.groupBy({
                by: ['status'],
                _count: true,
                where: dateFilter
            }),
            prisma.lead.groupBy({
                by: ['source'],
                _count: true,
                where: dateFilter
            }),
            prisma.lead.groupBy({
                by: ['college'],
                _count: true,
                where: { ...dateFilter, college: { not: null } },
                orderBy: { _count: { id: 'desc' } },
                take: 5
            }),
            prisma.lead.groupBy({
                by: ['location'],
                _count: true,
                where: { ...dateFilter, location: { not: null } },
                orderBy: { _count: { id: 'desc' } },
                take: 5
            }),
            prisma.payment.aggregate({
                where: { status: 'SUCCESS' }, // Add date filter here if needed
                _sum: { amount: true }
            })
        ]);

        res.json({
            summary: {
                totalLeads,
                totalRevenue: revenue._sum.amount || 0
            },
            charts: {
                status: leadsByStatus,
                source: leadsBySource,
                college: leadsByCollege,
                location: leadsByLocation
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/leads/:id
 * @desc    Delete a lead
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        await prisma.lead.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Lead deleted successfully' });
    } catch (error) {
        next(error);
    }
});

// ============= MARKETING INTEGRATIONS =============

/**
 * @route   GET /api/leads/integrations
 * @desc    Get configured lead sources
 * @access  Private/Admin
 */
router.get('/integrations', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        // Mask secrets
        const integrations = await prisma.marketingIntegration.findMany({
            orderBy: { createdAt: 'desc' }
        });

        const safeData = integrations.map(i => ({
            ...i,
            accessToken: i.accessToken ? '****' : null,
            webhookSecret: i.webhookSecret ? '****' : null
        }));

        res.json(safeData);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/leads/integrations
 * @desc    Configure a lead source (Meta, Google, JustDial)
 * @access  Private/Admin
 */
router.post('/integrations', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
    try {
        const { platform, name, accessToken, pageId, accountId, webhookSecret } = req.body;

        const integration = await prisma.marketingIntegration.create({
            data: {
                platform,
                name: name || platform,
                accessToken,
                pageId,
                accountId,
                webhookSecret,
                isActive: true
            }
        });

        res.status(201).json({ message: 'Integration configured', id: integration.id });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/leads/webhook/meta
 * @desc    Meta (Facebook/Instagram) Verification Handshake
 * @access  Public
 */
router.get('/webhook/meta', async (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // In a real app, verify 'token' against stored 'webhookSecret' in DB
    // For now, we accept any token matching 'techwell_meta_secret'
    if (mode && token) {
        if (token === 'techwell_meta_secret') {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
});

/**
 * @route   POST /api/leads/webhook/meta
 * @desc    Receive Leads from Meta (Facebook/Instagram)
 * @access  Public
 */
router.post('/webhook/meta', async (req, res) => {
    try {
        const body = req.body;

        if (body.object === 'page') {
            // Process each entry (leadgen)
            for (const entry of body.entry) {
                const changes = entry.changes;
                for (const change of changes) {
                    if (change.field === 'leadgen') {
                        const leadGenId = change.value.leadgen_id;
                        const pageId = change.value.page_id;
                        const formId = change.value.form_id;
                        const createdTime = change.value.created_time;

                        console.log(`[Meta Webhook] Received Lead ${leadGenId} from Page ${pageId}`);

                        // Here we would call Graph API to get lead details using leadGenId and our Access Token
                        // Since we don't have a real Token, we will simulate lead creation for the demo
                        // In production: const leadDetails = await fetch(`https://graph.facebook.com/v19.0/${leadGenId}?access_token=...`)

                        // Creating mock lead for demo
                        await prisma.lead.create({
                            data: {
                                name: `Meta Lead ${leadGenId.substring(0, 6)}`,
                                email: `user_${leadGenId}@facebook.com`,
                                source: 'META_ADS',
                                platform: 'META',
                                formId: formId,
                                adId: change.value.ad_id,
                                adGroupId: change.value.adgroup_id,
                                campaignId: change.value.campaign_id,
                                status: 'NEW',
                                notes: `Imported from Meta Lead Ads via Webhook at ${new Date(createdTime * 1000).toISOString()}`
                            }
                        });
                    }
                }
            }
            res.status(200).send('EVENT_RECEIVED');
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.error('Meta Webhook Error:', error);
        res.sendStatus(500);
    }
});

/**
 * @route   POST /api/leads/webhook/generic
 * @desc    Receive Leads from JustDial / Custom Sources
 * @access  Public (Protected by API Key in Header usually, or just valid Data)
 */
router.post('/webhook/generic', async (req, res) => {
    try {
        const { source, name, mobile, email, city, category, area } = req.body;

        // JustDial payload usually varies, we map common fields
        const leadName = name || 'Unknown Lead';
        const leadPhone = mobile || req.body.phone;
        const leadEmail = email || req.body.email_id;
        const leadSource = source || 'JustDial'; // Default

        const lead = await prisma.lead.create({
            data: {
                name: leadName,
                phone: leadPhone,
                email: leadEmail,
                location: city || area,
                source: leadSource.toUpperCase(),
                platform: 'JUSTDIAL',
                status: 'NEW',
                notes: `Interest: ${category || 'General'}. JSON: ${JSON.stringify(req.body)}`
            }
        });

        res.status(201).json({ success: true, leadId: lead.id });
    } catch (error) {
        console.error('Generic Webhook Error:', error);
        res.status(500).json({ error: 'Failed to ingest lead' });
    }
});

module.exports = router;
