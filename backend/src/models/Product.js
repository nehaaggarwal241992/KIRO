class Product {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.description = data.description || '';
    this.category = data.category || '';
    this.createdAt = data.createdAt || new Date();
  }

  /**
   * Validates the product data
   * @returns {Object} { isValid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    // Name validation (required field)
    if (!this.name || this.name.trim().length === 0) {
      errors.push('Product name is required');
    }

    // Description validation (required field)
    if (!this.description || this.description.trim().length === 0) {
      errors.push('Product description is required');
    }

    // Category validation (required field)
    if (!this.category || this.category.trim().length === 0) {
      errors.push('Product category is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Returns a plain object representation of the product
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      createdAt: this.createdAt
    };
  }

  /**
   * Creates a Product instance from database row data
   * @param {Object} row - Database row data
   * @returns {Product}
   */
  static fromRow(row) {
    return new Product({
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      createdAt: new Date(row.created_at)
    });
  }
}

export default Product;