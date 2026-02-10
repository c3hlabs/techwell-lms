const axios = require('axios');

async function testLogin() {
    console.log('Testing connection to backend...');
    try {
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'test@example.com',
            password: 'password123'
        });
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
    } catch (error) {
        if (error.response) {
            console.log('Response status:', error.response.status);
            console.log('Response error:', error.response.data);
        } else {
            console.log('Connection failed:', error.message);
            console.log('Full error:', error);
        }
    }
}

testLogin();
