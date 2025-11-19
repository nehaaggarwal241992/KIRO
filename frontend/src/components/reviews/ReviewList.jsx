import React, { useState, useEffect } from 'react';
import ReviewCard from './ReviewCard.jsx';
import reviewService from '../../services/reviewService.js';

const ReviewList = ({ 
  productId, 
  userId, 
  showUserReviews = false, 
  onReviewEdit, 
  onReviewDelete,
  refreshTrigger = 0 
}) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchReviews();
  }, [productId, userId, showUserReviews, refreshTrigger]);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let data;
      if (showUserReviews && userId) {
        data = await reviewService.getUserReviews(userId);
      } else if (productId) {
        data = await reviewService.getProductReviews(productId);
      } else {
        throw new Error('Either productId or userId must be provided');
      }
      
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err.message || 'Failed to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewDelete = (reviewId) => {
    setReviews(reviews.filter(review => review.id !== reviewId));
    if (onReviewDelete) {
      onReviewDelete(reviewId);
    }
  };

  const handleReviewEdit = (review) => {
    if (onReviewEdit) {
      onReviewEdit(review);
    }
  };

  const sortReviews = (reviewsToSort) => {
    const sorted = [...reviewsToSort];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'highest':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return sorted.sort((a, b) => a.rating - b.rating);
      default:
        return sorted;
    }
  };

  const sortedReviews = sortReviews(reviews);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-600">Loading reviews...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">Error: {error}</div>
        <button
          onClick={fetchReviews}
          className="mt-2 text-red-600 hover:text-red-800 font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with sort options */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          {showUserReviews ? 'My Reviews' : 'Reviews'} ({reviews.length})
        </h3>
        
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm text-gray-600">
              Sort by:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Highest rating</option>
              <option value="lowest">Lowest rating</option>
            </select>
          </div>
        )}
      </div>

      {/* Reviews list */}
      {sortedReviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {showUserReviews ? 'You haven\'t written any reviews yet.' : 'No reviews yet. Be the first to review!'}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onEdit={handleReviewEdit}
              onDelete={handleReviewDelete}
              showActions={showUserReviews}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewList;