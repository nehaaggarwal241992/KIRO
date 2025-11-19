import React, { useState, useEffect } from 'react';
import ModerationCard from './ModerationCard.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import moderationService from '../../services/moderationService.js';

const FlaggedReviews = () => {
  const { isModerator } = useAuth();
  const [flaggedReviews, setFlaggedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isModerator()) {
      fetchFlaggedReviews();
    }
  }, [isModerator]);

  const fetchFlaggedReviews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await moderationService.getFlaggedReviews();
      setFlaggedReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching flagged reviews:', err);
      setError(err.message || 'Failed to load flagged reviews');
      setFlaggedReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleModerationAction = (reviewId, action) => {
    // Remove the review from the flagged list if it was approved/rejected
    if (action === 'approve' || action === 'reject') {
      setFlaggedReviews(prev => prev.filter(review => review.id !== reviewId));
    }
    
    // Show success message
    const actionMessages = {
      approve: 'Flagged review approved successfully',
      reject: 'Flagged review rejected successfully',
      flag: 'Review flagged successfully',
    };
    
    console.log(actionMessages[action] || 'Action completed');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isModerator()) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-800">
            Access denied. You must be a moderator to view this page.
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-600">Loading flagged reviews...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-red-800 mb-2">Error: {error}</div>
          <button
            onClick={fetchFlaggedReviews}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flagged Reviews</h1>
          <p className="text-gray-600 mt-1">
            Reviews that have been flagged for review ({flaggedReviews.length} flagged)
          </p>
        </div>
        
        <button
          onClick={fetchFlaggedReviews}
          className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700"
        >
          Refresh
        </button>
      </div>

      {/* Alert */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-orange-600 text-xl">⚠️</div>
          <div>
            <div className="text-orange-800 font-medium">Flagged Content</div>
            <div className="text-orange-700 text-sm mt-1">
              These reviews have been flagged and require attention. Review each item carefully and take appropriate action.
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {flaggedReviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">✅ No flagged reviews</div>
          <div className="text-gray-600">All reviews are in good standing.</div>
        </div>
      ) : (
        <div className="space-y-6">
          {flaggedReviews.map((review) => (
            <div key={review.id} className="space-y-3">
              <ModerationCard
                review={review}
                onAction={handleModerationAction}
                showProduct={true}
              />
              
              {/* Show moderation history if available */}
              {review.moderationActions && review.moderationActions.length > 0 && (
                <div className="ml-6 bg-gray-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Moderation History</h4>
                  <div className="space-y-2">
                    {review.moderationActions.map((action, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        <span className="font-medium">{action.action}</span> by {action.moderator?.username || 'Unknown'} 
                        <span className="text-gray-500"> on {formatDate(action.createdAt)}</span>
                        {action.notes && (
                          <div className="mt-1 text-gray-700 italic">"{action.notes}"</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlaggedReviews;