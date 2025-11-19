import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import RatingDisplay from '../reviews/RatingDisplay.jsx';
import ReviewList from '../reviews/ReviewList.jsx';
import ReviewForm from '../reviews/ReviewForm.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import productService from '../../services/productService.js';
import reviewService from '../../services/reviewService.js';

const ProductDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [productStats, setProductStats] = useState({ averageRating: 0, reviewCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProductData();
    }
  }, [id]);

  const fetchProductData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch product details
      const productData = await productService.getProduct(id);
      setProduct(productData);
      
      // Fetch product rating statistics
      try {
        const stats = await reviewService.getProductRating(id);
        setProductStats(stats);
      } catch (statsError) {
        // If stats fetch fails, use default values
        setProductStats({ averageRating: 0, reviewCount: 0 });
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = (newReview) => {
    setShowReviewForm(false);
    setEditingReview(null);
    setRefreshTrigger(prev => prev + 1);
    // Refresh product stats
    fetchProductData();
  };

  const handleReviewEdit = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleReviewDelete = () => {
    setRefreshTrigger(prev => prev + 1);
    // Refresh product stats
    fetchProductData();
  };

  const handleCancelReview = () => {
    setShowReviewForm(false);
    setEditingReview(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">Loading product...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-red-800 mb-2">Error: {error}</div>
          <button
            onClick={fetchProductData}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center text-gray-500">Product not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600">
        <Link to="/" className="hover:text-blue-600">Products</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      {/* Product Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              {product.category && (
                <span className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full mt-2">
                  {product.category}
                </span>
              )}
            </div>
          </div>

          {product.description && (
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          )}

          {/* Rating Summary */}
          <div className="flex items-center gap-4 py-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              {productStats.averageRating > 0 ? (
                <>
                  <RatingDisplay 
                    rating={Math.round(productStats.averageRating * 10) / 10} 
                    size="large" 
                    showNumber={false}
                  />
                  <span className="text-xl font-semibold text-gray-900">
                    {productStats.averageRating.toFixed(1)}
                  </span>
                </>
              ) : (
                <span className="text-gray-500">No ratings yet</span>
              )}
            </div>
            
            <span className="text-gray-600">
              Based on {productStats.reviewCount} review{productStats.reviewCount !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Write Review Button */}
          {isAuthenticated() && !showReviewForm && (
            <div className="pt-2">
              <button
                onClick={() => setShowReviewForm(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                Write a Review
              </button>
            </div>
          )}

          {product.createdAt && (
            <div className="text-sm text-gray-500 pt-2">
              Added on {formatDate(product.createdAt)}
            </div>
          )}
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <ReviewForm
          productId={product.id}
          existingReview={editingReview}
          isEditing={!!editingReview}
          onSubmit={handleReviewSubmit}
          onCancel={handleCancelReview}
        />
      )}

      {/* Reviews List */}
      {product && product.id && (
        <ReviewList
          productId={product.id}
          onReviewEdit={handleReviewEdit}
          onReviewDelete={handleReviewDelete}
          refreshTrigger={refreshTrigger}
        />
      )}
    </div>
  );
};

export default ProductDetail;