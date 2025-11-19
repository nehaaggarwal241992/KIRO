import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database file path
const dbPath = join(__dirname, '../../data/reviews.db');

console.log('🌱 Starting database seeding...');

// Create database connection
const db = new sqlite3.Database(dbPath);

// Promisify database operations
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Enable foreign keys
await run('PRAGMA foreign_keys = ON');

(async () => {
  try {
    // Clear existing data (in reverse order due to foreign keys)
    console.log('🧹 Clearing existing data...');
    
    await run('DELETE FROM moderation_actions');
    await run('DELETE FROM reviews');
    await run('DELETE FROM products');
    await run('DELETE FROM users');
    
    // Reset auto-increment counters
    await run('DELETE FROM sqlite_sequence WHERE name IN ("users", "products", "reviews", "moderation_actions")');

    console.log('👥 Seeding users...');
    
    // Regular users
    const users = [
    ['alice_johnson', 'alice.johnson@email.com', 'user'],
    ['bob_smith', 'bob.smith@email.com', 'user'],
    ['carol_davis', 'carol.davis@email.com', 'user'],
    ['david_wilson', 'david.wilson@email.com', 'user'],
    ['emma_brown', 'emma.brown@email.com', 'user'],
    ['frank_miller', 'frank.miller@email.com', 'user'],
    ['grace_taylor', 'grace.taylor@email.com', 'user'],
    ['henry_anderson', 'henry.anderson@email.com', 'user'],
    ['iris_thomas', 'iris.thomas@email.com', 'user'],
    ['jack_martinez', 'jack.martinez@email.com', 'user'],
    
    // Moderators
    ['mod_sarah', 'sarah.moderator@company.com', 'moderator'],
    ['mod_mike', 'mike.moderator@company.com', 'moderator'],
    ['mod_lisa', 'lisa.moderator@company.com', 'moderator']
  ];

    for (const [username, email, role] of users) {
      await run('INSERT INTO users (username, email, role) VALUES (?, ?, ?)', [username, email, role]);
    }

    console.log(`✅ Created ${users.length} users (${users.filter(u => u[2] === 'user').length} regular users, ${users.filter(u => u[2] === 'moderator').length} moderators)`);

    console.log('📦 Seeding products...');

  const products = [
    // Electronics
    ['Wireless Bluetooth Headphones', 'Premium noise-cancelling wireless headphones with 30-hour battery life and superior sound quality.', 'Electronics'],
    ['4K Smart TV 55"', 'Ultra HD Smart TV with HDR support, built-in streaming apps, and voice control.', 'Electronics'],
    ['Gaming Laptop Pro', 'High-performance gaming laptop with RTX graphics, 16GB RAM, and 1TB SSD storage.', 'Electronics'],
    ['Smartphone X12', 'Latest flagship smartphone with triple camera system, 5G connectivity, and all-day battery.', 'Electronics'],
    ['Wireless Charging Pad', 'Fast wireless charging pad compatible with all Qi-enabled devices.', 'Electronics'],
    
    // Home & Garden
    ['Robot Vacuum Cleaner', 'Smart robot vacuum with mapping technology, app control, and automatic dirt disposal.', 'Home & Garden'],
    ['Air Purifier HEPA', 'Advanced air purifier with HEPA filter, removes 99.97% of airborne particles.', 'Home & Garden'],
    ['Smart Thermostat', 'WiFi-enabled programmable thermostat with energy-saving features and remote control.', 'Home & Garden'],
    ['LED Desk Lamp', 'Adjustable LED desk lamp with multiple brightness levels and USB charging port.', 'Home & Garden'],
    ['Garden Tool Set', 'Complete 10-piece garden tool set with ergonomic handles and storage case.', 'Home & Garden'],
    
    // Books
    ['The Art of Programming', 'Comprehensive guide to software development best practices and design patterns.', 'Books'],
    ['Cooking Mastery', 'Professional cookbook with 200+ recipes from world-renowned chefs.', 'Books'],
    ['Mindfulness Journey', 'A practical guide to meditation and mindfulness for stress reduction and mental clarity.', 'Books'],
    ['History of Innovation', 'Fascinating exploration of breakthrough inventions that changed the world.', 'Books'],
    ['Photography Essentials', 'Complete guide to digital photography techniques and post-processing.', 'Books'],
    
    // Sports & Fitness
    ['Yoga Mat Premium', 'Extra-thick non-slip yoga mat with alignment guides and carrying strap.', 'Sports & Fitness'],
    ['Resistance Band Set', 'Complete resistance band workout system with multiple resistance levels.', 'Sports & Fitness'],
    ['Running Shoes Elite', 'Professional running shoes with advanced cushioning and breathable mesh upper.', 'Sports & Fitness'],
    ['Fitness Tracker Pro', 'Advanced fitness tracker with heart rate monitoring, GPS, and sleep tracking.', 'Sports & Fitness'],
    ['Adjustable Dumbbells', 'Space-saving adjustable dumbbells with quick weight change system.', 'Sports & Fitness']
  ];

    for (const [name, description, category] of products) {
      await run('INSERT INTO products (name, description, category) VALUES (?, ?, ?)', [name, description, category]);
    }

    console.log(`✅ Created ${products.length} products across ${[...new Set(products.map(p => p[2]))].length} categories`);

    console.log('⭐ Seeding reviews...');

  // Sample review texts for different ratings
  const reviewTexts = {
    5: [
      "Absolutely amazing product! Exceeded all my expectations. Highly recommended!",
      "Perfect quality and fast shipping. Couldn't be happier with this purchase.",
      "Outstanding! This is exactly what I was looking for. Five stars!",
      "Incredible value for money. Works flawlessly and looks great.",
      "Best purchase I've made this year. Quality is top-notch."
    ],
    4: [
      "Really good product with minor room for improvement. Would buy again.",
      "Great quality overall. Small issues but nothing major.",
      "Very satisfied with this purchase. Good value for the price.",
      "Works well and looks nice. A few minor quirks but still recommended.",
      "Solid product that does what it promises. Happy with the quality."
    ],
    3: [
      "Decent product but has some limitations. Average quality for the price.",
      "It's okay, does the job but nothing special. Could be better.",
      "Mixed feelings about this one. Some good points, some not so much.",
      "Average product. Works as expected but not particularly impressive.",
      "Fair quality. Gets the job done but there are better options available."
    ],
    2: [
      "Disappointed with the quality. Expected much better for this price.",
      "Has several issues that make it frustrating to use. Not recommended.",
      "Poor build quality and doesn't work as advertised. Returning it.",
      "Not worth the money. Many problems and poor customer service.",
      "Cheaply made and breaks easily. Look elsewhere for better options."
    ],
    1: [
      "Terrible product! Complete waste of money. Avoid at all costs!",
      "Worst purchase ever. Doesn't work at all and poor quality materials.",
      "Absolutely horrible. Broke within days and no support from seller.",
      "Don't buy this! Completely useless and overpriced junk.",
      "Extremely disappointed. Product is nothing like described. Scam!"
    ]
  };

  // Suspicious/flagged review texts
  const flaggedReviewTexts = [
    "This is SPAM! Visit my website for better deals! www.fake-site.com",
    "I'll give 5 stars if you pay me! Contact me for paid reviews.",
    "Terrible! The seller is a scammer and thief! Report them immediately!",
    "Buy from my store instead! Much better prices and quality!",
    "This review is fake! I was paid to write this! Don't trust other reviews!",
    "CLICK HERE FOR FREE PRODUCTS!!! Limited time offer!!!",
    "The company stole my credit card info! Beware! They are criminals!",
    "I work for the competitor and this product is garbage compared to ours!",
    "Inappropriate content that violates community standards and guidelines.",
    "This is a bot review. Beep boop. Automated spam message here."
  ];

  // Generate reviews for products
  const reviews = [];
  
  // Create a mix of reviews across all products
  for (let productId = 1; productId <= products.length; productId++) {
    const numReviews = Math.floor(Math.random() * 8) + 3; // 3-10 reviews per product
    
    for (let i = 0; i < numReviews; i++) {
      const userId = Math.floor(Math.random() * 10) + 1; // Users 1-10 (regular users)
      const rating = Math.floor(Math.random() * 5) + 1; // 1-5 stars
      const reviewText = reviewTexts[rating][Math.floor(Math.random() * reviewTexts[rating].length)];
      
      // Determine status (more pending and flagged for moderation queue)
      let status;
      const statusRand = Math.random();
      if (statusRand < 0.55) {
        status = 'approved';
      } else if (statusRand < 0.75) {
        status = 'pending';
      } else if (statusRand < 0.85) {
        status = 'rejected';
      } else {
        status = 'flagged';
      }
      
      reviews.push([userId, productId, rating, reviewText, status]);
    }
  }
  
  // Add specific flagged reviews for demonstration
  console.log('🚩 Adding flagged reviews for moderation queue...');
  const flaggedReviews = [
    [1, 1, 1, flaggedReviewTexts[0], 'flagged'],
    [2, 3, 5, flaggedReviewTexts[1], 'flagged'],
    [3, 5, 1, flaggedReviewTexts[2], 'flagged'],
    [4, 7, 2, flaggedReviewTexts[3], 'flagged'],
    [5, 10, 1, flaggedReviewTexts[4], 'flagged'],
    [6, 12, 5, flaggedReviewTexts[5], 'flagged'],
    [7, 15, 1, flaggedReviewTexts[6], 'flagged'],
    [8, 18, 2, flaggedReviewTexts[7], 'flagged'],
    [9, 2, 1, flaggedReviewTexts[8], 'flagged'],
    [10, 8, 3, flaggedReviewTexts[9], 'flagged']
  ];
  
  reviews.push(...flaggedReviews);
  
  // Add more pending reviews for moderation queue
  console.log('⏳ Adding pending reviews for moderation queue...');
  const pendingReviews = [
    [1, 4, 4, "Good product but delivery was slow. Overall satisfied.", 'pending'],
    [2, 6, 3, "Average quality. Nothing special but works fine.", 'pending'],
    [3, 9, 5, "Excellent! Highly recommend to everyone!", 'pending'],
    [4, 11, 2, "Not what I expected. Quality could be better.", 'pending'],
    [5, 13, 4, "Pretty good value for money. Would buy again.", 'pending'],
    [6, 16, 5, "Amazing product! Best purchase this month!", 'pending'],
    [7, 19, 3, "It's okay. Does what it says on the box.", 'pending'],
    [8, 20, 4, "Good quality and fast shipping. Happy customer.", 'pending']
  ];
  
  reviews.push(...pendingReviews);

    // Insert all reviews
    for (const [userId, productId, rating, reviewText, status] of reviews) {
      await run('INSERT INTO reviews (user_id, product_id, rating, review_text, status) VALUES (?, ?, ?, ?, ?)', 
        [userId, productId, rating, reviewText, status]);
    }

    console.log(`✅ Created ${reviews.length} reviews`);
    console.log(`   - ${reviews.filter(r => r[4] === 'approved').length} approved`);
    console.log(`   - ${reviews.filter(r => r[4] === 'pending').length} pending`);
    console.log(`   - ${reviews.filter(r => r[4] === 'rejected').length} rejected`);
    console.log(`   - ${reviews.filter(r => r[4] === 'flagged').length} flagged`);

    console.log('🛡️ Seeding moderation actions...');
    
    // Get all non-pending reviews to create moderation history
    const processedReviews = await all('SELECT id, status FROM reviews WHERE status != ?', ['pending']);

  const moderationNotes = {
    approve: [
      'Review meets quality standards',
      'Helpful and constructive feedback',
      'Appropriate content and language',
      'Verified purchase review',
      'Detailed and informative'
    ],
    reject: [
      'Contains inappropriate language',
      'Spam or promotional content',
      'Not related to the product',
      'Violates community guidelines',
      'Duplicate review detected'
    ],
    flag: [
      'Potentially fake review',
      'Suspicious activity detected',
      'Needs further investigation',
      'Reported by multiple users',
      'Unusual review pattern'
    ]
  };

    for (const review of processedReviews) {
      const moderatorId = Math.floor(Math.random() * 3) + 11; // Moderators 11-13
      let action;
      
      // Map status to action
      if (review.status === 'approved') {
        action = 'approve';
      } else if (review.status === 'rejected') {
        action = 'reject';
      } else if (review.status === 'flagged') {
        action = 'flag';
      }
      
      if (action) {
        const notes = moderationNotes[action][Math.floor(Math.random() * moderationNotes[action].length)];
        await run('INSERT INTO moderation_actions (review_id, moderator_id, action, notes) VALUES (?, ?, ?, ?)',
          [review.id, moderatorId, action, notes]);
      }
    }

    console.log(`✅ Created ${processedReviews.length} moderation actions`);

    // Display summary statistics
    console.log('\n📊 Database Summary:');
    
    const userCount = (await get('SELECT COUNT(*) as count FROM users')).count;
    const productCount = (await get('SELECT COUNT(*) as count FROM products')).count;
    const reviewCount = (await get('SELECT COUNT(*) as count FROM reviews')).count;
    const moderationCount = (await get('SELECT COUNT(*) as count FROM moderation_actions')).count;
    
    console.log(`   👥 Users: ${userCount}`);
    console.log(`   📦 Products: ${productCount}`);
    console.log(`   ⭐ Reviews: ${reviewCount}`);
    console.log(`   🛡️ Moderation Actions: ${moderationCount}`);

    // Show review status breakdown
    const statusBreakdown = await all(`
      SELECT status, COUNT(*) as count 
      FROM reviews 
      GROUP BY status 
      ORDER BY count DESC
    `);

    console.log('\n📈 Review Status Breakdown:');
    statusBreakdown.forEach(({ status, count }) => {
      console.log(`   ${status}: ${count}`);
    });

    // Show average ratings by category
    const categoryRatings = await all(`
      SELECT p.category, 
             ROUND(AVG(CAST(r.rating AS REAL)), 2) as avg_rating,
             COUNT(r.id) as review_count
      FROM products p
      LEFT JOIN reviews r ON p.id = r.product_id AND r.status = 'approved'
      GROUP BY p.category
      ORDER BY avg_rating DESC
    `);

    console.log('\n🏆 Average Ratings by Category:');
    categoryRatings.forEach(({ category, avg_rating, review_count }) => {
      console.log(`   ${category}: ${avg_rating || 'No reviews'} (${review_count} reviews)`);
    });

    console.log('\n🎉 Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    db.close();
  }
})();