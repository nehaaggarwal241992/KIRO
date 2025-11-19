import api from './api.js';

export const productService = {
  // Get all products
  async getAllProducts() {
    const response = await api.get('/products');
    return response.data;
  },

  // Get a specific product by ID
  async getProduct(productId) {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  },

  // Create a new product (if needed for admin functionality)
  async createProduct(productData) {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Update a product (if needed for admin functionality)
  async updateProduct(productId, productData) {
    const response = await api.put(`/products/${productId}`, productData);
    return response.data;
  },

  // Delete a product (if needed for admin functionality)
  async deleteProduct(productId) {
    await api.delete(`/products/${productId}`);
    return true;
  },
};

export default productService;