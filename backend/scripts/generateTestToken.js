require('dotenv').config();
const { generateToken, verifyToken } = require('../src/utils/generateToken');

// Test user data
const testUser = {
  id: '507f1f77bcf86cd799439011',
  email: 'test@example.com',
  role: 'admin'
};

// Generate token
console.log('\n=== Generating Test Token ===');
const token = generateToken(testUser.id);
console.log('Generated Token:', token);

// Verify token
console.log('\n=== Verifying Token ===');
const verified = verifyToken(token);
console.log('Verification Result:', verified);

// Test invalid token
console.log('\n=== Testing Invalid Token ===');
const invalidToken = token + 'invalid';
const invalidVerification = verifyToken(invalidToken);
console.log('Invalid Token Result:', invalidVerification); 