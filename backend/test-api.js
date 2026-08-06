/**
 * Simple API Test Script
 * Run with: node test-api.js
 */

const BASE_URL = 'http://localhost:4000/api';
let accessToken = '';
let universityId = '';
let departmentId = '';

// Helper function to make requests
async function makeRequest(method, endpoint, body = null, useAuth = false) {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (useAuth && accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const options = {
        method,
        headers,
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const data = await response.json();
        return { status: response.status, data };
    } catch (error) {
        return { status: 0, error: error.message };
    }
}

// Test functions
async function test1_Register() {
    console.log('\n📝 Test 1: Register New Student');
    const result = await makeRequest('POST', '/auth/register', {
        firstName: 'Test',
        lastName: 'User',
        email: `test${Date.now()}@test.com`,
        password: 'Password123'
    });

    console.log(`Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));

    if (result.status === 201) {
        console.log('✅ Registration successful!');
        return result.data.student.id;
    } else {
        console.log('❌ Registration failed');
        return null;
    }
}

async function test2_Login() {
    console.log('\n🔐 Test 2: Login');

    // For testing, use existing account or modify email
    const result = await makeRequest('POST', '/auth/login', {
        email: 'john.doe@test.com',  // Use your test email
        password: 'Password123'
    });

    console.log(`Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));

    if (result.status === 200 && result.data.accessToken) {
        accessToken = result.data.accessToken;
        console.log('✅ Login successful!');
        console.log(`Access Token: ${accessToken.substring(0, 20)}...`);
        return true;
    } else {
        console.log('❌ Login failed');
        return false;
    }
}

async function test3_GetUniversities() {
    console.log('\n🏫 Test 3: Get Universities');
    const result = await makeRequest('GET', '/universities');

    console.log(`Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));

    if (result.status === 200 && result.data.data && result.data.data.length > 0) {
        universityId = result.data.data[0].id;
        console.log('✅ Got universities!');
        console.log(`Saved University ID: ${universityId}`);
        return true;
    } else {
        console.log('❌ Failed to get universities');
        return false;
    }
}

async function test4_GetDepartments() {
    console.log('\n🏢 Test 4: Get Departments');
    const result = await makeRequest('GET', `/departments/university/${universityId}`);

    console.log(`Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));

    if (result.status === 200 && result.data.data && result.data.data.length > 0) {
        departmentId = result.data.data[0].id;
        console.log('✅ Got departments!');
        console.log(`Saved Department ID: ${departmentId}`);
        return true;
    } else {
        console.log('❌ Failed to get departments');
        return false;
    }
}

async function test5_CompleteOnboarding() {
    console.log('\n✨ Test 5: Complete Onboarding');
    const result = await makeRequest('POST', '/student/onboarding', {
        universityId,
        departmentId,
        currentYear: 3,
        currentSemester: 1
    }, true);

    console.log(`Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));

    if (result.status === 200) {
        console.log('✅ Onboarding completed!');
        return true;
    } else {
        console.log('❌ Onboarding failed');
        return false;
    }
}

async function test6_GetCourses() {
    console.log('\n📚 Test 6: Get My Courses');
    const result = await makeRequest('GET', '/student/courses', null, true);

    console.log(`Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));

    if (result.status === 200) {
        console.log('✅ Got courses!');
        return true;
    } else {
        console.log('❌ Failed to get courses');
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting StudAI Backend API Tests');
    console.log('=====================================');

    try {
        // Test 1: Register (skip if you already have an account)
        // await test1_Register();

        // Test 2: Login
        const loginSuccess = await test2_Login();
        if (!loginSuccess) {
            console.log('\n⚠️ Cannot proceed without login. Please:');
            console.log('1. Make sure server is running: node server.js');
            console.log('2. Update email/password in test2_Login()');
            console.log('3. Make sure email is verified in database');
            return;
        }

        // Test 3: Get Universities
        const universitiesSuccess = await test3_GetUniversities();
        if (!universitiesSuccess) {
            console.log('\n⚠️ No universities in database. Please seed data first.');
            return;
        }

        // Test 4: Get Departments
        const departmentsSuccess = await test4_GetDepartments();
        if (!departmentsSuccess) {
            console.log('\n⚠️ No departments for this university. Please seed data first.');
            return;
        }

        // Test 5: Complete Onboarding
        await test5_CompleteOnboarding();

        // Test 6: Get Courses
        await test6_GetCourses();

        console.log('\n=====================================');
        console.log('🎉 All tests completed!');

    } catch (error) {
        console.error('\n❌ Test suite failed:', error.message);
    }
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
    console.log('❌ Error: fetch is not available.');
    console.log('Please use Node.js version 18 or higher.');
    console.log('Or install node-fetch: npm install node-fetch');
    process.exit(1);
}

// Run the tests
runAllTests();
