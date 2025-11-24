import ProductRepository from '../repositories/ProductRepository.js';
import ReviewRepository from '../repositories/ReviewRepository.js';

class ProductService {
  constructor() {
    this.productRepository = new ProductRepository();
    this.reviewRepository = new ReviewRepository();
  }

  /**
   * Create a new product with validation
   * @param {string} name - Product name
   * @param {string} description - Product description
   * @param {string} category - Product category
   * @returns {Object} Created product object
   * @throws {Error} If validation fails or creation fails
   */
  async createProduct(name, description, category) {
    try {
      // Validate input parameters
      this._validateProductInput(name, description, category);

      // Create product through repository
      const product = this.productRepository.create(name, description, category);

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        createdAt: product.createdAt
      };
    } catch (error) {
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  /**
   * Retrieve product details by ID
   * @param {number} productId - Product ID
   * @returns {Object|null} Product object or null if not found
   */
  async getProduct(productId) {
    try {
      const product = this.productRepository.getById(productId);
      
      if (!product) {
        return null;
      }

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        createdAt: product.createdAt
      };
    } catch (error) {
      throw new Error(`Failed to retrieve product: ${error.message}`);
    }
  }

  /**
   * Get all products with review statistics
   * @returns {Object[]} Array of products with review statistics
   */
  async getAllProducts() {
    try {
      const products = await this.productRepository.getAll();
      
      // Enhance each product with review statistics
      const productsWithStats = await Promise.all(products.map(async (product) => {
        const averageRating = await this.reviewRepository.getAverageRating(product.id);
        const reviewCount = await this.reviewRepository.getReviewCount(product.id, 'approved');

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          category: product.category,
          createdAt: product.createdAt,
          reviewStatistics: {
            averageRating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
            reviewCount,
            hasReviews: reviewCount > 0
          }
        };
      }));

      return productsWithStats;
    } catch (error) {
      throw new Error(`Failed to retrieve all products: ${error.message}`);
    }
  }

  /**
   * Get product with detailed review statistics
   * @param {number} productId - Product ID
   * @returns {Object|null} Product with detailed statistics or null if not found
   */
  async getProductWithStatistics(productId) {
    try {
      const product = this.productRepository.getById(productId);
      
      if (!product) {
        return null;
      }

      // Get detailed review statistics
      const averageRating = this.reviewRepository.getAverageRating(productId);
      const approvedCount = this.reviewRepository.getReviewCount(productId, 'approved');
      const pendingCount = this.reviewRepository.getReviewCount(productId, 'pending');
      const rejectedCount = this.reviewRepository.getReviewCount(productId, 'rejected');
      const flaggedCount = this.reviewRepository.getReviewCount(productId, 'flagged');
      const totalCount = approvedCount + pendingCount + rejectedCount + flaggedCount;

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        createdAt: product.createdAt,
        reviewStatistics: {
          averageRating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
          reviewCounts: {
            approved: approvedCount,
            pending: pendingCount,
            rejected: rejectedCount,
            flagged: flaggedCount,
            total: totalCount
          },
          hasReviews: totalCount > 0,
          publicReviewCount: approvedCount // Only approved reviews are public
        }
      };
    } catch (error) {
      throw new Error(`Failed to retrieve product with statistics: ${error.message}`);
    }
  }

  /**
   * Search products by name or category
   * @param {string} searchTerm - Search term to match against name or category
   * @returns {Object[]} Array of matching products with review statistics
   */
  async searchProducts(searchTerm) {
    try {
      if (!searchTerm || typeof searchTerm !== 'string') {
        throw new Error('Search term is required and must be a string');
      }

      const allProducts = await this.getAllProducts();
      const searchTermLower = searchTerm.toLowerCase().trim();

      // Filter products by name or category (case-insensitive)
      const matchingProducts = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchTermLower) ||
        product.category.toLowerCase().includes(searchTermLower)
      );

      return matchingProducts;
    } catch (error) {
      throw new Error(`Failed to search products: ${error.message}`);
    }
  }

  /**
   * Validate product input parameters
   * @param {string} name - Product name to validate
   * @param {string} description - Product description to validate
   * @param {string} category - Product category to validate
   * @throws {Error} If validation fails
   * @private
   */
  _validateProductInput(name, description, category) {
    // Validate name
    if (!name || typeof name !== 'string') {
      throw new Error('Product name is required and must be a string');
    }

    if (name.trim().length === 0) {
      throw new Error('Product name cannot be empty');
    }

    if (name.length > 255) {
      throw new Error('Product name cannot exceed 255 characters');
    }

    // Validate description
    if (description !== null && description !== undefined) {
      if (typeof description !== 'string') {
        throw new Error('Product description must be a string');
      }

      if (description.length > 2000) {
        throw new Error('Product description cannot exceed 2000 characters');
      }
    }

    // Validate category
    if (category !== null && category !== undefined) {
      if (typeof category !== 'string') {
        throw new Error('Product category must be a string');
      }

      if (category.length > 100) {
        throw new Error('Product category cannot exceed 100 characters');
      }
    }
  }
}

export default ProductService;