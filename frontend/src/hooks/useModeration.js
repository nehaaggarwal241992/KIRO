import { useState, useEffect, useCallback } from 'react';
import moderationService from '../services/moderationService.js';

// Hook for fetching pending reviews queue
export const usePendingQueue = () => {
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPendingQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await moderationService.getPendingQueue();
      setPendingReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching pending queue:', err);
      setError(err);
      setPendingReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingQueue();
  }, [fetchPendingQueue]);

  const refetch = useCallback(() => {
    fetchPendingQueue();
  }, [fetchPendingQueue]);

  return {
    pendingReviews,
    loading,
    error,
    refetch,
  };
};

// Hook for fetching flagged reviews
export const useFlaggedReviews = () => {
  const [flaggedReviews, setFlaggedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFlaggedReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await moderationService.getFlaggedReviews();
      setFlaggedReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching flagged reviews:', err);
      setError(err);
      setFlaggedReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlaggedReviews();
  }, [fetchFlaggedReviews]);

  const refetch = useCallback(() => {
    fetchFlaggedReviews();
  }, [fetchFlaggedReviews]);

  return {
    flaggedReviews,
    loading,
    error,
    refetch,
  };
};

// Hook for fetching moderation statistics
export const useModerationStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await moderationService.getStatistics();
      setStats(data);
    } catch (err) {
      console.error('Error fetching moderation stats:', err);
      setError(err);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refetch = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch,
  };
};

// Hook for fetching moderation history
export const useModerationHistory = (filters = {}) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await moderationService.getModerationHistory(filters);
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching moderation history:', err);
      setError(err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const refetch = useCallback(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    loading,
    error,
    refetch,
  };
};

// Hook for managing moderation actions
export const useModerationActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const approveReview = useCallback(async (reviewId, onSuccess) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await moderationService.approveReview(reviewId);
      if (onSuccess) {
        onSuccess(reviewId, 'approve', result);
      }
      return result;
    } catch (err) {
      console.error('Error approving review:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectReview = useCallback(async (reviewId, onSuccess) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await moderationService.rejectReview(reviewId);
      if (onSuccess) {
        onSuccess(reviewId, 'reject', result);
      }
      return result;
    } catch (err) {
      console.error('Error rejecting review:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const flagReview = useCallback(async (reviewId, notes, onSuccess) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await moderationService.flagReview(reviewId, notes);
      if (onSuccess) {
        onSuccess(reviewId, 'flag', result);
      }
      return result;
    } catch (err) {
      console.error('Error flagging review:', err);
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
    approveReview,
    rejectReview,
    flagReview,
    clearError,
  };
};

// Main hook that combines multiple moderation-related hooks
export const useModeration = (options = {}) => {
  const { includeQueue = false, includeFlagged = false, includeStats = false, historyFilters = {} } = options;
  
  const pendingQueue = usePendingQueue();
  const flaggedReviews = useFlaggedReviews();
  const stats = useModerationStats();
  const history = useModerationHistory(historyFilters);
  const actions = useModerationActions();

  // Conditionally fetch data based on options
  const queueData = includeQueue ? pendingQueue : { pendingReviews: [], loading: false, error: null, refetch: () => {} };
  const flaggedData = includeFlagged ? flaggedReviews : { flaggedReviews: [], loading: false, error: null, refetch: () => {} };
  const statsData = includeStats ? stats : { stats: null, loading: false, error: null, refetch: () => {} };

  // Refetch all data
  const refetchAll = useCallback(() => {
    if (includeQueue) queueData.refetch();
    if (includeFlagged) flaggedData.refetch();
    if (includeStats) statsData.refetch();
    history.refetch();
  }, [includeQueue, includeFlagged, includeStats, queueData, flaggedData, statsData, history]);

  return {
    // Pending queue
    pendingReviews: queueData.pendingReviews,
    queueLoading: queueData.loading,
    queueError: queueData.error,
    refetchQueue: queueData.refetch,
    
    // Flagged reviews
    flaggedReviews: flaggedData.flaggedReviews,
    flaggedLoading: flaggedData.loading,
    flaggedError: flaggedData.error,
    refetchFlagged: flaggedData.refetch,
    
    // Statistics
    stats: statsData.stats,
    statsLoading: statsData.loading,
    statsError: statsData.error,
    refetchStats: statsData.refetch,
    
    // History
    history: history.history,
    historyLoading: history.loading,
    historyError: history.error,
    refetchHistory: history.refetch,
    
    // Actions
    actionsLoading: actions.loading,
    actionsError: actions.error,
    approveReview: actions.approveReview,
    rejectReview: actions.rejectReview,
    flagReview: actions.flagReview,
    clearActionsError: actions.clearError,
    
    // Utility
    refetchAll,
  };
};

export default useModeration;