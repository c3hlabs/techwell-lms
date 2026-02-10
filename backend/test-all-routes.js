const fs = require('fs');
const path = require('path');
require('dotenv').config();

const routesDir = path.join(__dirname, 'src/routes');
const files = fs.readdirSync(routesDir);

files.forEach(file => {
    if (file.endsWith('.js')) {
        try {
            console.log(`Loading ${file}...`);
            require(path.join(routesDir, file));
            console.log(`OK: ${file}`);
        } catch (e) {
            console.error(`FAIL: ${file}`);
            console.error(e);
        }
    }
});
