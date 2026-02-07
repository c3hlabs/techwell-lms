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
    /**
     * Generate the next question based on context
     */
    async generateNextQuestion(interviewId, previousResponse = null) {
        const interview = await prisma.interview.findUnique({
            where: { id: interviewId },
            include: { questions: true }
        });

        if (!interview) throw new Error('Interview not found');

        // Logic: Determine Avatar & Question Type based on progress
        const questionCount = interview.questions.length;
        let avatarRole = 'Technical';
        let difficulty = interview.difficulty;

        // Adaptive Logic: If previous response score was high, increase difficulty (Mocked)
        // In real AI, we would analyze 'previousResponse' text here.

        // Multi-avatar simulation: Every 3rd question is HR/Behavioral
        if ((questionCount + 1) % 3 === 0) {
            avatarRole = 'HR';
        }

        // Fetch or Generate Question
        let questionText = "";

        if (avatarRole === 'HR') {
            const index = Math.floor(Math.random() * QUESTION_BANK.HR.length);
            questionText = QUESTION_BANK.HR[index];
        } else {
            // Technical Video
            // Try to find from KnowledgeBase first (Admin Trained Data)
            const kbQuestion = await prisma.knowledgeBase.findFirst({
                where: {
                    domain: interview.domain,
                    difficulty: difficulty
                },
                take: 1,
                skip: Math.floor(Math.random() * 5) // Randomize slightly
            });

            if (kbQuestion) {
                questionText = `Based on your resume and JD: ${kbQuestion.content}`; // Creating a question from content
            } else {
                // Fallback to static bank
                const bank = QUESTION_BANK['IT'][difficulty] || QUESTION_BANK['IT']['BEGINNER'];
                questionText = bank[Math.floor(Math.random() * bank.length)];
            }
        }

        // Add some "AI personalization" from resume/JD if available
        if (interview.jobDescription && Math.random() > 0.5) {
            questionText = `Considering the Job Description requires ${interview.domain} skills: ${questionText}`;
        }

        return {
            question: questionText,
            type: avatarRole === 'HR' ? 'BEHAVIORAL' : 'TECHNICAL',
            avatarRole: avatarRole,
            avatarId: avatarRole === 'HR' ? 'avatar-hr-1' : 'avatar-tech-1' // Mock IDs
        };
    }

    /**
     * Evaluate a response using AI (Mock)
     */
    async evaluateResponse(question, responseText) {
        // Mock Evaluation Logic
        const lengthScore = Math.min(100, responseText.length / 2);
        const keywordBonus = responseText.includes("because") || responseText.includes("example") ? 20 : 0;

        const score = Math.min(100, Math.floor(lengthScore + keywordBonus));

        return {
            score,
            feedback: score > 70 ? "Great answer with good depth." : "Try to elaborate more and give examples.",
            sentiment: score > 70 ? "POSITIVE" : "NEUTRAL"
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

        for (const question of interview.questions) {
            const response = question.responses[0];
            if (response) {
                const score = response.score || this.calculateMockScore(response.content);
                const feedback = response.feedback || this.generateMockFeedback(question.question, response.content, score);

                questionBreakdown.push({
                    question: question.question,
                    type: question.type,
                    answer: response.content?.substring(0, 200) + (response.content?.length > 200 ? '...' : '') || '',
                    score,
                    feedback
                });

                if (question.type === 'TECHNICAL') {
                    technicalScores.push(score);
                } else {
                    behavioralScores.push(score);
                }
            }
        }

        // Calculate aggregate scores
        const technicalScore = technicalScores.length > 0
            ? Math.round(technicalScores.reduce((a, b) => a + b, 0) / technicalScores.length)
            : 75;
        const communicationScore = Math.round(70 + Math.random() * 20);
        const confidenceScore = Math.round(65 + Math.random() * 25);
        const starMethodScore = Math.round(60 + Math.random() * 30);

        const overallScore = Math.round(
            (technicalScore * 0.4) +
            (communicationScore * 0.25) +
            (confidenceScore * 0.2) +
            (starMethodScore * 0.15)
        );

        // Generate strengths based on high scores
        const strengths = this.generateStrengths(technicalScore, communicationScore, confidenceScore, interview.domain);
        const weaknesses = this.generateWeaknesses(technicalScore, communicationScore, starMethodScore);
        const recommendations = this.generateRecommendations(technicalScore, starMethodScore, interview.domain);

        // Generate AI insights
        const aiInsights = this.generateAIInsights(
            interview.role,
            interview.domain,
            overallScore,
            technicalScore
        );

        // Save or update evaluation
        const evaluationData = {
            overallScore,
            technicalScore,
            communicationScore,
            problemSolvingScore: technicalScore,
            starMethodScore,
            aiInsights,
            strengths,
            weaknesses,
            recommendations
        };

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
}

module.exports = new AIService();

