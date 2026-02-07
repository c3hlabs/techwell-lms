const axios = require('axios');

async function testLogin() {
    console.log("Attempting login with 'admin@techwell.com' and 'password123'...");
    try {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@techwell.com',
            password: 'password123'
        });
        console.log("Login SUCCESS!");
        console.log("Token received:", res.data.token ? "YES" : "NO");
        console.log("User Role:", res.data.user.role);
    } catch (error) {
        console.error("Login FAILED");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        } else {
            console.error("Error:", error.message);
        }
    }
}

testLogin();
