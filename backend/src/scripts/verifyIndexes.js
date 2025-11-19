import db from '../config/database.js';
import { initializeDatabase } from '../config/initDatabase.js';

// Ensure database is initialized
initializeDatabase();

console.log('=== Database Index Verification and Optimization ===\n');

// Function to check if an index exists
function checkIndexExists(indexName) {
  const result = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='index' AND name=?
  `).get(indexName);
  
  return result !== undefined;
}

// Function to explain query plan
function explainQuery(query, params = []) {
  console.log(`Query: ${query}`);
  if (params.length > 0) {
    console.log(`Params: ${JSON.stringify(params)}`);
  }
  
  const plan = db.prepare(`EXPLAIN QUERY PLAN ${query}`).all(...params);
  plan.forEach(row => {
    console.log(`  ${row.id}|${row.parent}|${row.notused}|${row.detail}`);
  });
  console.log('');
}

// List of expected indexes
const expectedIndexes = [
  'idx_reviews_product_status',
  'idx_reviews_user', 
  'idx_reviews_status',
  'idx_moderation_review',
  'idx_moderation_moderator'
];

console.log('1. Checking if all expected indexes exist:');
expectedIndexes.forEach(indexName => {
  const exists = checkIndexExists(indexName);
  console.log(`  ${indexName}: ${exists ? '✓ EXISTS' : '✗ MISSING'}`);
});

console.log('\n2. Listing all indexes in the database:');
const allIndexes = db.prepare(`
  SELECT name, tbl_name, sql 
  FROM sqlite_master 
  WHERE type='index' AND name NOT LIKE 'sqlite_%'
  ORDER BY name
`).all();

allIndexes.forEach(index => {
  console.log(`  ${index.name} on ${index.tbl_name}`);
  if (index.sql) {
    console.log(`    SQL: ${index.sql}`);
  }
});

// Insert some test data to verify index usage
console.log('\n3. Creating test data for index verification...');

// Insert test users
const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (id, username, email, role) 
  VALUES (?, ?, ?, ?)
`);

insertUser.run(1, 'testuser1', 'user1@test.com', 'user');
insertUser.run(2, 'testuser2', 'user2@test.com', 'user');
insertUser.run(3, 'moderator1', 'mod1@test.com', 'moderator');

// Insert test products
const insertProduct = db.prepare(`
  INSERT OR IGNORE INTO products (id, name, description, category) 
  VALUES (?, ?, ?, ?)
`);

insertProduct.run(1, 'Test Product 1', 'Description 1', 'Category A');
insertProduct.run(2, 'Test Product 2', 'Description 2', 'Category B');

// Insert test reviews
const insertReview = db.prepare(`
  INSERT OR IGNORE INTO reviews (id, user_id, product_id, rating, review_text, status) 
  VALUES (?, ?, ?, ?, ?, ?)
`);

insertReview.run(1, 1, 1, 5, 'Great product!', 'approved');
insertReview.run(2, 2, 1, 4, 'Good product', 'pending');
insertReview.run(3, 1, 2, 3, 'Average product', 'rejected');
insertReview.run(4, 2, 2, 2, 'Poor product', 'flagged');

// Insert test moderation actions
const insertAction = db.prepare(`
  INSERT OR IGNORE INTO moderation_actions (id, review_id, moderator_id, action, notes) 
  VALUES (?, ?, ?, ?, ?)
`);

insertAction.run(1, 1, 3, 'approve', 'Looks good');
insertAction.run(2, 3, 3, 'reject', 'Inappropriate content');

console.log('Test data created.\n');

console.log('4. Testing index usage with EXPLAIN QUERY PLAN:\n');

// Test idx_reviews_product_status index
console.log('Testing idx_reviews_product_status:');
explainQuery(`
  SELECT * FROM reviews 
  WHERE product_id = ? AND status = ?
`, [1, 'approved']);

// Test idx_reviews_user index
console.log('Testing idx_reviews_user:');
explainQuery(`
  SELECT * FROM reviews 
  WHERE user_id = ?
`, [1]);

// Test idx_reviews_status index
console.log('Testing idx_reviews_status:');
explainQuery(`
  SELECT * FROM reviews 
  WHERE status = ?
`, ['pending']);

