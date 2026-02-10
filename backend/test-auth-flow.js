const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth';
const testUser = {
    email: `test_${Date.now()}@example.com`,
    password: 'password123',
    name: 'Test User'
};

async function testAuthFlow() {
    console.log('1. Registering new user...');
    try {
        const regRes = await axios.post(`${API_URL}/register`, testUser);
        console.log('   Registration Successful:', regRes.status);

        console.log('2. Logging in...');
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: testUser.email,
            password: testUser.password
        });
        console.log('   Login Successful:', loginRes.status);
        const token = loginRes.data.token;

        console.log('3. Accessing protected route (/users/me)...');
        const meRes = await axios.get('http://localhost:5000/api/users/me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   Protected Route Access Successful:', meRes.status);
        console.log('   User:', meRes.data.user.email);

        console.log('\n✅ AUTHENTICATION FLOW VERIFIED');

    } catch (error) {
        console.error('\n❌ AUTH FLOW FAILED');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testAuthFlow();
