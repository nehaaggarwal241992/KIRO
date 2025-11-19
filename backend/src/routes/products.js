import express from 'express';
import ReviewService from '../services/ReviewService.js';
import ProductService from '../services/ProductService.js';

const router = express.Router();
const reviewService = new ReviewService();
const productService = new ProductService();

/**
 * GET /api/products - Get all products with review statistics
 */
router.get('/', async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error retrieving products:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve products'
      }
    });
  }
});

/**
 * GET /api/products/:id - Get a specific product with detailed statistics
 */
router.get('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    if (isNaN(productId)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Product ID must be a valid number',
          field: 'id'
        }
      });
    }

    const product = await productService.getProductWithStatistics(productId);
    
    if (!product) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Product not found',
          field: 'id'
        }
      });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('Error retrieving product:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve product'
      }
    });
  }
});

/**
 * GET /api/products/:id/reviews - Get all approved reviews for a product
 * Requirements: 2.1, 2.4, 2.5
 */
router.get('/:id/reviews', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    if (isNaN(productId)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Product ID must be a valid number',
          field: 'id'
        }
      });
    }

    const reviews = await reviewService.getProductReviews(productId);
    
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error retrieving product reviews:', error);
    
    if (error.message.includes('Product not found')) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Product not found',
          field: 'id'
        }
      });
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve product reviews'
      }
    });
  }
});

/**
 * GET /api/products/:id/rating - Get average rating and review count for a product
 * Requirements: 2.2, 2.3
 */
router.get('/:id/rating', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    if (isNaN(productId)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Product ID must be a valid number',
          field: 'id'
        }
      });
    }

    const statistics = await reviewService.getProductStatistics(productId);
    
    res.status(200).json(statistics);
  } catch (error) {
    console.error('Error retrieving product statistics:', error);
    
    if (error.message.includes('Product not found')) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Product not found',
          field: 'id'
        }
      });
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve product statistics'
      }
    });
  }
});

export default router;