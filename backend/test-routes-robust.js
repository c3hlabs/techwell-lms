const fs = require('fs');
const path = require('path');
require('dotenv').config();

const routesDir = path.join(__dirname, 'src/routes');
const files = fs.readdirSync(routesDir).sort();
const results = [];

files.forEach(file => {
    if (file.endsWith('.js')) {
        try {
            // We need to clear cache to simulate fresh load for each if we were doing require in loop, 
            // but here we just want to see if they crash.
            // If they modify global state, it might matter.
            // But routes usually just export router.
            require(path.join(routesDir, file));
            // Success silent
        } catch (e) {
            results.push(`FAIL: ${file} - ${e.message} \nStack: ${e.stack}`);
        }
    }
});

fs.writeFileSync('results_fail.txt', results.join('\n'));
console.log('Done');
