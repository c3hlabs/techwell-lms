/**
 * Meeting Service
 * Generates meeting links from configured video integrations.
 * 
 * Supports: ZOOM, GOOGLE_MEET, MS_TEAMS
 * 
 * Mock implementation for V1 - generates placeholder links.
 * Production: Add OAuth flows and actual API calls.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get the active video integration
 * @returns {Promise<Object|null>} Active integration or null
 */
const getActiveIntegration = async () => {
    return await prisma.videoIntegration.findFirst({
        where: { isActive: true }
    });
};

/**
 * Generate a meeting link based on the configured platform
 * @param {string} scheduledAt - ISO date string for the meeting
 * @param {Object} options - Additional options (title, duration, etc.)
 * @returns {Promise<{platform: string, meetingLink: string}>}
 */
const generateMeetingLink = async (scheduledAt, options = {}) => {
    const integration = await getActiveIntegration();

    if (!integration) {
        // No integration configured - return a generic placeholder
        console.log('⚠️ No active video integration found. Using placeholder link.');
        return {
            platform: 'MANUAL',
            meetingLink: null // Employer will add manually
        };
    }

    const { platform, apiKey, clientId, clientSecret } = integration;
    const meetingId = generateMeetingId();
    const title = options.title || 'TechWell Interview';
    const duration = options.duration || 30;

    let meetingLink = '';

    switch (platform) {
        case 'ZOOM':
            // Mock Zoom link generation
            // Production: Use Zoom API - POST /users/{userId}/meetings
            meetingLink = `https://zoom.us/j/${meetingId}?pwd=TechWell${Date.now().toString(36)}`;
            console.log(`📹 Generated Zoom meeting link: ${meetingLink}`);
            break;

        case 'GOOGLE_MEET':
            // Mock Google Meet link generation
            // Production: Use Google Calendar API with conferenceDataVersion
            const meetCode = generateMeetCode();
            meetingLink = `https://meet.google.com/${meetCode}`;
            console.log(`📹 Generated Google Meet link: ${meetingLink}`);
            break;

        case 'MS_TEAMS':
            // Mock Teams link generation
            // Production: Use Microsoft Graph API - POST /me/onlineMeetings
            meetingLink = `https://teams.microsoft.com/l/meetup-join/19%3Ameeting_${meetingId}%40thread.v2/0`;
            console.log(`📹 Generated MS Teams link: ${meetingLink}`);
            break;

        default:
            console.log(`⚠️ Unknown platform: ${platform}. No link generated.`);
            return { platform, meetingLink: null };
    }

    return {
        platform,
        meetingLink
    };
};

/**
 * Generate a random meeting ID (Zoom-style)
 */
const generateMeetingId = () => {
    return Math.floor(100000000 + Math.random() * 900000000).toString();
};

/**
 * Generate a Google Meet style code (xxx-xxxx-xxx)
 */
const generateMeetCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const part1 = Array(3).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
    const part2 = Array(4).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
    const part3 = Array(3).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `${part1}-${part2}-${part3}`;
};

module.exports = {
    generateMeetingLink,
    getActiveIntegration
};
