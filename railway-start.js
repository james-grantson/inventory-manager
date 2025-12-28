// Railway-specific startup script
console.log(' Railway Inventory Manager Starting...');

// Check for required environment variables
const requiredEnvVars = ['DATABASE_URL', 'PORT'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.error(' Missing required environment variables:', missingEnvVars);
    console.log(' Please set these in Railway dashboard under "Variables"');
    process.exit(1);
}

console.log(' Environment variables check passed');
console.log(' Database URL:', process.env.DATABASE_URL ? 'Set (hidden)' : 'Missing');
console.log(' Port:', process.env.PORT || 3000);

// Import and start the main server
require('./server.js');
