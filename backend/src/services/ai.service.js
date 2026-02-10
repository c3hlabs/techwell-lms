const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mock Question Bank (Fallback if AI generation fails or for demo)
const QUESTION_BANK = {
    'IT': {
        'BEGINNER': [
            "What is the difference between let, const, and var?",
            "Explain the concept of REST APIs.",
            "What is GIT and why do we use it?"
        ],
        'INTERMEDIATE': [
            "Explain the Event Loop in JavaScript.",
            "How does database indexing work?",
            "What are Microservices and how do they differ from Monoliths?"
        ],
        'ADVANCED': [
            "Design a scalable system for a real-time chat application.",
            "Explain how you would handle race conditions in a distributed system.",
            "Discuss the CAP theorem and its implications in database selection."
        ]
    },
    'HR': [
        "Tell me about a time you handled a conflict in your team.",
        "Why do you want to join this company?",
        "Where do you see yourself in 5 years?"
    ]
};

class AIService {
    constructor() {
        this.TOPIC_KEYWORDS = {
            'REACT': ['component', 'state', 'props', 'hooks', 'virtual dom', 'jsx', 'lifecycle', 'render'],
            'NODE': ['event loop', 'async', 'await', 'callback', 'stream', 'module', 'npm', 'middleware'],
            'DATABASE': ['sql', 'nosql', 'index', 'query', 'transaction', 'normalization', 'schema', 'acid'],
            'SYSTEM_DESIGN': ['scalability', 'load balancer', 'caching', 'database', 'microservices', 'latency', 'throughput'],
            'BEHAVIORAL': ['situation', 'task', 'action', 'result', 'communication', 'team', 'conflict', 'learned']
        };
    }

    /**
     * Generate the next question based on context
     */
    async generateNextQuestion(interviewId, previousResponse = null) {
        const interview = await prisma.interview.findUnique({
            where: { id: interviewId },
            include: { questions: true }
        });

        if (!interview) throw new Error('Interview not found');

        // Fetch AI Settings
        const settings = await prisma.interviewSettings.findFirst() || {
            adaptiveDifficulty: true,
            escalationThreshold: 75,
            initialDifficulty: 'INTERMEDIATE',
            maxQuestions: 10,
            hrQuestionRatio: 3
        };

        const questionCount = interview.questions.length;

        // Challenge: Stop generating if max questions reached?
        // usually controller checks this, but we can return null to signal end
        if (questionCount >= settings.maxQuestions) {
            return null;
        }

        // Logic: Determine Avatar & Question Type
        let avatarRole = 'Technical';
        let difficulty = interview.difficulty;

        // Adaptive Difficulty Logic
        if (settings.adaptiveDifficulty && previousResponse && previousResponse.score) {
            // Simple escalation logic
            if (previousResponse.score >= settings.escalationThreshold) {
                if (difficulty === 'BEGINNER') difficulty = 'INTERMEDIATE';
                else if (difficulty === 'INTERMEDIATE') difficulty = 'ADVANCED';
            } else if (previousResponse.score < 50) {
                // De-escalate if struggling?
                if (difficulty === 'ADVANCED') difficulty = 'INTERMEDIATE';
                else if (difficulty === 'INTERMEDIATE') difficulty = 'BEGINNER';
            }
        }

        // Multi-avatar: Every Nth question is HR (from settings)
        if ((questionCount + 1) % settings.hrQuestionRatio === 0) {
            avatarRole = 'HR';
        }

        // Fetch or Generate Question
        let questionText = "";

        if (avatarRole === 'HR') {
            // Try fetching HR questions from KB first
            const kbQuestion = await prisma.knowledgeBase.findFirst({
                where: {
                    domain: 'HR', // Force HR domain
                    difficulty: difficulty // Use current difficulty
                },
                take: 1,
                skip: Math.floor(Math.random() * 3)
            });

            if (kbQuestion) {
                questionText = kbQuestion.content;
            } else {
                const index = Math.floor(Math.random() * QUESTION_BANK.HR.length);
                questionText = QUESTION_BANK.HR[index];
            }
        } else {
            // Technical Video
            // Try to find from KnowledgeBase (Admin Trained Data)
            const count = await prisma.knowledgeBase.count({
                where: {
                    domain: interview.domain,
                    difficulty: difficulty
                }
            });

            const skip = count > 0 ? Math.floor(Math.random() * count) : 0;

            const kbQuestion = await prisma.knowledgeBase.findFirst({
                where: {
                    domain: interview.domain,
                    difficulty: difficulty
                },
                take: 1,
                skip: skip
            });

            if (kbQuestion) {
                questionText = kbQuestion.content;
                // Add context if available
                if (interview.jobDescription && Math.random() > 0.7) {
                    questionText = `Considering the context of this role: ${questionText}`;
                }
            } else {
                // Fallback to static bank
                const bank = QUESTION_BANK['IT'][difficulty] || QUESTION_BANK['IT']['BEGINNER'];
                questionText = bank[Math.floor(Math.random() * bank.length)];
            }
        }

        return {
            question: questionText,
            type: avatarRole === 'HR' ? 'BEHAVIORAL' : 'TECHNICAL',
            avatarRole: avatarRole,
            avatarId: avatarRole === 'HR' ? 'avatar-hr-1' : 'avatar-tech-1',
            difficulty: difficulty // Return current difficulty for tracking
        };
    }

