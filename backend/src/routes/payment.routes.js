const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Helper to mask secrets
const mask = (str) => str ? `${str.substring(0, 4)}...${str.substring(str.length - 4)}` : '';

// GET /api/payment/config
router.get('/config', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), async (req, res) => {
    try {
        let config = await prisma.paymentConfig.findFirst();
        if (!config) {
            // Return default empty struct
            return res.json({
                razorpayKeyId: '',
                razorpayKeySecret: '',
                stripePublishableKey: '',
                stripeSecretKey: '',
                activeGateway: 'NONE',
                currency: 'INR'
            });
        }

        // Return masked secrets
        res.json({
            ...config,
            razorpayKeySecret: mask(config.razorpayKeySecret),
            stripeSecretKey: mask(config.stripeSecretKey)
        });
    } catch (error) {
        console.error("Payment Config Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch config" });
    }
});

// PUT /api/payment/config
router.put('/config', authenticate, authorize(['SUPER_ADMIN']), async (req, res) => {
    try {
        const {
            razorpayKeyId, razorpayKeySecret,
            stripePublishableKey, stripeSecretKey,
            activeGateway, currency
        } = req.body;

        // Find existing to check if secret is being updated or kept same
        const existing = await prisma.paymentConfig.findFirst();

        const data = {
            razorpayKeyId,
            stripePublishableKey,
            activeGateway,
            currency
        };

        // Only update secrets if they differ from masked version (meaning user typed new one)
        // Simple logic: if input includes "...", ignore it. If full string, save it.
        // Better logic: user sends "UNCHANGED" or null. But for now we assume masking format.
        if (razorpayKeySecret && !razorpayKeySecret.includes('...')) {
            data.razorpayKeySecret = razorpayKeySecret;
        }
        if (stripeSecretKey && !stripeSecretKey.includes('...')) {
            data.stripeSecretKey = stripeSecretKey;
        }

        if (existing) {
            const updated = await prisma.paymentConfig.update({
                where: { id: existing.id },
                data
            });
            res.json(updated);
        } else {
            const created = await prisma.paymentConfig.create({
                data: {
                    ...data,
                    // If creates new, must use provided secrets (even if empty)
                    razorpayKeySecret: razorpayKeySecret || '',
                    stripeSecretKey: stripeSecretKey || ''
                }
            });
            res.json(created);
        }
    } catch (error) {
        console.error("Payment Config Update Error:", error);
        res.status(500).json({ error: "Failed to update config" });
    }
});



// POST /api/payments/create-order (Generic for User Checkout)
router.post('/create-order', authenticate, async (req, res) => {
    try {
        const { amount, currency = "INR" } = req.body;
        const config = await prisma.paymentConfig.findFirst();

        if (!config || config.activeGateway === 'NONE') {
            return res.status(400).json({ error: "Payment gateway is not configured" });
        }

        if (config.activeGateway === 'RAZORPAY') {
            const Razorpay = require('razorpay');
            const razorpay = new Razorpay({
                key_id: config.razorpayKeyId,
                key_secret: config.razorpayKeySecret
            });

            const options = {
                amount: amount * 100, // amount in paisa
                currency: currency,
                receipt: `receipt_${Date.now()}`
            };
            const order = await razorpay.orders.create(options);
            return res.json({
                gateway: 'RAZORPAY',
                orderId: order.id,
                keyId: config.razorpayKeyId,
                amount: options.amount
            });
        }

        else if (config.activeGateway === 'STRIPE') {
            const stripe = require('stripe')(config.stripeSecretKey);
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount * 100, // amount in smallest currency unit
                currency: currency.toLowerCase(),
                automatic_payment_methods: { enabled: true },
            });
            return res.json({
                gateway: 'STRIPE',
                clientSecret: paymentIntent.client_secret,
                publishableKey: config.stripePublishableKey
            });
        }

    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({ error: "Payment initiation failed" });
    }
});

module.exports = router;
