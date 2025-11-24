// Production database initialization for PostgreSQL
import db from './databaseLoader.js';

// Create all tables with proper schema (PostgreSQL syntax)
export async function initializeDatabase() {
  console.log('Initializing PostgreSQL database...');

  try {
    // Create users table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL CHECK(role IN ('user', 'moderator')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create products table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create reviews table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
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
    await db.exec(`
      CREATE TABLE IF NOT EXISTS moderation_actions (
        id SERIAL PRIMARY KEY,
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
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_reviews_product_status ON reviews(product_id, status);
      CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
      CREATE INDEX IF NOT EXISTS idx_moderation_review ON moderation_actions(review_id);
      CREATE INDEX IF NOT EXISTS idx_moderation_moderator ON moderation_actions(moderator_id);
    `);

    console.log('✅ PostgreSQL database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
}

// Seed initial data for production
async function seedInitialData() {
  console.log('Seeding initial data...');
  
  try {
    const client = await db.pool.connect();
    
    try {
      // Check if data already exists
      const userCount = await client.query('SELECT COUNT(*) FROM users');
      if (parseInt(userCount.rows[0].count) > 0) {
        console.log('Data already exists, skipping seed');
        return;
      }

      // Insert sample users
      await client.query(`
        INSERT INTO users (username, email, role) VALUES
        ('john_doe', 'john@example.com', 'user'),
        ('jane_smith', 'jane@example.com', 'user'),
        ('moderator', 'mod@example.com', 'moderator')
      `);

      // Insert sample products
      await client.query(`
        INSERT INTO products (name, description, category) VALUES
        ('Laptop Pro', 'High-performance laptop for professionals', 'Electronics'),
        ('Wireless Mouse', 'Ergonomic wireless mouse', 'Electronics'),
        ('Office Chair', 'Comfortable ergonomic office chair', 'Furniture'),
        ('Desk Lamp', 'LED desk lamp with adjustable brightness', 'Furniture'),
        ('Notebook Set', 'Set of 3 premium notebooks', 'Stationery')
      `);

      // Insert sample reviews
      await client.query(`
        INSERT INTO reviews (user_id, product_id, rating, review_text, status) VALUES
        (1, 1, 5, 'Excellent laptop! Very fast and reliable.', 'approved'),
        (2, 1, 4, 'Great performance, but a bit pricey.', 'approved'),
        (1, 2, 5, 'Best mouse I have ever used!', 'approved'),
        (2, 3, 4, 'Comfortable chair, good value for money.', 'approved'),
        (1, 4, 3, 'Decent lamp, but could be brighter.', 'pending')
      `);

      console.log('✅ Initial data seeded successfully');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error seeding data:', error);
    // Don't fail startup if seeding fails
  }
}

// Initialize database when this module is imported (only in production)
if (process.env.DATABASE_URL || process.env.NODE_ENV === 'production') {
  initializeDatabase()
    .then(() => seedInitialData())
    .catch(err => {
      console.error('Fatal error during database initialization:', err);
      process.exit(1);
    });
}