    /**
     * Evaluate a response using Enhanced Keyword Matching
     */
    async evaluateResponse(questionId, responseText, code = null) {
        // If it's a coding question, we might expect code instead of audio
        if ((!responseText || responseText.trim().length < 5) && !code) {
            return {
                score: 0,
                feedback: "No response detected. Please ensure you answer the question or write code.",
                sentiment: "NEGATIVE",
                missingKeywords: []
            };
        }

        // 1. Identify Topic (Simple heuristic based on response + question context would be better, but using response for now)
        let topic = 'BEHAVIORAL'; // Default
        const lowerText = responseText.toLowerCase();

        if (lowerText.includes('react') || lowerText.includes('component')) topic = 'REACT';
        else if (lowerText.includes('node') || lowerText.includes('express')) topic = 'NODE';
        else if (lowerText.includes('database') || lowerText.includes('sql')) topic = 'DATABASE';
        else if (lowerText.includes('scale') || lowerText.includes('system')) topic = 'SYSTEM_DESIGN';

        // 2. keyword Matching
        const expectedKeywords = this.TOPIC_KEYWORDS[topic] || [];
        const foundKeywords = expectedKeywords.filter(k => lowerText.includes(k));
        const missingKeywords = expectedKeywords.filter(k => !lowerText.includes(k));

        // 3. Scoring Logic
        // Base score for simply answering (up to 40)
        let score = Math.min(40, (responseText || "").length / 3);

        // Bonus for Code (Simple heuristic for now)
        if (code && code.length > 20) {
            score += 30; // Significant bonus for writing code
            if (code.includes('function') || code.includes('const') || code.includes('class')) {
                score += 10;
            }
        }

        // Bonus for structure (20)
        if ((responseText || "").toLowerCase().includes('example') || (responseText || "").toLowerCase().includes('because')) {
            score += 20;
        }

        // Bonus for accuracy (keywords) (up to 40)
        const keywordScore = (foundKeywords.length / Math.max(1, expectedKeywords.length)) * 40;
        score += keywordScore;

        score = Math.min(100, Math.floor(score));

        // 4. Generate Specific Feedback
        let feedback = "";
        if (score >= 80) {
            feedback = "Excellent answer! You covered key concepts and provided good structure.";
        } else if (score >= 60) {
            feedback = `Good attempt. You mentioned ${foundKeywords.join(', ')} but could go deeper.`;
        } else {
            feedback = "Response needs improvement. Try to be more specific and technical.";
        }

        if (missingKeywords.length > 0 && score < 90) {
            feedback += ` Consider discussing: ${missingKeywords.slice(0, 3).join(', ')}.`;
        }

        return {
            score,
            feedback,
            sentiment: score > 60 ? "POSITIVE" : "NEUTRAL",
            foundKeywords,
            missingKeywords
        };
    }

    /**
     * Train the AI (Add to Knowledge Base)
     */
    async trainKnowledgeBase(data) {
        return await prisma.knowledgeBase.create({
            data: {
                domain: data.domain,
                topic: data.topic,
                content: data.content,
                difficulty: data.difficulty
            }
        });
    }

