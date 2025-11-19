import React, { useState } from 'react';
import RatingDisplay from '../reviews/RatingDisplay.jsx';
import moderationService from '../../services/moderationService.js';

const ModerationCard = ({ review, onAction, showProduct = true }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagNotes, setFlagNotes] = useState('');

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await moderationService.approveReview(review.id);
      if (onAction) {
        onAction(review.id, 'approve');
      }
    } catch (error) {
      console.error('Error approving review:', error);
      alert('Failed to approve review. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Are you sure you want to reject this review?')) {
      return;
    }

    setIsProcessing(true);
    try {
      await moderationService.rejectReview(review.id);
      if (onAction) {
        onAction(review.id, 'reject');
      }
    } catch (error) {
      console.error('Error rejecting review:', error);
      alert('Failed to reject review. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFlag = async () => {
    setIsProcessing(true);
    try {
      await moderationService.flagReview(review.id, flagNotes);
      if (onAction) {
        onAction(review.id, 'flag');
      }
      setShowFlagModal(false);
      setFlagNotes('');
    } catch (error) {
      console.error('Error flagging review:', error);
      alert('Failed to flag review. Please try again.');
    } finally {
      setIsProcessing(false);
    }
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

  const getStatusBadge = () => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      flagged: 'bg-orange-100 text-orange-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[review.status] || 'bg-gray-100 text-gray-800'}`}>
        {review.status}
      </span>
    );
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <RatingDisplay rating={review.rating} size="small" showNumber={false} />
                <span className="text-sm text-gray-600">
                  by {review.user?.username || 'Anonymous'}
                </span>
                <span className="text-sm text-gray-500">
                  {formatDate(review.createdAt)}
                </span>
              </div>
              
              {showProduct && review.product && (
                <div className="text-sm text-gray-600">
                  Product: <span className="font-medium">{review.product.name}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusBadge()}
            </div>
          </div>

          {/* Review Content */}
          <div className="bg-gray-50 rounded-md p-4">
            <p className="text-gray-800 leading-relaxed">{review.reviewText}</p>
          </div>

          {/* Moderation Actions */}
          <div className="flex gap-2 pt-2 border-t border-gray-200">
            {review.status === 'pending' && (
              <>
                <button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Approve'}
                </button>
                
                <button
                  onClick={handleReject}
                  disabled={isProcessing}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Reject'}
                </button>
              </>
            )}
            
            <button
              onClick={() => setShowFlagModal(true)}
              disabled={isProcessing}
              className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : 'Flag'}
            </button>
          </div>

          {/* Additional Info */}
          {review.updatedAt && review.updatedAt !== review.createdAt && (
            <div className="text-xs text-gray-500">
              Updated: {formatDate(review.updatedAt)}
            </div>
          )}
        </div>
      </div>

      {/* Flag Modal */}
      {showFlagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Flag Review
            </h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="flagNotes" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for flagging (optional)
                </label>
                <textarea
                  id="flagNotes"
                  value={flagNotes}
                  onChange={(e) => setFlagNotes(e.target.value)}
                  placeholder="Explain why this review should be flagged..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleFlag}
                  disabled={isProcessing}
                  className="bg-orange-600 text-white px-4 py-2 rounded-md font-medium hover:bg-orange-700 disabled:opacity-50"
                >
                  {isProcessing ? 'Flagging...' : 'Flag Review'}
                </button>
                
                <button
                  onClick={() => {
                    setShowFlagModal(false);
                    setFlagNotes('');
                  }}
                  disabled={isProcessing}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModerationCard;