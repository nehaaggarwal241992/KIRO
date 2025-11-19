import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import services for demonstration
import ReviewService from '../services/ReviewService.js';
import ModerationService from '../services/ModerationService.js';
import UserService from '../services/UserService.js';
import ProductService from '../services/ProductService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database file path
const dbPath = join(__dirname, '../../data/reviews.db');

console.log('🎬 Starting Feedback and Review System Demo');
console.log('=' .repeat(50));

// Create database connection
const db = new Database(dbPath);

// Initialize services
const reviewService = new ReviewService();
const moderationService = new ModerationService();
const userService = new UserService();
const productService = new ProductService();

// Helper function to pause execution
const pause = (ms = 2000) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to display section headers
const section = (title) => {
  console.log('\n' + '='.repeat(50));
  console.log(`🎯 ${title}`);
  console.log('='.repeat(50));
};

// Helper function to display results nicely
const displayResult = (label, data) => {
  console.log(`\n📋 ${label}:`);
  if (Array.isArray(data)) {
    if (data.length === 0) {
      console.log('   (No items found)');
    } else {
      data.forEach((item, index) => {
        console.log(`   ${index + 1}. ${JSON.stringify(item, null, 2).replace(/\n/g, '\n      ')}`);
      });
    }
  } else {
    console.log(`   ${JSON.stringify(data, null, 2).replace(/\n/g, '\n   ')}`);
  }
};