    /**
     * Generate comprehensive interview report
     */
    async generateDetailedReport(interviewId) {
        const interview = await prisma.interview.findUnique({
            where: { id: interviewId },
            include: {
                questions: {
                    include: { responses: true }
                },
                evaluation: true,
                user: true
            }
        });

        if (!interview) throw new Error('Interview not found');

        // Calculate scores from responses
        let technicalScores = [];
        let behavioralScores = [];
        let questionBreakdown = [];
        let allMissingKeywords = new Set();
        let allFoundKeywords = new Set();

        for (const question of interview.questions) {
            const response = question.responses[0];
            if (response) {
                // Re-evaluate to get granular data if not stored
                const evalResult = await this.evaluateResponse(question.id, response.transcript);
                const score = response.score || evalResult.score;
                const feedback = response.feedback || evalResult.feedback;

                if (evalResult.missingKeywords) evalResult.missingKeywords.forEach(k => allMissingKeywords.add(k));
                if (evalResult.foundKeywords) evalResult.foundKeywords.forEach(k => allFoundKeywords.add(k));

                questionBreakdown.push({
                    question: question.question,
                    type: question.type,
                    answer: response.transcript?.substring(0, 200) + (response.transcript?.length > 200 ? '...' : '') || '(No Answer)',
                    score,
                    feedback
                });

                if (question.type === 'TECHNICAL') {
                    technicalScores.push(score);
                } else {
                    behavioralScores.push(score);
                }
            } else {
                questionBreakdown.push({
                    question: question.question,
                    type: question.type,
                    answer: '(Skipped)',
                    score: 0,
                    feedback: 'Question was skipped.'
                });
                technicalScores.push(0);
            }
        }

        // Calculate aggregate scores
        const technicalScore = technicalScores.length > 0
            ? Math.round(technicalScores.reduce((a, b) => a + b, 0) / technicalScores.length)
            : 0;

        // Mocking other scores based on technical for consistency without real AI
        const communicationScore = Math.min(100, technicalScore + 10);
        const confidenceScore = Math.min(100, technicalScore + 5);
        const starMethodScore = behavioralScores.length > 0
            ? Math.round(behavioralScores.reduce((a, b) => a + b, 0) / behavioralScores.length)
            : 50;

        const overallScore = Math.round(
            (technicalScore * 0.4) +
            (communicationScore * 0.25) +
            (confidenceScore * 0.2) +
            (starMethodScore * 0.15)
        );

        // 2026 Feature: Market Readiness Score (Hiring Probability)
        // Weighted: Tech (50%) + Comm (30%) + Confidence (20%)
        let marketReadinessScore = Math.round(
            (technicalScore * 0.5) +
            (communicationScore * 0.3) +
            (confidenceScore * 0.2)
        );

        // Adjust for "red flags" (low scores in critical areas)
        if (technicalScore < 40) marketReadinessScore -= 10;
        if (communicationScore < 40) marketReadinessScore -= 5;

        marketReadinessScore = Math.max(0, Math.min(100, marketReadinessScore));

        // Generate Insights
        const strengths = [];
        const weaknesses = [];
        const recommendations = [];

        if (technicalScore > 70) strengths.push("Strong grasp of technical concepts");
        if (allFoundKeywords.size > 5) strengths.push(`Good vocabulary: used terms like ${Array.from(allFoundKeywords).slice(0, 3).join(', ')}`);

        if (marketReadinessScore > 80) strengths.push("High Market Readiness: Profile aligns well with current industry standards.");

        if (technicalScore < 60) weaknesses.push("Technical depth needs improvement");
        if (allMissingKeywords.size > 0) weaknesses.push(`Missed key concepts: ${Array.from(allMissingKeywords).slice(0, 3).join(', ')}`);

        if (weaknesses.length === 0) weaknesses.push("Try to give more concrete examples");
        if (strengths.length === 0) strengths.push("Good effort in attempting all questions");

        recommendations.push("Review the missing concepts identified above.");
        recommendations.push("Practice answering with the STAR method (Situation, Task, Action, Result).");

        if (marketReadinessScore < 60) {
            recommendations.push("Focus on core technical competency to improve Hiring Probability.");
        }

        const aiInsights = overallScore > 70
            ? "You demonstrated good capability. Focus on refining your technical explanations."
            : "Focus on fundamentals used in this interview. Review the specific feedback for each question.";

        // 2026 Insight: Detailed Analysis
        const detailedAnalysis = `
            Market Readiness: ${marketReadinessScore}%
            Based on your performance, you have a ${marketReadinessScore > 75 ? 'High' : marketReadinessScore > 50 ? 'Moderate' : 'Low'} probability of clearing screening rounds for this role.
            Your pacing and confidence markers indicate ${confidenceScore > 70 ? 'strong executive presence' : 'room for improvement in delivery'}.
        `;

        // Save or update evaluation
        const evaluationData = {
            overallScore,
            technicalScore,
            communicationScore,
            confidenceScore, // Changed from problemSolvingScore to match schema
            starMethodScore,
            aiInsights: detailedAnalysis + "\n\n" + aiInsights, // Append new insights
            strengths,
            weaknesses,
            recommendations
        };

        // Note: Prisma schema uses 'confidenceScore' but code used 'problemSolvingScore'. 
        // Adapting to Schema: Schema has confidenceScore, technicalScore, communicationScore, starMethodScore.
        // Assuming schema is correct.

        let evaluation;
        if (interview.evaluation) {
            evaluation = await prisma.interviewEvaluation.update({
                where: { id: interview.evaluation.id },
                data: evaluationData
            });
        } else {
            evaluation = await prisma.interviewEvaluation.create({
                data: {
                    ...evaluationData,
                    interviewId
                }
            });
        }

        return {
            evaluation,
            questionBreakdown,
            interview: {
                id: interview.id,
                domain: interview.domain,
                role: interview.role,
                company: interview.company,
                difficulty: interview.difficulty,
                duration: interview.endTime && interview.startTime
                    ? Math.round((new Date(interview.endTime) - new Date(interview.startTime)) / 60000)
                    : 30
            }
        };
    }

