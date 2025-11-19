import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🎬 Setting up Feedback and Review System Demo');
console.log('=' .repeat(60));

try {
  console.log('\n🏗️ Step 1: Initializing database...');
  execSync('node src/config/initDatabase.js', { 
    cwd: join(__dirname, '../..'), 
    stdio: 'inherit' 
  });

  console.log('\n🌱 Step 2: Seeding sample data...');
  execSync('node src/scripts/seedData.js', { 
    cwd: join(__dirname, '../..'), 
    stdio: 'inherit' 
  });

  console.log('\n🎯 Step 3: Running interactive demo...');
  execSync('node src/scripts/demo.js', { 
    cwd: join(__dirname, '../..'), 
    stdio: 'inherit' 
  });

  console.log('\n✅ Demo setup complete!');
  console.log('\n🚀 Ready to start the application:');
  console.log('   Backend: npm start');
  console.log('   Frontend: cd ../frontend && npm run dev');

} catch (error) {
  console.error('\n❌ Setup failed:', error.message);
  process.exit(1);
}