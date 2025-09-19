const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Nepal Adventures Backend Development Environment...\n');

// Check if .env file exists
if (!fs.existsSync('.env')) {
  console.log('⚠️  .env file not found. Creating from .env.example...');
  if (fs.existsSync('.env.example')) {
    fs.copyFileSync('.env.example', '.env');
    console.log('✅ .env file created. Please update it with your configuration.\n');
  } else {
    console.log('❌ .env.example not found. Please create .env manually.\n');
  }
}

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.log('📦 Installing dependencies...');
  exec('npm install', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error installing dependencies:', error);
      return;
    }
    console.log('✅ Dependencies installed successfully.\n');
    startServer();
  });
} else {
  startServer();
}

function startServer() {
  console.log('🌟 Starting development server...\n');
  console.log('📍 API will be available at: http://localhost:5000');
  console.log('🏥 Health check: http://localhost:5000/api/health');
  console.log('📚 API Documentation: See README.md\n');
  console.log('🔧 Environment: Development');
  console.log('💾 Database: MongoDB (make sure it\'s running)\n');
  console.log('Press Ctrl+C to stop the server\n');
  console.log('=' * 50);
  
  // Start the server
  const server = exec('npm run dev', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error starting server:', error);
      return;
    }
  });
  
  server.stdout.on('data', (data) => {
    console.log(data);
  });
  
  server.stderr.on('data', (data) => {
    console.error(data);
  });
}