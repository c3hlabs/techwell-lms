const prisma = require('../lib/prisma');

class InterviewService {

    // Adaptive Logic: Adjusts question difficulty based on previous score
    // history: Array of { questionId, score (0-100) }
    static async generateAdaptiveQuestion(domain, history = []) {
        let targetDifficulty = 'INTERMEDIATE'; // Default

        // 1. Analyze recent performance
        if (history.length > 0) {
            const lastScore = history[history.length - 1].score || 0;

            if (lastScore > 80) targetDifficulty = 'ADVANCED';
            else if (lastScore < 40) targetDifficulty = 'BEGINNER';
            else targetDifficulty = 'INTERMEDIATE';
        }

        // 2. Fetch random question from KnowledgeBase matching criteria
        // (In real app, use Vector DB / AI here. For now, DB query)
        const count = await prisma.knowledgeBase.count({
            where: {
                domain,
                difficulty: targetDifficulty
            }
        });

        const skip = Math.floor(Math.random() * count);

        const question = await prisma.knowledgeBase.findFirst({
            where: {
                domain,
                difficulty: targetDifficulty
            },
            skip: skip || 0
        });

        return {
            question: question?.content || "Tell me about yourself.",
            difficulty: targetDifficulty,
            topic: question?.topic || "Intro"
        };
    }

    // Evaluate response (mock AI for now, replace with OpenAI/Gemini call)
    static async evaluateResponse(question, answer) {
        // Mock Scoring Logic
        const length = answer.length;
        let score = 50;
        let feedback = "Answer is too short.";

        if (length > 50) { score = 70; feedback = "Good points but elaborate more."; }
        if (length > 100) { score = 85; feedback = "Excellent, detailed answer using STAR method."; }

        return {
            score,
            feedback,
            sentiment: length > 50 ? "POSITIVE" : "NEUTRAL"
        };
    }
}

module.exports = InterviewService;
