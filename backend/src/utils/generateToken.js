const jwt = require('jsonwebtoken');

// Function to generate token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Function to verify token
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { valid: true, data: decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

// Generate test token
const generateTestToken = () => {
  const testPayload = {
    id: '123456789',
    email: 'test@example.com',
    role: 'admin'
  };
  
  return jwt.sign(
    testPayload,
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

module.exports = {
  generateToken,
  verifyToken,
  generateTestToken
}; 