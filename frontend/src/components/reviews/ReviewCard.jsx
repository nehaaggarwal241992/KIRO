import React, { useState } from 'react';
import RatingDisplay from './RatingDisplay.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import reviewService from '../../services/reviewService.js';

const ReviewCard = ({ review, onEdit, onDelete, showActions = true }) => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = user && user.id === review.userId;
  const canEdit = isOwner && showActions;
  const canDelete = isOwner && showActions;

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await reviewService.deleteReview(review.id);
      if (onDelete) {
        onDelete(review.id);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(review);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <RatingDisplay rating={review.rating} size="small" showNumber={false} />
          <span className="text-sm text-gray-600">
            by {review.user?.username || 'Anonymous'}
          </span>
          <span className="text-sm text-gray-500">
            {formatDate(review.createdAt)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {review.status && review.status !== 'approved' && getStatusBadge()}
          {canEdit && (
            <button
              onClick={handleEdit}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Edit
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>
      </div>
      
      <div className="text-gray-800">
        <p className="leading-relaxed">{review.reviewText}</p>
      </div>
      
      {review.updatedAt && review.updatedAt !== review.createdAt && (
        <div className="mt-2 text-xs text-gray-500">
          Updated: {formatDate(review.updatedAt)}
        </div>
      )}
    </div>
  );
};

export default ReviewCard;