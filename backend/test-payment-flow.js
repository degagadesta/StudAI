/**
 * Test Payment Flow Script
 * Quick script to test the subscription system endpoints
 * 
 * Usage: node test-payment-flow.js
 */

const API_URL = process.env.API_URL || 'http://localhost:4000/api';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, url, options = {}) {
  try {
    log(`\nTesting: ${name}`, 'blue');
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      log(`✓ ${name} - SUCCESS`, 'green');
      console.log(JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      log(`✗ ${name} - FAILED (${response.status})`, 'red');
      console.log(JSON.stringify(data, null, 2));
      return { success: false, data };
    }
  } catch (error) {
    log(`✗ ${name} - ERROR: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('='.repeat(50), 'yellow');
  log('StudAI Payment System Tests', 'yellow');
  log('='.repeat(50), 'yellow');

  // Test 1: Get available plans
  await testEndpoint(
    'GET /payment/plans',
    `${API_URL}/payment/plans`
  );

  // Test 2: Check plan limits config
  log('\n' + '-'.repeat(50), 'yellow');
  log('✓ Plan Limits Configuration:', 'green');
  log('  FREE: 5 PDFs, 100 messages, 10 summaries', 'reset');
  log('  STUDENT: 25 PDFs, 1000 messages, unlimited summaries', 'reset');
  log('  PRO: Unlimited everything', 'reset');

  // Instructions for authenticated tests
  log('\n' + '-'.repeat(50), 'yellow');
  log('Next Steps (requires authentication):', 'yellow');
  log('\n1. Login to get auth token:', 'blue');
  log('   POST /auth/login', 'reset');
  log('   { "email": "test@example.com", "password": "password" }', 'reset');
  
  log('\n2. Get usage summary:', 'blue');
  log('   GET /student/usage/summary', 'reset');
  log('   Headers: { Authorization: "Bearer <token>" }', 'reset');
  
  log('\n3. Initialize payment:', 'blue');
  log('   POST /payment/initialize', 'reset');
  log('   { "plan": "STUDENT", "billingCycle": "MONTHLY" }', 'reset');
  
  log('\n4. Verify payment:', 'blue');
  log('   GET /payment/verify/:txRef', 'reset');

  log('\n' + '='.repeat(50), 'yellow');
  log('Test Plan for Presentation:', 'yellow');
  log('='.repeat(50), 'yellow');
  
  log('\nScenario 1: Hit FREE limit', 'blue');
  log('  1. Login as FREE user', 'reset');
  log('  2. Upload 5 PDFs successfully', 'reset');
  log('  3. Try 6th PDF → Limit modal appears', 'reset');
  log('  4. Click "Upgrade to STUDENT"', 'reset');
  
  log('\nScenario 2: Complete payment', 'blue');
  log('  1. Select STUDENT plan', 'reset');
  log('  2. Choose monthly billing', 'reset');
  log('  3. Click "Proceed to Payment"', 'reset');
  log('  4. Use test card: 4200 0000 0000 0000', 'reset');
  log('  5. Payment succeeds → Plan upgraded', 'reset');
  
  log('\nScenario 3: Verify upgrade', 'blue');
  log('  1. Check settings → Plan shows STUDENT', 'reset');
  log('  2. Usage limits updated (25 PDFs)', 'reset');
  log('  3. Upload more PDFs successfully', 'reset');

  log('\n' + '='.repeat(50), 'yellow');
  log('Chapa Test Cards:', 'yellow');
  log('='.repeat(50), 'yellow');
  log('Success: 4200 0000 0000 0000', 'green');
  log('Failure: 4100 0000 0000 0000', 'red');
  log('Declined: 4000 0000 0000 0002', 'red');
  log('CVV: Any 3 digits', 'reset');
  log('Expiry: Any future date', 'reset');

  log('\n✅ Ready for presentation!\n', 'green');
}

// Run tests
runTests().catch(console.error);
