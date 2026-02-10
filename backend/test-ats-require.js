try {
    require('dotenv').config();
    console.log('Loading ats.routes.js...');
    require('./src/routes/ats.routes');
    console.log('Success!');
} catch (e) {
    console.error('Crash:', e);
}
