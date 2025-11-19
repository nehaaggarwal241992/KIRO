import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🏗️  Building ReviewHub Application');
console.log('=' .repeat(60));

try {
  // Step 1: Build Frontend
  console.log('\n📦 Step 1: Building Frontend...');
  process.chdir(join(__dirname, 'frontend'));
  
  console.log('   Installing frontend dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('   Building frontend for production...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Frontend build completed successfully!');

  // Step 2: Prepare Backend
  console.log('\n⚙️  Step 2: Preparing Backend...');
  process.chdir(join(__dirname, 'backend'));
  
  console.log('   Installing backend dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('✅ Backend preparation completed successfully!');

  // Step 3: Create deployment package info
  console.log('\n📋 Step 3: Creating deployment information...');
  
  const deploymentInfo = {
    name: 'ReviewHub',
    version: '1.0.0',
    description: 'Complete Feedback and Review System',
    buildDate: new Date().toISOString(),
    components: {
      frontend: {
        framework: 'React + Vite',
        buildPath: './frontend/dist',
        entryPoint: 'index.html'
      },
      backend: {
        framework: 'Node.js + Express',
        entryPoint: './backend/src/scripts/production.js',
        port: 3000
      }
    },
    deployment: {
      type: 'Single Server (Frontend + Backend)',
      command: 'npm run production',
      url: 'http://localhost:3000'
    },
    features: [
      'Product browsing and reviews',
      'User authentication (mock)',
      'Review moderation system',
      'Rating and statistics',
      'Responsive design',
      'Modern UI with animations'
    ]
  };

  fs.writeFileSync(
    join(__dirname, 'deployment-info.json'), 
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Step 4: Display build summary
  console.log('\n🎉 Build Summary:');
  console.log('=' .repeat(60));
  
  // Check frontend build size
  const frontendDistPath = join(__dirname, 'frontend', 'dist');
  if (fs.existsSync(frontendDistPath)) {
    const files = fs.readdirSync(frontendDistPath, { recursive: true });
    console.log(`📁 Frontend: ${files.length} files built in ./frontend/dist/`);
  }
  
  console.log('⚙️  Backend: Production server ready in ./backend/src/scripts/production.js');
  console.log('📋 Deployment info: ./deployment-info.json');
  
  console.log('\n🚀 Ready for Production!');
  console.log('=' .repeat(60));
  console.log('To start the production server:');
  console.log('   cd backend');
  console.log('   npm run production');
  console.log('');
  console.log('Then open: http://localhost:3000');
  console.log('');
  console.log('✨ The app will serve both frontend and backend from a single server!');

} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}