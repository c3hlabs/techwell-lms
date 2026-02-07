const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'src', 'routes');
const files = fs.readdirSync(routesDir);

console.log('Checking routes...');

for (const file of files) {
    if (file.endsWith('.js')) {
        try {
            require(path.join(routesDir, file));
        } catch (error) {
            console.log(`FAILED_FILE: ${file}`);
            console.log(`ERROR_MESSAGE: ${error.message}`);
            // recurse to find the missing module
            if (error.code === 'MODULE_NOT_FOUND') {
                console.log('Missing module:', error.message);
            }
        }
    }
}
