import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Starting ReviewHub in DEBUG MODE');
console.log('=' .repeat(60));

const app = express();

// Enable detailed logging
app.use((req, res, next) => {
  console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log(`   Headers:`, JSON.stringify(req.headers, null, 2));
  next();
});

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`📤 ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Serve static files from the frontend build
const frontendDistPath = join(__dirname, '../../../frontend/dist');
console.log(`📁 Frontend path: ${frontendDistPath}`);
app.use(express.static(frontendDistPath));

// Mock data with detailed logging
const mockProducts = [
  { 
    id: 1, 
    name: 'Wireless Bluetooth Headphones', 
    description: 'Premium noise-cancelling wireless headphones with 30-hour battery life.',
    category: 'Electronics',
    createdAt: '2024-01-15T10:00:00Z'
  },
  { 
    id: 2, 
    name: '4K Smart TV 55"', 
    description: 'Ultra HD Smart TV with HDR support and built-in streaming.',
    category: 'Electronics',
    createdAt: '2024-01-20T14:30:00Z'
  },
  { 
    id: 3, 
    name: 'Yoga Mat Premium', 
    description: 'Extra-thick non-slip yoga mat with alignment guides.',
    category: 'Sports & Fitness',
    createdAt: '2024-02-01T09:15:00Z'
  },
  { 
    id: 4, 
    name: 'Smart Coffee Maker', 
    description: 'WiFi-enabled coffee maker with programmable brewing.',
    category: 'Home & Kitchen',
    createdAt: '2024-02-10T16:45:00Z'
  },
  { 
    id: 5, 
    name: 'Fitness Tracker Pro', 
    description: 'Advanced fitness tracker with heart rate monitoring and GPS.',
    category: 'Sports & Fitness',
    createdAt: '2024-02-15T11:20:00Z'
  }
];

const mockReviews = [
  { id: 1, productId: 1, userId: 1, rating: 5, reviewText: 'Amazing sound quality!', status: 'approved', createdAt: '2024-01-16T12:00:00Z' },
  { id: 2, productId: 1, userId: 2, rating: 4, reviewText: 'Great headphones, battery life is excellent.', status: 'approved', createdAt: '2024-01-18T15:30:00Z' },
  { id: 3, productId: 1, userId: 3, rating: 5, reviewText: 'Perfect for work from home.', status: 'approved', createdAt: '2024-01-22T09:45:00Z' },
  { id: 4, productId: 2, userId: 4, rating: 4, reviewText: 'Beautiful picture quality.', status: 'approved', createdAt: '2024-01-25T18:20:00Z' },
  { id: 5, productId: 2, userId: 5, rating: 5, reviewText: 'Stunning 4K display!', status: 'approved', createdAt: '2024-01-28T20:10:00Z' },
  { id: 6, productId: 3, userId: 6, rating: 5, reviewText: 'Perfect thickness and grip.', status: 'approved', createdAt: '2024-02-05T07:30:00Z' },
  { id: 7, productId: 3, userId: 7, rating: 4, reviewText: 'Good quality mat, very durable.', status: 'approved', createdAt: '2024-02-08T19:15:00Z' },
  { id: 8, productId: 4, userId: 8, rating: 3, reviewText: 'Coffee tastes good but app is unreliable.', status: 'approved', createdAt: '2024-02-12T08:45:00Z' },
  { id: 9, productId: 4, userId: 9, rating: 4, reviewText: 'Love the programmable features.', status: 'approved', createdAt: '2024-02-14T06:20:00Z' },
  { id: 10, productId: 5, userId: 10, rating: 5, reviewText: 'Accurate tracking and long battery life.', status: 'approved', createdAt: '2024-02-18T14:30:00Z' },
  { id: 11, productId: 5, userId: 1, rating: 4, reviewText: 'Great fitness tracker.', status: 'approved', createdAt: '2024-02-20T21:00:00Z' }
];

// Health check with debug info
app.get('/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.json({ 
    status: 'OK', 
    message: 'ReviewHub Debug Server is running!',
    timestamp: new Date().toISOString(),
    mode: 'DEBUG',
    endpoints: {
      health: '/health',
      products: '/api/products',
      reviews: '/api/products/:id/reviews',
      rating: '/api/products/:id/rating'
    }
  });
});

// API endpoints with detailed logging
app.get('/api/products', (req, res) => {
  console.log('📦 Fetching all products');
  console.log(`   Returning ${mockProducts.length} products`);
  res.json(mockProducts);
});

app.get('/api/products/:id/reviews', (req, res) => {
  const productId = parseInt(req.params.id);
  console.log(`⭐ Fetching reviews for product ${productId}`);
  
  const reviews = mockReviews.filter(r => r.productId === productId && r.status === 'approved');
  console.log(`   Found ${reviews.length} approved reviews`);
  
  res.json(reviews);
});

app.get('/api/products/:id/rating', (req, res) => {
  const productId = parseInt(req.params.id);
  console.log(`📊 Calculating rating for product ${productId}`);
  
  const reviews = mockReviews.filter(r => r.productId === productId && r.status === 'approved');
  
  if (reviews.length === 0) {
    console.log(`   No reviews found for product ${productId}`);
    return res.json({ averageRating: 0, reviewCount: 0 });
  }
  
  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const result = { 
    averageRating: Math.round(averageRating * 100) / 100, 
    reviewCount: reviews.length 
  };
  
  console.log(`   Average: ${result.averageRating}, Count: ${result.reviewCount}`);
  res.json(result);
});

app.get('/api/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  console.log(`📦 Fetching product ${productId}`);
  
  const product = mockProducts.find(p => p.id === productId);
  
  if (!product) {
    console.log(`   Product ${productId} not found`);
    return res.status(404).json({ error: 'Product not found' });
  }
  
  console.log(`   Found product: ${product.name}`);
  res.json(product);
});

app.post('/api/reviews', (req, res) => {
  console.log('✍️  Creating new review');
  console.log('   Body:', JSON.stringify(req.body, null, 2));
  
  const { userId, productId, rating, reviewText } = req.body;
  
  // Validation
  if (!userId || !productId || !rating || !reviewText) {
    console.log('   ❌ Validation failed: Missing required fields');
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Missing required fields: userId, productId, rating, reviewText'
      }
    });
  }
  
  const userIdNum = parseInt(userId);
  const productIdNum = parseInt(productId);
  const ratingNum = parseInt(rating);
  
  if (isNaN(userIdNum) || isNaN(productIdNum) || isNaN(ratingNum)) {
    console.log('   ❌ Validation failed: Invalid number format');
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'userId, productId, and rating must be valid numbers'
      }
    });
  }
  
  if (ratingNum < 1 || ratingNum > 5) {
    console.log('   ❌ Validation failed: Rating out of range');
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Rating must be between 1 and 5'
      }
    });
  }
  
  // Create new review
  const newReview = {
    id: mockReviews.length + 1,
    userId: userIdNum,
    productId: productIdNum,
    rating: ratingNum,
    reviewText: reviewText,
    status: 'approved',
    createdAt: new Date().toISOString()
  };
  
  mockReviews.push(newReview);
  
  console.log(`   ✅ Review created successfully with ID: ${newReview.id}`);
  res.status(201).json(newReview);
});

// Catch all handler
app.get('*', (req, res) => {
  console.log(`🌐 Serving React app for: ${req.url}`);
  res.sendFile(join(frontendDistPath, 'index.html'));
});

// Error handling with detailed logging
app.use((err, req, res, next) => {
  console.error('❌ ERROR:', err);
  console.error('   Stack:', err.stack);
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log('\n✅ DEBUG SERVER STARTED');
  console.log('=' .repeat(60));
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`📁 Frontend: ${frontendDistPath}`);
  console.log(`🔍 Debug Mode: ENABLED`);
  console.log(`📋 Logging: VERBOSE`);
  console.log('\n🎯 Breakpoints:');
  console.log('   - Set breakpoints in VS Code');
  console.log('   - Use debugger; statement in code');
  console.log('   - Check console for detailed logs');
  console.log('\n💡 Tips:');
  console.log('   - Open Chrome DevTools for frontend debugging');
  console.log('   - Check VS Code Debug Console for backend logs');
  console.log('   - Use Network tab to inspect API calls');
  console.log('=' .repeat(60));
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down debug server...');
  server.close(() => {
    console.log('✅ Debug server stopped');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down debug server...');
  server.close(() => {
    console.log('✅ Debug server stopped');
    process.exit(0);
  });
});