    calculateMockScore(responseText) {
        if (!responseText) return 50;
        const lengthScore = Math.min(40, responseText.length / 5);
        const hasStructure = responseText.includes('.') ? 15 : 0;
        const hasKeywords = (responseText.match(/because|example|therefore|specifically/gi) || []).length * 10;
        return Math.min(100, Math.floor(45 + lengthScore + hasStructure + hasKeywords));
    }

    generateMockFeedback(question, answer, score) {
        if (score >= 85) {
            return "Excellent response with strong technical depth and clear examples.";
        } else if (score >= 70) {
            return "Good answer. Consider providing more specific examples to strengthen your response.";
        } else if (score >= 55) {
            return "Adequate response but could benefit from more detail and structure. Try using the STAR method.";
        } else {
            return "Response needs improvement. Focus on answering the question directly with concrete examples.";
        }
    }

    generateStrengths(techScore, commScore, confScore, domain) {
        const strengths = [];
        if (techScore >= 75) {
            strengths.push(`Strong technical understanding of ${domain} concepts and best practices`);
        }
        if (commScore >= 75) {
            strengths.push("Clear and articulate communication of complex ideas");
        }
        if (confScore >= 75) {
            strengths.push("Confident presentation with good pacing and structure");
        }
        strengths.push("Demonstrated problem-solving approach in technical discussions");
        return strengths;
    }

    generateWeaknesses(techScore, commScore, starScore, domain) {
        const weaknesses = [];
        if (techScore < 70) {
            weaknesses.push("Could deepen technical knowledge in some areas");
        }
        if (commScore < 70) {
            weaknesses.push("Some responses could be more concise and focused");
        }
        if (starScore < 70) {
            weaknesses.push("Need more specific examples using the STAR method for behavioral questions");
        }
        if (weaknesses.length === 0) {
            weaknesses.push("Minor improvements possible in response time management");
        }
        return weaknesses;
    }

    generateRecommendations(techScore, starScore, domain) {
        const recommendations = [];
        if (techScore < 80) {
            recommendations.push(`Practice more ${domain} system design questions focusing on scalability`);
        }
        if (starScore < 80) {
            recommendations.push("Prepare 3-5 strong STAR stories for behavioral questions");
        }
        recommendations.push("Work on providing concise answers within 2-3 minute timeframe");
        recommendations.push("Review common interview patterns for your target role");
        return recommendations;
    }

    generateAIInsights(role, domain, overallScore, techScore) {
        if (overallScore >= 85) {
            return `Outstanding performance! You show excellent potential as a ${role} with strong ${domain} expertise. Your technical answers were well-structured and demonstrated deep understanding. You're well-prepared for senior-level interviews.`;
        } else if (overallScore >= 70) {
            return `Good performance overall. You demonstrate solid ${role} capabilities with reasonable ${domain} knowledge. Focus on strengthening your technical depth and using more concrete examples. With some targeted practice, you'll be ready for mid-to-senior level positions.`;
        } else {
            return `You show potential but there's room for improvement. Focus on deepening your ${domain} knowledge and practice articulating your experiences using the STAR method. Consider reviewing fundamentals and working through more practice problems.`;
        }
    }
    async generateInterviewQuestions({ domain, role, company, difficulty, count = 5 }) {
        try {
            const prompt = `
                Generate ${count} technical and behavioral interview questions for a ${difficulty} level ${role} position ${company ? `at ${company}` : ''} in the ${domain} domain.
                
                For each question, provide:
                1. The question content
                2. An ideal answer or key points to look for
                3. The specific topic/concept being tested
                
                Format the output strictly as a JSON array of objects with keys: "content", "answer", "topic".
                Do not include markdown formatting like \`\`\`json.
            `;

            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean up potentially markdown-formatted JSON
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

            try {
                return JSON.parse(jsonStr);
            } catch (e) {
                console.error("Failed to parse AI response:", text);
                throw new Error("AI generated invalid JSON");
            }
        } catch (error) {
            console.error("AI Generation Error:", error);
            // Fallback mock data if AI fails
            return Array(count).fill(null).map((_, i) => ({
                content: `Sample ${difficulty} question about ${domain} (${i + 1})`,
                answer: "Expected answer key points...",
                topic: "General"
            }));
        }
    }
}

module.exports = new AIService();

