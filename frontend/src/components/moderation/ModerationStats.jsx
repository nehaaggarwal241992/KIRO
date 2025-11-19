import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import moderationService from '../../services/moderationService.js';

const ModerationStats = () => {
  const { isModerator } = useAuth();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (isModerator()) {
      fetchData();
    }
  }, [isModerator]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch statistics and history in parallel
      const [statsData, historyData] = await Promise.all([
        moderationService.getStatistics(),
        moderationService.getModerationHistory(dateRange),
      ]);
      
      setStats(statsData);
      setHistory(Array.isArray(historyData) ? historyData : []);
    } catch (err) {
      console.error('Error fetching moderation data:', err);
      setError(err.message || 'Failed to load moderation data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const applyDateFilter = () => {
    fetchData();
  };

  const clearDateFilter = () => {
    setDateRange({ startDate: '', endDate: '' });
    setTimeout(fetchData, 0);
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

  const formatDuration = (hours) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} minutes`;
    } else if (hours < 24) {
      return `${Math.round(hours * 10) / 10} hours`;
    } else {
      return `${Math.round(hours / 24 * 10) / 10} days`;
    }
  };

  if (!isModerator()) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-600">Loading moderation statistics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-red-800 mb-2">Error: {error}</div>
          <button
            onClick={fetchData}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Moderation Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Overview of moderation activity and statistics
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-2xl font-bold text-blue-600">{stats.totalActions || 0}</div>
            <div className="text-gray-600">Total Actions</div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-2xl font-bold text-green-600">{stats.actionCounts?.approve || 0}</div>
            <div className="text-gray-600">Approved</div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-2xl font-bold text-red-600">{stats.actionCounts?.reject || 0}</div>
            <div className="text-gray-600">Rejected</div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-2xl font-bold text-orange-600">{stats.actionCounts?.flag || 0}</div>
            <div className="text-gray-600">Flagged</div>
          </div>
        </div>
      )}

      {/* Additional Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-lg font-semibold text-gray-900 mb-2">Approval Rate</div>
            <div className="text-3xl font-bold text-green-600">
              {stats.approvalRate ? `${Math.round(stats.approvalRate)}%` : 'N/A'}
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-lg font-semibold text-gray-900 mb-2">Avg. Processing Time</div>
            <div className="text-3xl font-bold text-blue-600">
              {stats.averageProcessingTimeMinutes ? `${Math.round(stats.averageProcessingTimeMinutes)} min` : 'N/A'}
            </div>
          </div>
        </div>
      )}

      {/* Date Range Filter */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Moderation History</h2>
        
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={dateRange.startDate}
              onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          
          <button
            onClick={applyDateFilter}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Apply Filter
          </button>
          
          <button
            onClick={clearDateFilter}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Moderation History */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Moderation Actions</h2>
          <span className="text-sm text-gray-600">{history.length} actions</span>
        </div>
        
        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No moderation actions found for the selected period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-900">Date</th>
                  <th className="text-left py-2 font-medium text-gray-900">Action</th>
                  <th className="text-left py-2 font-medium text-gray-900">Moderator</th>
                  <th className="text-left py-2 font-medium text-gray-900">Review Content</th>
                  <th className="text-left py-2 font-medium text-gray-900">Rating</th>
                  <th className="text-left py-2 font-medium text-gray-900">Notes</th>
                </tr>
              </thead>
              <tbody>
                {history.map((action, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 text-gray-600 text-sm">
                      {formatDate(action.createdAt)}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        action.action === 'approve' ? 'bg-green-100 text-green-800' :
                        action.action === 'reject' ? 'bg-red-100 text-red-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {action.action}
                      </span>
                    </td>
                    <td className="py-3 text-gray-900 font-medium">
                      {action.moderator?.username || 'Unknown'}
                    </td>
                    <td className="py-3 text-gray-600 max-w-md">
                      <div className="truncate text-sm">
                        {action.review?.reviewText || `Review #${action.reviewId}`}
                      </div>
                    </td>
                    <td className="py-3">
                      {action.review?.rating && (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm font-medium">{action.review.rating}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 text-gray-600 text-sm max-w-xs truncate">
                      {action.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModerationStats;