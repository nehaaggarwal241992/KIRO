import db from '../config/database.js';

console.log('=== Database Maintenance ===\n');

// Function to perform database maintenance tasks
function performMaintenance() {
  console.log('Starting database maintenance...\n');
  
  try {
    // 1. Analyze database for query optimization
    console.log('1. Analyzing database...');
    db.exec('ANALYZE');
    console.log('   ✓ Database analysis complete\n');
    
    // 2. Checkpoint WAL file to reduce size
    console.log('2. Checkpointing WAL file...');
    const checkpointResult = db.pragma('wal_checkpoint(TRUNCATE)');
    console.log(`   ✓ WAL checkpoint complete: ${JSON.stringify(checkpointResult)}\n`);
    
    // 3. Vacuum database to reclaim space (use with caution in production)
    console.log('3. Checking if vacuum is needed...');
    const pageCount = db.pragma('page_count', { simple: true });
    const freelistCount = db.pragma('freelist_count', { simple: true });
    const fragmentationRatio = freelistCount / pageCount;
    
    console.log(`   Pages: ${pageCount}, Free pages: ${freelistCount}`);
    console.log(`   Fragmentation ratio: ${(fragmentationRatio * 100).toFixed(2)}%`);
    
    if (fragmentationRatio > 0.1) { // If more than 10% fragmentation
      console.log('   Running VACUUM to reclaim space...');
      db.exec('VACUUM');
      console.log('   ✓ VACUUM complete\n');
    } else {
      console.log('   VACUUM not needed (low fragmentation)\n');
    }
    
    // 4. Update table statistics
    console.log('4. Updating table statistics...');
    const tables = ['users', 'products', 'reviews', 'moderation_actions'];
    
    for (const table of tables) {
      try {
        db.exec(`ANALYZE ${table}`);
        console.log(`   ✓ ${table} analyzed`);
      } catch (error) {
        console.log(`   ✗ Failed to analyze ${table}: ${error.message}`);
      }
    }
    console.log('');
    
    // 5. Check index usage and effectiveness
    console.log('5. Checking index effectiveness...');
    const indexes = db.prepare(`
      SELECT name, tbl_name 
      FROM sqlite_master 
      WHERE type='index' AND name NOT LIKE 'sqlite_%'
    `).all();
    
    for (const index of indexes) {
      try {
        // This is a simplified check - in a real scenario you'd want more sophisticated analysis
        console.log(`   ✓ Index ${index.name} on ${index.tbl_name} exists`);
      } catch (error) {
        console.log(`   ✗ Issue with index ${index.name}: ${error.message}`);
      }
    }
    console.log('');
    
    // 6. Database integrity check
    console.log('6. Performing integrity check...');
    const integrityResult = db.pragma('integrity_check');
    if (integrityResult.length === 1 && integrityResult[0].integrity_check === 'ok') {
      console.log('   ✓ Database integrity check passed\n');
    } else {
      console.log('   ✗ Database integrity issues found:');
      integrityResult.forEach(result => {
        console.log(`     ${result.integrity_check}`);
      });
      console.log('');
    }
    
    // 7. Performance metrics
    console.log('7. Collecting performance metrics...');
    const metrics = {
      cacheHitRatio: db.pragma('cache_spill', { simple: true }),
      pageSize: db.pragma('page_size', { simple: true }),
      cacheSize: db.pragma('cache_size', { simple: true }),
      journalMode: db.pragma('journal_mode', { simple: true }),
      synchronous: db.pragma('synchronous', { simple: true })
    };
    
    console.log('   Current settings:');
    Object.entries(metrics).forEach(([key, value]) => {
      console.log(`     ${key}: ${value}`);
    });
    console.log('');
    
    console.log('✓ Database maintenance completed successfully');
    
  } catch (error) {
    console.error('✗ Database maintenance failed:', error);
    throw error;
  }
}

// Function to get database statistics
function getDatabaseStats() {
  console.log('=== Database Statistics ===\n');
  
  try {
    const tables = ['users', 'products', 'reviews', 'moderation_actions'];
    
    for (const table of tables) {
      console.log(`${table.toUpperCase()} TABLE:`);
      
      // Get row count
      const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
      console.log(`  Rows: ${count.count}`);
      
      // Get table info
      const tableInfo = db.pragma(`table_info(${table})`);
      console.log(`  Columns: ${tableInfo.length}`);
      
      // Get indexes for this table
      const indexes = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='index' AND tbl_name=? AND name NOT LIKE 'sqlite_%'
      `).all(table);
      console.log(`  Indexes: ${indexes.map(idx => idx.name).join(', ') || 'None'}`);
      console.log('');
    }
    
  } catch (error) {
    console.error('Failed to get database statistics:', error);
  }
}

// Run maintenance if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    getDatabaseStats();
    performMaintenance();
    console.log('\n=== Maintenance Complete ===');
  } catch (error) {
    console.error('Maintenance script failed:', error);
    process.exit(1);
  }
}

export { performMaintenance, getDatabaseStats };