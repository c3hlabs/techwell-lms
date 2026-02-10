try {
    require('dotenv').config();
    console.log('Loading auth middleware...');
    require('./src/middleware/auth.js');
    console.log('Loading admin.routes.js...');
    require('./src/routes/admin.routes.js');
    console.log('Success!');
} catch (e) {
    console.error('Crash:', e);
}
