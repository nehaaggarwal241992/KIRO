import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🎬 Simple Feedback and Review System Demo');
console.log('=' .repeat(50));

// Check if we can create a basic Express server
console.log('\n🚀 Testing Express server setup...');

const app = express();
app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Feedback and Review System is running!',
    timestamp: new Date().toISOString()
  });
});

// Basic API endpoints (without database for now)
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working!',
    endpoints: [
      'GET /health - Health check',
      'GET /api/test - This endpoint',
      'POST /api/reviews - Create review (not implemented yet)',
      'GET /api/products/:id/reviews - Get product reviews (not implemented yet)'
    ]
  });
});

// Mock data for demonstration
const mockProducts = [
  { id: 1, name: 'Wireless Headphones', category: 'Electronics' },
  { id: 2, name: 'Smart TV', category: 'Electronics' },
  { id: 3, name: 'Yoga Mat', category: 'Sports & Fitness' }
];

const mockReviews = [
  { id: 1, productId: 1, userId: 1, rating: 5, reviewText: 'Great product!', status: 'approved' },
  { id: 2, productId: 1, userId: 2, rating: 4, reviewText: 'Good quality', status: 'approved' },
  { id: 3, productId: 2, userId: 1, rating: 3, reviewText: 'Average', status: 'pending' }
];

app.get('/api/products', (req, res) => {
  res.json(mockProducts);
});

app.get('/api/products/:id/reviews', (req, res) => {
  const productId = parseInt(req.params.id);
  const reviews = mockReviews.filter(r => r.productId === productId && r.status === 'approved');
  res.json(reviews);
});

app.get('/api/products/:id/rating', (req, res) => {
  const productId = parseInt(req.params.id);
  const reviews = mockReviews.filter(r => r.productId === productId && r.status === 'approved');
  
  if (reviews.length === 0) {
    return res.json({ averageRating: 0, reviewCount: 0 });
  }
  
  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  res.json({ 
    averageRating: Math.round(averageRating * 100) / 100, 
    reviewCount: reviews.length 
  });
});

// Start server
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`✅ Server started successfully on port ${PORT}`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  
  console.log('\n📋 Available endpoints:');
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   GET  http://localhost:${PORT}/api/test`);
  console.log(`   GET  http://localhost:${PORT}/api/products`);
  console.log(`   GET  http://localhost:${PORT}/api/products/1/reviews`);
  console.log(`   GET  http://localhost:${PORT}/api/products/1/rating`);
  
  console.log('\n🧪 Testing endpoints...');
  
  // Test the endpoints
  setTimeout(async () => {
    try {
      console.log('\n🔍 Testing health endpoint...');
      const healthResponse = await fetch(`http://localhost:${PORT}/health`);
      const healthData = await healthResponse.json();
      console.log('✅ Health check:', healthData.message);
      
      console.log('\n🔍 Testing products endpoint...');
      const productsResponse = await fetch(`http://localhost:${PORT}/api/products`);
      const productsData = await productsResponse.json();
      console.log(`✅ Products: Found ${productsData.length} products`);
      
      console.log('\n🔍 Testing product reviews endpoint...');
      const reviewsResponse = await fetch(`http://localhost:${PORT}/api/products/1/reviews`);
      const reviewsData = await reviewsResponse.json();
      console.log(`✅ Reviews: Found ${reviewsData.length} reviews for product 1`);
      
      console.log('\n🔍 Testing product rating endpoint...');
      const ratingResponse = await fetch(`http://localhost:${PORT}/api/products/1/rating`);
      const ratingData = await ratingResponse.json();
      console.log(`✅ Rating: Average ${ratingData.averageRating} stars (${ratingData.reviewCount} reviews)`);
      
      console.log('\n🎉 All tests passed! The basic API is working.');
      console.log('\n💡 Next steps:');
      console.log('   1. Install Python and build tools to use better-sqlite3');
      console.log('   2. Or continue with sqlite3 library (requires code updates)');
      console.log('   3. Set up the database and run the full demo');
      console.log('   4. Start the frontend application');
      
      console.log('\n⏹️  Press Ctrl+C to stop the server');
      
    } catch (error) {
      console.error('❌ Test failed:', error.message);
    }
  }, 1000);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server stopped successfully');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server stopped successfully');
    process.exit(0);
  });
});