const axios = require('axios');

async function testEmployerJobs() {
    try {
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'employer@techwell.com',
            password: 'password123'
        });

        const token = loginRes.data.token;
        console.log('Login Successful, Token received.');

        const jobsRes = await axios.get('http://localhost:5000/api/jobs/my/listings', {
            headers: { Authorization: `Bearer ${token}` }
        }); // Wait, route is /api/employers/jobs/my/listings or /api/jobs/my/listings? 
        // In jobs.routes.js: router.get('/my/listings', ...)
        // In index.js: app.use('/api/jobs', jobsRoutes) ??
        // Let's check index.js to see where jobs routes are mounted.
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}
// I need to check index.js first to be sure of the route path.
