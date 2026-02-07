const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'backend/prisma/schema.prisma');

try {
    console.log('Reading from:', filePath);
    const buffer = fs.readFileSync(filePath);

    // Check for common encoding markers
    let content = buffer.toString('utf8');

    // Remove null bytes (common in UTF-16 interpreted as UTF-8)
    if (content.includes('\u0000')) {
        console.log('Found null bytes, removing...');
        content = content.replace(/\u0000/g, '');
    }

    // Remove BOM
    if (content.charCodeAt(0) === 0xFEFF) {
        console.log('Found BOM, removing...');
        content = content.slice(1);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Schema cleaned successfully.');
} catch (error) {
    console.error('Error cleaning schema:', error);
    process.exit(1);
}
