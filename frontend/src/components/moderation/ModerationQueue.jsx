import React, { useState, useEffect } from 'react';
import ModerationCard from './ModerationCard.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import moderationService from '../../services/moderationService.js';

const ModerationQueue = () => {
  const { isModerator } = useAuth();
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isModerator()) {
      fetchPendingReviews();
    }
  }, [isModerator]);

  const fetchPendingReviews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await moderationService.getPendingQueue();
      setPendingReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching pending reviews:', err);
      setError(err.message || 'Failed to load pending reviews');
      setPendingReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleModerationAction = (reviewId, action) => {
    // Remove the review from the pending list
    setPendingReviews(prev => prev.filter(review => review.id !== reviewId));
    
    // Show success message
    const actionMessages = {
      approve: 'Review approved successfully',
      reject: 'Review rejected successfully',
      flag: 'Review flagged successfully',
    };
    
    // You could implement a toast notification here
    console.log(actionMessages[action] || 'Action completed');
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
          <div className="text-gray-600">Loading pending reviews...</div>
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
            onClick={fetchPendingReviews}
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
          <h1 className="text-2xl font-bold text-gray-900">Moderation Queue</h1>
          <p className="text-gray-600 mt-1">
            Reviews waiting for approval ({pendingReviews.length} pending)
          </p>
        </div>
        
        <button
          onClick={fetchPendingReviews}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Queue Stats */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-4">
          <div className="text-blue-800">
            <span className="font-semibold">{pendingReviews.length}</span> reviews pending moderation
          </div>
          {pendingReviews.length > 0 && (
            <div className="text-blue-600 text-sm">
              Oldest pending: {new Date(Math.min(...pendingReviews.map(r => new Date(r.createdAt)))).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {/* Reviews List */}
      {pendingReviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">🎉 All caught up!</div>
          <div className="text-gray-600">No reviews pending moderation.</div>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingReviews.map((review) => (
            <ModerationCard
              key={review.id}
              review={review}
              onAction={handleModerationAction}
              showProduct={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ModerationQueue;