try {
  // Demo 1: User Review Workflow
  section('Demo 1: User Review Workflow');
  
  console.log('👤 User alice_johnson (ID: 1) wants to review a product...');
  await pause(1000);
  
  // Get a product to review
  const product = await productService.getProduct(1);
  displayResult('Product Details', product);
  await pause(1000);
  
  console.log('\n✍️ Alice creates a new review...');
  const newReview = await reviewService.createReview(1, 1, 5, 'This product is absolutely fantastic! The quality exceeded my expectations and it arrived quickly. Highly recommend to anyone looking for a reliable solution.');
  displayResult('New Review Created', newReview);
  await pause(1000);
  
  console.log('\n📝 Alice decides to update her review...');
  const updatedReview = await reviewService.updateReview(newReview.id, 1, 4, 'Updated: Still a great product, but found a minor issue after extended use. Overall very satisfied with the purchase.');
  displayResult('Updated Review', updatedReview);
  await pause(1000);
  
  console.log('\n📊 Checking product statistics after the new review...');
  const productStats = await reviewService.getProductStatistics(1);
  displayResult('Product Statistics', productStats);
  await pause(1000);

  // Demo 2: Moderation Workflow
  section('Demo 2: Moderation Workflow');
  
  console.log('🛡️ Moderator mod_sarah (ID: 11) starts their moderation session...');
  await pause(1000);
  
  console.log('\n📥 Checking the moderation queue for pending reviews...');
  const pendingQueue = await moderationService.getPendingQueue(11);
  displayResult('Pending Reviews Queue', pendingQueue.slice(0, 3)); // Show first 3
  await pause(1000);
  
  if (pendingQueue.length > 0) {
    const reviewToModerate = pendingQueue[0];
    console.log(`\n✅ Approving review ID ${reviewToModerate.id}...`);
    const approvedReview = await moderationService.approveReview(reviewToModerate.id, 11);
    displayResult('Approved Review', approvedReview);
    await pause(1000);
  }
  
  if (pendingQueue.length > 1) {
    const reviewToReject = pendingQueue[1];
    console.log(`\n❌ Rejecting review ID ${reviewToReject.id} for policy violation...`);
    const rejectedReview = await moderationService.rejectReview(reviewToReject.id, 11, 'Contains inappropriate language and violates community guidelines.');
    displayResult('Rejected Review', rejectedReview);
    await pause(1000);
  }
  
  console.log('\n🚩 Checking flagged reviews...');
  const flaggedReviews = await moderationService.getFlaggedReviews(11);
  displayResult('Flagged Reviews', flaggedReviews.slice(0, 2)); // Show first 2
  await pause(1000);
  
  if (flaggedReviews.length > 0) {
    const reviewToFlag = flaggedReviews[0];
    console.log(`\n🔍 Adding additional notes to flagged review ID ${reviewToFlag.id}...`);
    const reflaggedReview = await moderationService.flagReview(reviewToFlag.id, 11, 'Requires additional investigation - potential coordinated fake reviews detected.');
    displayResult('Re-flagged Review', reflaggedReview);
    await pause(1000);
  }

  // Demo 3: Statistics and Analytics
  section('Demo 3: Statistics and Analytics');
  
  console.log('📈 Generating moderation statistics...');
  const stats = await moderationService.getStatistics(11);
  displayResult('Moderation Statistics', stats);
  await pause(1000);
  
  console.log('\n📚 Viewing moderation history (last 10 actions)...');
  const history = await moderationService.getModerationHistory(11);
  displayResult('Recent Moderation History', history.slice(0, 10));
  await pause(1000);

  // Demo 4: Product Review Display
  section('Demo 4: Product Review Display');
  
  console.log('🛍️ Customer browsing product reviews...');
  
  // Get reviews for a popular product
  const productReviews = await reviewService.getProductReviews(1);
  displayResult('Product Reviews (Approved Only)', productReviews.slice(0, 5)); // Show first 5
  await pause(1000);
  
  console.log('\n⭐ Product rating summary...');
  const ratingSummary = await reviewService.getProductStatistics(1);
  displayResult('Rating Summary', ratingSummary);
  await pause(1000);

  // Demo 5: User Management
  section('Demo 5: User Management');
  
  console.log('👥 User management operations...');
  
  const user = await userService.getUser(1);
  displayResult('User Profile', user);
  await pause(1000);
  
  const isModerator = await userService.verifyModerator(11);
  console.log(`\n🛡️ User ID 11 moderator status: ${isModerator ? 'VERIFIED' : 'NOT A MODERATOR'}`);
  await pause(1000);

  // Demo 6: Database Analytics
  section('Demo 6: System Analytics');
  
  console.log('📊 Generating system-wide analytics...');
  
  // Overall system statistics
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  const totalReviews = db.prepare('SELECT COUNT(*) as count FROM reviews').get().count;
  const totalModerationActions = db.prepare('SELECT COUNT(*) as count FROM moderation_actions').get().count;
  
  const systemStats = {
    totalUsers,
    totalProducts,
    totalReviews,
    totalModerationActions,
    averageRating: db.prepare('SELECT ROUND(AVG(CAST(rating AS REAL)), 2) as avg FROM reviews WHERE status = "approved"').get().avg
  };
  
  displayResult('System Statistics', systemStats);
  await pause(1000);
  
  // Review status distribution
  const statusDistribution = db.prepare(`
    SELECT status, COUNT(*) as count, 
           ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM reviews), 2) as percentage
    FROM reviews 
    GROUP BY status 
    ORDER BY count DESC
  `).all();
  
  displayResult('Review Status Distribution', statusDistribution);
  await pause(1000);
  
  // Top rated products
  const topProducts = db.prepare(`
    SELECT p.name, p.category,
           ROUND(AVG(CAST(r.rating AS REAL)), 2) as avg_rating,
           COUNT(r.id) as review_count
    FROM products p
    LEFT JOIN reviews r ON p.id = r.product_id AND r.status = 'approved'
    GROUP BY p.id, p.name, p.category
    HAVING review_count >= 3
    ORDER BY avg_rating DESC, review_count DESC
    LIMIT 5
  `).all();
  
  displayResult('Top Rated Products (min 3 reviews)', topProducts);
  await pause(1000);
  
  // Most active moderators
  const activeModerators = db.prepare(`
    SELECT u.username, u.email,
           COUNT(ma.id) as actions_count,
           COUNT(CASE WHEN ma.action = 'approve' THEN 1 END) as approvals,
           COUNT(CASE WHEN ma.action = 'reject' THEN 1 END) as rejections,
           COUNT(CASE WHEN ma.action = 'flag' THEN 1 END) as flags
    FROM users u
    LEFT JOIN moderation_actions ma ON u.id = ma.moderator_id
    WHERE u.role = 'moderator'
    GROUP BY u.id, u.username, u.email
    ORDER BY actions_count DESC
  `).all();
  
  displayResult('Moderator Activity Summary', activeModerators);
  await pause(1000);

  // Demo 7: Error Handling Examples
  section('Demo 7: Error Handling Examples');
  
  console.log('🚨 Demonstrating error handling...');
  
  try {
    console.log('\n❌ Attempting to create review with invalid rating...');
    await reviewService.createReview(1, 1, 6, 'Invalid rating test');
  } catch (error) {
    console.log(`   ✅ Caught validation error: ${error.message}`);
  }
  
  try {
    console.log('\n❌ Attempting to moderate non-existent review...');
    await moderationService.approveReview(99999, 11);
  } catch (error) {
    console.log(`   ✅ Caught not found error: ${error.message}`);
  }
  
  try {
    console.log('\n❌ Regular user attempting moderation...');
    await moderationService.getPendingQueue(1); // Regular user ID
  } catch (error) {
    console.log(`   ✅ Caught authorization error: ${error.message}`);
  }
  
  await pause(1000);

  // Demo Complete
  section('Demo Complete! 🎉');
  
  console.log('✅ Successfully demonstrated:');
  console.log('   • User review creation and management');
  console.log('   • Moderation workflows and actions');
  console.log('   • Statistics and analytics generation');
  console.log('   • Product review display');
  console.log('   • User management operations');
  console.log('   • System-wide analytics');
  console.log('   • Error handling and validation');
  
  console.log('\n🚀 The Feedback and Review System is fully functional!');
  console.log('\n💡 Next steps:');
  console.log('   • Start the backend server: npm start');
  console.log('   • Start the frontend: npm run dev');
  console.log('   • Run tests: npm test');
  console.log('   • View API documentation in the routes files');

} catch (error) {
  console.error('\n❌ Demo error:', error);
  console.error('Stack trace:', error.stack);
} finally {
  db.close();
  console.log('\n🔌 Database connection closed.');
}