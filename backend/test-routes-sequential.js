const fs = require('fs');
const path = require('path');
require('dotenv').config();

const routesDir = path.join(__dirname, 'src/routes');
const files = fs.readdirSync(routesDir).sort();

async function testRoutes() {
    for (const file of files) {
        if (file.endsWith('.js')) {
            try {
                console.log(`Testing ${file}...`);
                require(path.join(routesDir, file));
                console.log(`PASSED: ${file}`);
            } catch (e) {
                console.error(`FAILED: ${file}`);
                console.error('Error Message:', e.message);
                console.error('Stack Top:', e.stack.split('\n')[1]); // First line of trace usually useful
                process.exit(1);
            }
        }
    };
    console.log('All routes checked.');
}

testRoutes();
