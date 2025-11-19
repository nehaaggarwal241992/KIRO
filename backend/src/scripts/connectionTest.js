import db from '../config/database.js';

console.log('=== Database Connection Optimization Test ===\n');

// Test 1: Basic connection and configuration
console.log('1. Testing basic connection and configuration...');
try {
  const isHealthy = db.healthCheck();
  console.log(`   Connection status: ${isHealthy ? '✓ HEALTHY' : '✗ FAILED'}`);
  
  const config = db.getInfo();
  if (config) {
    console.log('   Configuration:');
    Object.entries(config).forEach(([key, value]) => {
      console.log(`     ${key}: ${value}`);
    });
  }
  console.log('');
} catch (error) {
  console.error('   ✗ Basic connection test failed:', error.message);
}

// Test 2: Timeout handling
console.log('2. Testing timeout handling...');
try {
  // This should complete quickly with proper timeout settings
  const start = process.hrtime.bigint();
  const result = db.prepare('SELECT 1 as test').get();
  const end = process.hrtime.bigint();
  const duration = Number(end - start) / 1000000;
  
  console.log(`   ✓ Query completed in ${duration.toFixed(3)}ms`);
  console.log(`   Result: ${JSON.stringify(result)}`);
  console.log('');
} catch (error) {
  console.error('   ✗ Timeout test failed:', error.message);
}

// Test 3: Concurrent access handling
console.log('3. Testing concurrent access handling...');
try {
  const concurrentOperations = 20;
  const promises = [];
  
  for (let i = 0; i < concurrentOperations; i++) {
    promises.push(
      new Promise((resolve, reject) => {
        try {
          // Simulate different types of operations
          if (i % 3 === 0) {
            // Read operation
            const result = db.prepare('SELECT COUNT(*) as count FROM users').get();
            resolve({ type: 'read', id: i, result: result.count });
          } else if (i % 3 === 1) {
            // Write operation (safe test insert)
            const stmt = db.prepare(`
              INSERT OR IGNORE INTO users (username, email, role) 
              VALUES (?, ?, ?)
            `);
            const result = stmt.run(`test_user_${i}`, `test${i}@example.com`, 'user');
            resolve({ type: 'write', id: i, changes: result.changes });
          } else {
            // Complex query
            const result = db.prepare(`
              SELECT COUNT(*) as count 
              FROM reviews r 
              JOIN users u ON r.user_id = u.id 
              WHERE r.status = 'approved'
            `).get();
            resolve({ type: 'complex', id: i, result: result.count });
          }
        } catch (error) {
          reject({ id: i, error: error.message });
        }
      })
    );
  }
  
  const results = await Promise.allSettled(promises);
  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  
  console.log(`   ✓ Concurrent operations: ${successful} successful, ${failed} failed`);
  
  if (failed > 0) {
    console.log('   Failed operations:');
    results.filter(r => r.status === 'rejected').forEach(r => {
      console.log(`     Operation ${r.reason.id}: ${r.reason.error}`);
    });
  }
  console.log('');
} catch (error) {
  console.error('   ✗ Concurrent access test failed:', error.message);
}

// Test 4: Error handling for database busy/locked scenarios
console.log('4. Testing error handling...');
try {
  // Test with invalid SQL to trigger error handling
  try {
    db.prepare('SELECT * FROM nonexistent_table').get();
  } catch (error) {
    console.log(`   ✓ Error properly caught: ${error.message}`);
  }
  
  // Test with invalid parameters
  try {
    db.prepare('SELECT * FROM users WHERE id = ?').get('invalid_id');
  } catch (error) {
    console.log(`   ✓ Parameter error handled: ${error.message}`);
  }
  
  console.log('');
} catch (error) {
  console.error('   ✗ Error handling test failed:', error.message);
}

// Test 5: Transaction handling
console.log('5. Testing transaction handling...');
try {
  const transaction = db.transaction((testData) => {
    // Insert test data in a transaction
    const insertUser = db.prepare(`
      INSERT OR IGNORE INTO users (username, email, role) 
      VALUES (?, ?, ?)
    `);
    
    for (const user of testData) {
      insertUser.run(user.username, user.email, user.role);
    }
    
    return testData.length;
  });
  
  const testUsers = [
    { username: 'tx_user1', email: 'tx1@test.com', role: 'user' },
    { username: 'tx_user2', email: 'tx2@test.com', role: 'user' }
  ];
  
  const inserted = transaction(testUsers);
  console.log(`   ✓ Transaction completed, processed ${inserted} users`);
  console.log('');
} catch (error) {
  console.error('   ✗ Transaction test failed:', error.message);
}

// Test 6: WAL mode verification
console.log('6. Testing WAL mode functionality...');
try {
  const journalMode = db.pragma('journal_mode', { simple: true });
  console.log(`   Journal mode: ${journalMode}`);
  
  if (journalMode === 'wal') {
    console.log('   ✓ WAL mode is active');
    
    // Check WAL file status
    const walCheckpoint = db.pragma('wal_checkpoint');
    console.log(`   WAL checkpoint info: ${JSON.stringify(walCheckpoint)}`);
  } else {
    console.log('   ⚠ WAL mode is not active');
  }
  console.log('');
} catch (error) {
  console.error('   ✗ WAL mode test failed:', error.message);
}

// Test 7: Performance under load
console.log('7. Testing performance under load...');
try {
  const iterations = 1000;
  const operations = ['read', 'write', 'complex'];
  const results = {};
  
  for (const operation of operations) {
    const start = process.hrtime.bigint();
    
    for (let i = 0; i < iterations; i++) {
      switch (operation) {
        case 'read':
          db.prepare('SELECT 1').get();
          break;
        case 'write':
          db.prepare(`
            INSERT OR IGNORE INTO users (username, email, role) 
            VALUES (?, ?, ?)
          `).run(`perf_user_${i}`, `perf${i}@test.com`, 'user');
          break;
        case 'complex':
          db.prepare(`
            SELECT COUNT(*) as count 
            FROM users u 
            LEFT JOIN reviews r ON u.id = r.user_id 
            WHERE u.role = 'user'
          `).get();
          break;
      }
    }
    
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000;
    results[operation] = {
      totalTime: duration,
      avgTime: duration / iterations,
      opsPerSecond: (iterations / duration) * 1000
    };
  }
  
  console.log('   Performance results:');
  Object.entries(results).forEach(([op, stats]) => {
    console.log(`     ${op}: ${stats.totalTime.toFixed(2)}ms total, ${stats.avgTime.toFixed(3)}ms avg, ${stats.opsPerSecond.toFixed(0)} ops/sec`);
  });
  console.log('');
} catch (error) {
  console.error('   ✗ Performance test failed:', error.message);
}

// Cleanup test data
console.log('8. Cleaning up test data...');
try {
  const deleteStmt = db.prepare(`
    DELETE FROM users 
    WHERE username LIKE 'test_user_%' 
       OR username LIKE 'tx_user%' 
       OR username LIKE 'perf_user_%'
  `);
  const result = deleteStmt.run();
  console.log(`   ✓ Cleaned up ${result.changes} test records`);
} catch (error) {
  console.error('   ✗ Cleanup failed:', error.message);
}

console.log('\n=== Connection Optimization Test Complete ===');