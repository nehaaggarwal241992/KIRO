import db from './databaseLoader.js';

// Create all tables with proper schema
export function initializeDatabase() {
  console.log('Initializing database...');

  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL CHECK(role IN ('user', 'moderator')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create reviews table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
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
    )
  `);

  // Create moderation_actions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS moderation_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      review_id INTEGER NOT NULL,
      moderator_id INTEGER NOT NULL,
      action TEXT NOT NULL CHECK(action IN ('approve', 'reject', 'flag')),
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
      FOREIGN KEY (moderator_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_reviews_product_status ON reviews(product_id, status);
    CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
    CREATE INDEX IF NOT EXISTS idx_moderation_review ON moderation_actions(review_id);
    CREATE INDEX IF NOT EXISTS idx_moderation_moderator ON moderation_actions(moderator_id);
  `);

  console.log('Database initialized successfully');
}

// Initialize database when this module is imported
initializeDatabase();