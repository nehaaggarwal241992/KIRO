import Database from 'better-sqlite3';

// Test database setup helper
export function createTestDatabase() {
  const db = new Database(':memory:');
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  
  // Create tables
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL CHECK(role IN ('user', 'moderator')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      review_text TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pending', 'approved', 'rejected', 'flagged')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE moderation_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      review_id INTEGER NOT NULL,
      moderator_id INTEGER NOT NULL,
      action TEXT NOT NULL CHECK(action IN ('approve', 'reject', 'flag')),
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
      FOREIGN KEY (moderator_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX idx_reviews_product_status ON reviews(product_id, status);
    CREATE INDEX idx_reviews_user ON reviews(user_id);
    CREATE INDEX idx_reviews_status ON reviews(status);
    CREATE INDEX idx_moderation_review ON moderation_actions(review_id);
    CREATE INDEX idx_moderation_moderator ON moderation_actions(moderator_id);
  `);

  return db;
}

export function seedTestData(db) {
  const insertUser = db.prepare(`
    INSERT INTO users (id, username, email, role) 
    VALUES (?, ?, ?, ?)
  `);
  
  const insertProduct = db.prepare(`
    INSERT INTO products (id, name, description, category) 
    VALUES (?, ?, ?, ?)
  `);

  const insertReview = db.prepare(`
    INSERT INTO reviews (id, user_id, product_id, rating, review_text, status) 
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Test users
  insertUser.run(1, 'testuser1', 'user1@test.com', 'user');
  insertUser.run(2, 'testuser2', 'user2@test.com', 'user');
  insertUser.run(3, 'moderator1', 'mod1@test.com', 'moderator');

  // Test products
  insertProduct.run(1, 'Test Product 1', 'Description 1', 'Category A');
  insertProduct.run(2, 'Test Product 2', 'Description 2', 'Category B');

  // Test reviews
  insertReview.run(1, 1, 1, 5, 'Great product!', 'approved');
  insertReview.run(2, 2, 1, 4, 'Good product', 'approved');
  insertReview.run(3, 1, 2, 3, 'Average product', 'pending');
  insertReview.run(4, 2, 2, 2, 'Poor product', 'flagged');
}