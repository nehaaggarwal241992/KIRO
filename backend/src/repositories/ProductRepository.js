import db from '../config/databaseLoader.js';
import { getTestDatabase } from '../config/testDatabase.js';
import Product from '../models/Product.js';

class ProductRepository {
  constructor() {
    // Use test database if available, otherwise use regular database
    this.database = getTestDatabase() || db;
    
    // Check if we're using async database (PostgreSQL)
    this.isAsync = this.database.prepare && typeof this.database.prepare().run === 'function' && this.database.prepare().run.constructor.name === 'AsyncFunction';
    
    // Only prepare statements for SQLite (synchronous)
    if (!this.isAsync && this.database.prepare) {
      this.createStmt = this.database.prepare(`
        INSERT INTO products (name, description, category)
        VALUES (?, ?, ?)
      `);

      this.getByIdStmt = this.database.prepare(`
        SELECT * FROM products WHERE id = ?
      `);

      this.getAllStmt = this.database.prepare(`
        SELECT * FROM products ORDER BY created_at DESC
      `);
    }
  }

  /**
   * Create a new product
   * @param {string} name - Product name
   * @param {string} description - Product description
   * @param {string} category - Product category
   * @returns {Product} The created product
   * @throws {Error} If product creation fails
   */
  create(name, description, category) {
    try {
      // Validate input
      const product = new Product({ name, description, category });
      const validation = product.validate();
      
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Insert product using prepared statement
      const result = this.createStmt.run(name, description, category);
      
      // Return the created product with the new ID
      return new Product({
        id: result.lastInsertRowid,
        name,
        description,
        category,
        createdAt: new Date()
      });
    } catch (error) {
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  /**
   * Retrieve product by ID
   * @param {number} productId - The product ID
   * @returns {Product|null} The product or null if not found
   */
  getById(productId) {
    try {
      const row = this.getByIdStmt.get(productId);
      return row ? Product.fromRow(row) : null;
    } catch (error) {
      throw new Error(`Failed to retrieve product by ID: ${error.message}`);
    }
  }

  /**
   * Retrieve all products
   * @returns {Product[]} Array of all products
   */
  async getAll() {
    try {
      let rows;
      
      if (this.isAsync || !this.getAllStmt) {
        // PostgreSQL (async)
        const stmt = this.database.prepare('SELECT * FROM products ORDER BY created_at DESC');
        rows = await stmt.all();
      } else {
        // SQLite (sync)
        rows = this.getAllStmt.all();
      }
      
      return rows.map(row => Product.fromRow(row));
    } catch (error) {
      throw new Error(`Failed to retrieve all products: ${error.message}`);
    }
  }
}

export default ProductRepository;