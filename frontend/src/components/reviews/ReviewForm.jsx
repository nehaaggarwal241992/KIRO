import React, { useState, useEffect } from 'react';
import RatingDisplay from './RatingDisplay.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import reviewService from '../../services/reviewService.js';

const ReviewForm = ({ 
  productId, 
  existingReview = null, 
  onSubmit, 
  onCancel,
  isEditing = false 
}) => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    rating: existingReview?.rating || 5,
    reviewText: existingReview?.reviewText || '',
    hoverRating: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (existingReview) {
      setFormData({
        rating: existingReview.rating,
        reviewText: existingReview.reviewText,
        hoverRating: 0,
      });
    }
  }, [existingReview]);

  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleTextChange = (e) => {
    setFormData(prev => ({ ...prev, reviewText: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      setError('You must be logged in to submit a review');
      return;
    }

    if (!productId) {
      setError('Product ID is missing. Please refresh the page and try again.');
      console.error('ProductId is missing:', { productId });
      return;
    }

    if (!formData.reviewText.trim()) {
      setError('Please write a review');
      return;
    }

    if (formData.reviewText.length > 5000) {
      setError('Review text must be less than 5000 characters');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let result;
      if (isEditing && existingReview) {
        result = await reviewService.updateReview(existingReview.id, formData);
      } else {
        const reviewData = {
          rating: formData.rating,
          reviewText: formData.reviewText,
          productId: parseInt(productId),
          userId: user.id,
        };
        console.log('Submitting review with data:', reviewData);
        result = await reviewService.createReview(reviewData);
      }

      if (onSubmit) {
        onSubmit(result);
      }

      // Reset form if creating new review
      if (!isEditing) {
        setFormData({
          rating: 5,
          reviewText: '',
          hoverRating: 0,
        });
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRatingSelector = () => {
    const stars = [];
    const displayRating = formData.hoverRating || formData.rating;
    
    for (let i = 1; i <= 5; i++) {
      const isActive = i <= displayRating;
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => {
            console.log('Star clicked:', i);
            handleRatingChange(i);
          }}
          onMouseEnter={() => setFormData(prev => ({ ...prev, hoverRating: i }))}
          onMouseLeave={() => setFormData(prev => ({ ...prev, hoverRating: 0 }))}
          style={{
            fontSize: '40px',
            color: isActive ? '#FBBF24' : '#D1D5DB',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            transition: 'all 0.2s ease',
            transform: isActive ? 'scale(1.1)' : 'scale(1)',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.2)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = isActive ? 'scale(1.1)' : 'scale(1)';
          }}
          aria-label={`Rate ${i} out of 5 stars`}
        >
          ★
        </button>
      );
    }
    return stars;
  };

  if (!isAuthenticated()) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">Please log in to write a review.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {isEditing ? 'Edit Review' : 'Write a Review'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating selector */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
          <label className="block text-base font-semibold text-gray-800 mb-3">
            Your Rating
          </label>
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {renderRatingSelector()}
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gray-900">
                {formData.hoverRating || formData.rating}/5
              </span>
              <span className="text-xs text-gray-600">
                {formData.hoverRating ? 'Click to select' : 'Selected'}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Click on a star to rate this product
          </p>
        </div>

        {/* Review text */}
        <div>
          <textarea
            id="reviewText"
            value={formData.reviewText}
            onChange={handleTextChange}
            placeholder="Share your experience with this product... What did you like? What could be improved?"
            rows={3}
            maxLength={5000}
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
            style={{
              minHeight: '100px',
              resize: 'vertical',
            }}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">
              {formData.reviewText.length === 0 ? 'Start typing your review...' : 'Keep going!'}
            </span>
            <span className={`text-xs font-medium ${
              formData.reviewText.length > 4500 ? 'text-orange-600' : 'text-gray-500'
            }`}>
              {formData.reviewText.length}/5000 characters
            </span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="text-red-800 text-sm">{error}</div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting || !formData.reviewText.trim()}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              isEditing ? '✓ Update Review' : '✓ Submit Review'
            )}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;