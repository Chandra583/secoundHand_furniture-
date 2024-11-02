const crypto = require('crypto');

// Generate a secure random string
const generateSecret = (length = 64) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate and display secret
const secret = generateSecret();
console.log('\n=== JWT Secret Generator ===');
console.log('Copy this value to your .env file as JWT_SECRET:\n');
console.log(secret);
console.log('\n');

// Save to .env file if specified
if (process.argv.includes('--save')) {
  const fs = require('fs');
  const envPath = '.env';
  
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Replace existing JWT_SECRET or append new one
  const newContent = envContent.includes('JWT_SECRET=')
    ? envContent.replace(/JWT_SECRET=.*/, `JWT_SECRET=${secret}`)
    : envContent + `\nJWT_SECRET=${secret}`;

  fs.writeFileSync(envPath, newContent);
  console.log('JWT_SECRET has been saved to .env file');
} 