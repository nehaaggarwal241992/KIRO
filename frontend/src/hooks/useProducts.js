import { useState, useEffect, useCallback } from 'react';
import productService from '../services/productService.js';

// Hook for fetching all products
export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await productService.getAllProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const refetch = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch,
  };
};

// Hook for fetching a single product
export const useProduct = (productId) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProduct = useCallback(async () => {
    if (!productId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await productService.getProduct(productId);
      setProduct(data);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const refetch = useCallback(() => {
    fetchProduct();
  }, [fetchProduct]);

  return {
    product,
    loading,
    error,
    refetch,
  };
};

// Hook for managing product CRUD operations (if needed for admin functionality)
export const useProductActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createProduct = useCallback(async (productData, onSuccess) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await productService.createProduct(productData);
      if (onSuccess) {
        onSuccess(result);
      }
      return result;
    } catch (err) {
      console.error('Error creating product:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProduct = useCallback(async (productId, productData, onSuccess) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await productService.updateProduct(productId, productData);
      if (onSuccess) {
        onSuccess(result);
      }
      return result;
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProduct = useCallback(async (productId, onSuccess) => {
    setLoading(true);
    setError(null);
    
    try {
      await productService.deleteProduct(productId);
      if (onSuccess) {
        onSuccess(productId);
      }
      return true;
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    clearError,
  };
};

export default useProducts;