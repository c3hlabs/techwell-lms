const axios = require('axios');

async function testLogin() {
    try {
        console.log('Testing login API...');
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'student@techwell.com',
            password: 'password123'
        });
        console.log('Success!');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.log('Login failed!');
        console.log('Status:', error.response?.status);
        console.log('Error:', error.response?.data || error.message);
    }
}

testLogin();
