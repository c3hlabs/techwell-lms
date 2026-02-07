require('dotenv').config();
const { generateCourseStructure } = require('../src/services/ai-course.service');

const runTest = async () => {
    console.log("🧪 Testing AI Course Generation...");
    try {
        const topic = "Python for Data Science";
        const difficulty = "BEGINNER";

        console.log(`📝 Topic: ${topic}, Difficulty: ${difficulty}`);
        console.time("Generation Time");

        const result = await generateCourseStructure(topic, difficulty);

        console.timeEnd("Generation Time");
        console.log("\n✅ Generation Successful!");
        console.log("------------------------------------------------");
        console.log(`📚 Title: ${result.title}`);
        console.log(`🏷️  Category: ${result.category}`);
        console.log(`💰 Price: ₹${result.price}`);
        console.log(`📦 Modules: ${result.modules.length}`);

        if (result.modules.length > 0) {
            console.log(`   - First Module: ${result.modules[0].title}`);
            console.log(`     - Lessons: ${result.modules[0].lessons.length}`);
        }
        console.log("------------------------------------------------");

    } catch (error) {
        console.error("❌ Test Failed:", error);
    }
};

runTest();
