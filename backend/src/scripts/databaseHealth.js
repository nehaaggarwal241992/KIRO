import db from '../config/database.js';

console.log('=== Database Health Check ===\n');

// Perform health check
console.log('1. Basic Health Check:');
const isHealthy = db.healthCheck();
console.log(`Database Status: ${isHealthy ? '✓ HEALTHY' : '✗ UNHEALTHY'}\n`);

// Get database configuration info
console.log('2. Database Configuration:');
const dbInfo = db.getInfo();
if (dbInfo) {
  Object.entries(dbInfo).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
} else {
  console.log('  Could not retrieve database configuration');
}

// Check database file size and WAL file
console.log('\n3. Database File Information:');
try {
  const fs = await import('fs');
  const path = await import('path');
  const { fileURLToPath } = await import('url');
  
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const dbPath = path.join(__dirname, '../../data/reviews.db');
  
  if (fs.existsSync(dbPath)) {
    const stats = fs.statSync(dbPath);
    console.log(`  Database file size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`  Last modified: ${stats.mtime}`);
    
    // Check for WAL file
    const walPath = dbPath + '-wal';
    if (fs.existsSync(walPath)) {
      const walStats = fs.statSync(walPath);
      console.log(`  WAL file size: ${(walStats.size / 1024).toFixed(2)} KB`);
    } else {
      console.log('  WAL file: Not present');
    }
    
    // Check for SHM file
    const shmPath = dbPath + '-shm';
    if (fs.existsSync(shmPath)) {
      const shmStats = fs.statSync(shmPath);
      console.log(`  SHM file size: ${(shmStats.size / 1024).toFixed(2)} KB`);
    } else {
      console.log('  SHM file: Not present');
    }
  } else {
    console.log('  Database file does not exist');
  }
} catch (error) {
  console.log('  Could not check file information:', error.message);
}

// Test database operations under load
console.log('\n4. Performance Test:');
try {
  const iterations = 100;
  const start = process.hrtime.bigint();
  
  for (let i = 0; i < iterations; i++) {
    db.prepare('SELECT 1').get();
  }
  
  const end = process.hrtime.bigint();
  const duration = Number(end - start) / 1000000; // Convert to milliseconds
  const avgTime = duration / iterations;
  
  console.log(`  ${iterations} simple queries executed in ${duration.toFixed(3)}ms`);
  console.log(`  Average query time: ${avgTime.toFixed(3)}ms`);
} catch (error) {
  console.log('  Performance test failed:', error.message);
}

// Test concurrent access simulation
console.log('\n5. Concurrent Access Test:');
try {
  const promises = [];
  const concurrentQueries = 10;
  
  for (let i = 0; i < concurrentQueries; i++) {
    promises.push(
      new Promise((resolve, reject) => {
        try {
          const result = db.prepare('SELECT ? as query_id').get(i);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      })
    );
  }
  
  const results = await Promise.all(promises);
  console.log(`  ${results.length} concurrent queries completed successfully`);
} catch (error) {
  console.log('  Concurrent access test failed:', error.message);
}

// Check table statistics
console.log('\n6. Table Statistics:');
try {
  const tables = ['users', 'products', 'reviews', 'moderation_actions'];
  
  for (const table of tables) {
    try {
      const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
      console.log(`  ${table}: ${count.count} records`);
    } catch (error) {
      console.log(`  ${table}: Error getting count - ${error.message}`);
    }
  }
} catch (error) {
  console.log('  Could not retrieve table statistics:', error.message);
}

console.log('\n=== Health Check Complete ===');

// Don't close the database here as it might be used by other parts of the application
// The graceful shutdown handler will take care of closing it when the process exits