// Test idx_moderation_review index
console.log('Testing idx_moderation_review:');
explainQuery(`
  SELECT * FROM moderation_actions 
  WHERE review_id = ?
`, [1]);

// Test idx_moderation_moderator index
console.log('Testing idx_moderation_moderator:');
explainQuery(`
  SELECT * FROM moderation_actions 
  WHERE moderator_id = ?
`, [3]);

// Test complex queries that should use multiple indexes
console.log('Testing complex queries:');

console.log('Average rating calculation (should use idx_reviews_product_status):');
explainQuery(`
  SELECT AVG(rating) as avg_rating, COUNT(*) as count 
  FROM reviews 
  WHERE product_id = ? AND status = ?
`, [1, 'approved']);

console.log('Moderation queue (should use idx_reviews_status):');
explainQuery(`
  SELECT r.*, u.username, p.name as product_name
  FROM reviews r
  JOIN users u ON r.user_id = u.id
  JOIN products p ON r.product_id = p.id
  WHERE r.status = ?
  ORDER BY r.created_at ASC
`, ['pending']);

console.log('User review history (should use idx_reviews_user):');
explainQuery(`
  SELECT r.*, p.name as product_name
  FROM reviews r
  JOIN products p ON r.product_id = p.id
  WHERE r.user_id = ?
  ORDER BY r.created_at DESC
`, [1]);

console.log('=== Index Verification Complete ===');
// Addi
tional verification functions
function analyzeIndexEffectiveness() {
  console.log('\n5. Analyzing index effectiveness:\n');
  
  // Check index statistics
  const indexStats = db.prepare(`
    SELECT name, tbl_name 
    FROM sqlite_master 
    WHERE type='index' AND name NOT LIKE 'sqlite_%'
  `).all();
  
  indexStats.forEach(index => {
    console.log(`Index: ${index.name} on table ${index.tbl_name}`);
    
    // Get table info to understand the indexed columns
    try {
      const indexInfo = db.prepare(`PRAGMA index_info(${index.name})`).all();
      console.log('  Columns:', indexInfo.map(col => col.name).join(', '));
    } catch (error) {
      console.log('  Could not retrieve index info:', error.message);
    }
  });
}

function testQueryPerformance() {
  console.log('\n6. Testing query performance with timing:\n');
  
  // Test queries that should benefit from indexes
  const queries = [
    {
      name: 'Product reviews by status',
      sql: 'SELECT COUNT(*) FROM reviews WHERE product_id = 1 AND status = ?',
      params: ['approved'],
      expectedIndex: 'idx_reviews_product_status'
    },
    {
      name: 'User reviews',
      sql: 'SELECT COUNT(*) FROM reviews WHERE user_id = ?',
      params: [1],
      expectedIndex: 'idx_reviews_user'
    },
    {
      name: 'Reviews by status',
      sql: 'SELECT COUNT(*) FROM reviews WHERE status = ?',
      params: ['pending'],
      expectedIndex: 'idx_reviews_status'
    },
    {
      name: 'Moderation actions by review',
      sql: 'SELECT COUNT(*) FROM moderation_actions WHERE review_id = ?',
      params: [1],
      expectedIndex: 'idx_moderation_review'
    },
    {
      name: 'Moderation actions by moderator',
      sql: 'SELECT COUNT(*) FROM moderation_actions WHERE moderator_id = ?',
      params: [3],
      expectedIndex: 'idx_moderation_moderator'
    }
  ];
  
  queries.forEach(query => {
    console.log(`Testing: ${query.name}`);
    console.log(`Expected to use: ${query.expectedIndex}`);
    
    const start = process.hrtime.bigint();
    const result = db.prepare(query.sql).get(...query.params);
    const end = process.hrtime.bigint();
    
    const duration = Number(end - start) / 1000000; // Convert to milliseconds
    console.log(`Result: ${JSON.stringify(result)}`);
    console.log(`Execution time: ${duration.toFixed(3)}ms\n`);
  });
}

// Run additional analysis
analyzeIndexEffectiveness();
testQueryPerformance();

console.log('=== Verification and Analysis Complete ===');