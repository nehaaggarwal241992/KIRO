import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RatingDisplay from '../reviews/RatingDisplay.jsx';
import productService from '../../services/productService.js';
import reviewService from '../../services/reviewService.js';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productStats, setProductStats] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const productsData = await productService.getAllProducts();
      setProducts(Array.isArray(productsData) ? productsData : []);
      
      // Fetch rating statistics for each product
      const stats = {};
      for (const product of productsData) {
        try {
          const rating = await reviewService.getProductRating(product.id);
          stats[product.id] = rating;
        } catch (err) {
          // If rating fetch fails, set default values
          stats[product.id] = { averageRating: 0, reviewCount: 0 };
        }
      }
      setProductStats(stats);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center" style={{ padding: '4rem 0' }}>
        <div className="flex items-center gap-3">
          <div className="spinner"></div>
          <span className="text-gray-600">Loading amazing products...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ background: 'rgba(239, 68, 68, 0.05)', borderColor: 'var(--error-color)' }}>
        <div className="flex items-center gap-3 mb-4">
          <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          <div>
            <h3 className="font-semibold text-red-800">Oops! Something went wrong</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
        <button
          onClick={fetchProducts}
          className="btn btn-danger"
        >
          🔄 Try again
        </button>
      </div>
    );
  }

  return (
    <div className="slide-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 style={{ 
            fontSize: 'var(--font-size-4xl)', 
            fontWeight: '700',
            background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 'var(--spacing-2)'
          }}>
            🛍️ Discover Products
          </h1>
          <p className="text-gray-600">Find the perfect products with authentic reviews</p>
        </div>
        <div className="badge badge-info" style={{ fontSize: 'var(--font-size-sm)' }}>
          {products.length} product{products.length !== 1 ? 's' : ''} available
        </div>
      </div>

      {products.length === 0 ? (
        <div className="card text-center" style={{ padding: '4rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-4)' }}>🛒</div>
          <h3 className="text-xl font-semibold mb-2">No products available</h3>
          <p className="text-gray-500">Check back later for amazing products!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => {
            const stats = productStats[product.id] || { averageRating: 0, reviewCount: 0 };
            
            return (
              <div
                key={product.id}
                className="card fade-in"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Category Badge */}
                {product.category && (
                  <div style={{
                    position: 'absolute',
                    top: 'var(--spacing-4)',
                    right: 'var(--spacing-4)',
                    zIndex: 10
                  }}>
                    <span className="badge badge-info">
                      {product.category}
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                  <div>
                    <h3 style={{ 
                      fontSize: 'var(--font-size-xl)', 
                      fontWeight: '600',
                      marginBottom: 'var(--spacing-2)',
                      lineHeight: '1.3'
                    }}>
                      <Link
                        to={`/products/${product.id}`}
                        style={{ 
                          textDecoration: 'none',
                          color: 'var(--gray-900)',
                          transition: 'color var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => e.target.style.color = 'var(--primary-color)'}
                        onMouseLeave={(e) => e.target.style.color = 'var(--gray-900)'}
                      >
                        {product.name}
                      </Link>
                    </h3>
                  </div>

                  {product.description && (
                    <p style={{ 
                      color: 'var(--gray-600)', 
                      fontSize: 'var(--font-size-sm)',
                      lineHeight: '1.6',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {stats.averageRating > 0 ? (
                        <>
                          <RatingDisplay 
                            rating={Math.round(stats.averageRating * 10) / 10} 
                            size="small" 
                            showNumber={false}
                          />
                          <span style={{ 
                            fontSize: 'var(--font-size-sm)', 
                            fontWeight: '600',
                            color: 'var(--gray-700)'
                          }}>
                            {stats.averageRating.toFixed(1)}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">⭐ No ratings yet</span>
                      )}
                    </div>
                    
                    <span className="badge badge-gray">
                      {stats.reviewCount} review{stats.reviewCount !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="flex items-center justify-between" style={{ marginTop: 'auto' }}>
                    <Link
                      to={`/products/${product.id}`}
                      className="btn btn-primary"
                      style={{ textDecoration: 'none' }}
                    >
                      👀 View Details
                    </Link>
                    
                    {product.createdAt && (
                      <span style={{ 
                        fontSize: 'var(--font-size-xs)', 
                        color: 'var(--gray-400)'
                      }}>
                        Added {formatDate(product.createdAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductList;