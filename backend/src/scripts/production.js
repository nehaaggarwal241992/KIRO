import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Simple error handler for production
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong!'
    }
  });
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting ReviewHub Production Server');
console.log('=' .repeat(50));

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the frontend build
const frontendDistPath = join(__dirname, '../../../frontend/dist');
app.use(express.static(frontendDistPath));

// API Routes will be handled by mock endpoints below

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ReviewHub Production Server is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mock data for demonstration (in production, this would come from a real database)
const mockProducts = [
  { 
    id: 1, 
    name: 'Wireless Bluetooth Headphones', 
    description: 'Premium noise-cancelling wireless headphones with 30-hour battery life and superior sound quality.',
    category: 'Electronics',
    createdAt: '2024-01-15T10:00:00Z'
  },
  { 
    id: 2, 
    name: '4K Smart TV 55"', 
    description: 'Ultra HD Smart TV with HDR support, built-in streaming apps, and voice control.',
    category: 'Electronics',
    createdAt: '2024-01-20T14:30:00Z'
  },
  { 
    id: 3, 
    name: 'Yoga Mat Premium', 
    description: 'Extra-thick non-slip yoga mat with alignment guides and carrying strap.',
    category: 'Sports & Fitness',
    createdAt: '2024-02-01T09:15:00Z'
  },
  { 
    id: 4, 
    name: 'Smart Coffee Maker', 
    description: 'WiFi-enabled coffee maker with programmable brewing and mobile app control.',
    category: 'Home & Kitchen',
    createdAt: '2024-02-10T16:45:00Z'
  },
  { 
    id: 5, 
    name: 'Fitness Tracker Pro', 
    description: 'Advanced fitness tracker with heart rate monitoring, GPS, and sleep tracking.',
    category: 'Sports & Fitness',
    createdAt: '2024-02-15T11:20:00Z'
  }
];

const mockReviews = [
  { id: 1, productId: 1, userId: 1, rating: 5, reviewText: 'Amazing sound quality! Best headphones I\'ve ever owned.', status: 'approved', createdAt: '2024-01-16T12:00:00Z' },
  { id: 2, productId: 1, userId: 2, rating: 4, reviewText: 'Great headphones, battery life is excellent. Slightly heavy but worth it.', status: 'approved', createdAt: '2024-01-18T15:30:00Z' },
  { id: 3, productId: 1, userId: 3, rating: 5, reviewText: 'Perfect for work from home. Noise cancellation is incredible!', status: 'approved', createdAt: '2024-01-22T09:45:00Z' },
  
  { id: 4, productId: 2, userId: 4, rating: 4, reviewText: 'Beautiful picture quality and easy setup. Smart features work well.', status: 'approved', createdAt: '2024-01-25T18:20:00Z' },
  { id: 5, productId: 2, userId: 5, rating: 5, reviewText: 'Stunning 4K display! Streaming is smooth and interface is intuitive.', status: 'approved', createdAt: '2024-01-28T20:10:00Z' },
  
  { id: 6, productId: 3, userId: 6, rating: 5, reviewText: 'Perfect thickness and grip. The alignment guides are really helpful.', status: 'approved', createdAt: '2024-02-05T07:30:00Z' },
  { id: 7, productId: 3, userId: 7, rating: 4, reviewText: 'Good quality mat, very durable. Carrying strap is convenient.', status: 'approved', createdAt: '2024-02-08T19:15:00Z' },
  
  { id: 8, productId: 4, userId: 8, rating: 3, reviewText: 'Coffee tastes good but app connectivity is sometimes unreliable.', status: 'approved', createdAt: '2024-02-12T08:45:00Z' },
  { id: 9, productId: 4, userId: 9, rating: 4, reviewText: 'Love the programmable features. Makes great coffee every morning.', status: 'approved', createdAt: '2024-02-14T06:20:00Z' },
  
  { id: 10, productId: 5, userId: 10, rating: 5, reviewText: 'Accurate tracking and long battery life. GPS is very precise.', status: 'approved', createdAt: '2024-02-18T14:30:00Z' },
  { id: 11, productId: 5, userId: 1, rating: 4, reviewText: 'Great fitness tracker, sleep monitoring is detailed and helpful.', status: 'approved', createdAt: '2024-02-20T21:00:00Z' }
];

// Mock API endpoints
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

// Catch all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(join(frontendDistPath, 'index.html'));
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`✅ ReviewHub Production Server started successfully!`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`📁 Serving frontend from: ${frontendDistPath}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  
  console.log('\n📋 Available endpoints:');
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   GET  http://localhost:${PORT}/api/products`);
  console.log(`   GET  http://localhost:${PORT}/api/products/:id/reviews`);
  console.log(`   GET  http://localhost:${PORT}/api/products/:id/rating`);
  console.log(`   GET  http://localhost:${PORT}/ (React App)`);
  
  console.log('\n🎉 Production build is ready!');
  console.log('💡 The app combines both frontend and backend in a single server.');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down production server...');
  server.close(() => {
    console.log('✅ Production server stopped successfully');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down production server...');
  server.close(() => {
    console.log('✅ Production server stopped successfully');
    process.exit(0);
  });
});