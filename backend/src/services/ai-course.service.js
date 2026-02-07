/**
 * AI Course Generation Service
 * Uses Google Gemini to generate comprehensive course curriculums.
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

const generateCourseStructure = async (topic, difficulty) => {
    if (!genAI) {
        console.warn("Gemini API Key missing. Falling back to mock.");
        return mockGenerate(topic, difficulty);
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const prompt = `
        Act as an expert curriculum designer and subject matter expert.
        Create a comprehensive professional course structure for the topic: "${topic}".
        Difficulty Level: ${difficulty}.
        
        The output MUST be valid JSON strictly following this schema:
        {
            "title": "Engaging Course Title",
            "description": "2-3 sentence marketing description",
            "category": "Technology/Business/Design/etc",
            "difficulty": "${difficulty}",
            "price": Number (approximate market price in INR, e.g. 4999),
            "discountPrice": Number (slightly lower than price),
            "courseCode": "Short alphanumeric code (e.g. REACT-101)",
            "jobRoles": ["Role 1", "Role 2"],
            "bannerUrl": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
            "modules": [
                {
                    "title": "Module Title",
                    "description": "Brief description",
                    "orderIndex": 0,
                    "lessons": [
                        {
                            "title": "Lesson Title",
                            "content": "Detailed outline of what will be covered (2-3 sentences)",
                            "duration": Number (estimated seconds, e.g. 600 for 10 mins),
                            "order": 0,
                            "quizzes": [
                                {
                                    "question": "Multiple choice question",
                                    "options": ["Option A", "Option B", "Option C", "Option D"],
                                    "correctAnswer": "Option A"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
        
        Requirements:
        1. Generate at least 4 Modules.
        2. Each Module must have at least 3 Lessons.
        3. Include at least 1 Quiz per Module (attached to the last lesson).
        4. "bannerUrl" should be a relevant Unsplash ID (keep the provided one as fallback if unsure).
        5. Ensure content is high-quality and relevant to the difficulty level.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const courseData = JSON.parse(jsonStr);
        return courseData;

    } catch (error) {
        console.error("Gemini Generation Error:", error);
        // Fallback to mock on error
        return mockGenerate(topic, difficulty);
    }
};

const mockGenerate = (topic, difficulty) => {
    const level = difficulty || 'BEGINNER';
    const modules = [];

    // Module 1: Introduction
    modules.push({
        title: `Introduction to ${topic}`,
        description: `Get started with the basics of ${topic}`,
        orderIndex: 0,
        lessons: [
            { title: `What is ${topic}?`, content: `Overview of ${topic} and its importance.`, duration: 300, order: 0 },
            { title: `Setting up your environment`, content: `Installation and setup guide.`, duration: 600, order: 1 }
        ]
    });

    return {
        title: `Mastering ${topic} (Fallback)`,
        description: `Generated (Mock) because AI service is unavailable.`,
        category: 'Technology',
        difficulty: level,
        price: 2999,
        discountPrice: 1999,
        courseCode: `${topic.substring(0, 3).toUpperCase()}-101`,
        jobRoles: [`${topic} Developer`],
        bannerUrl: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&q=80",
        modules
    };
}

module.exports = {
    generateCourseStructure
};
