import db from '../config/database.js';
import { getTestDatabase } from '../config/testDatabase.js';
import Product from '../models/Product.js';

class ProductRepository {
  constructor() {
    // Use test database if available, otherwise use regular database
    const database = getTestDatabase() || db;
    
    // Prepare statements for better performance
    this.createStmt = database.prepare(`
      INSERT INTO products (name, description, category)
      VALUES (?, ?, ?)
    `);

    this.getByIdStmt = database.prepare(`
      SELECT * FROM products WHERE id = ?
    `);

    this.getAllStmt = database.prepare(`
      SELECT * FROM products ORDER BY created_at DESC
    `);
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
  getAll() {
    try {
      const rows = this.getAllStmt.all();
      return rows.map(row => Product.fromRow(row));
    } catch (error) {
      throw new Error(`Failed to retrieve all products: ${error.message}`);
    }
  }
}

export default ProductRepository;