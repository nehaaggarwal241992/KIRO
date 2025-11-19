import React from 'react';

const ErrorMessage = ({ 
  error, 
  onRetry, 
  title = 'Error', 
  showRetry = true,
  className = '' 
}) => {
  if (!error) return null;

  const getErrorMessage = () => {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error.message) {
      return error.message;
    }
    
    return 'An unexpected error occurred';
  };

  const getErrorDetails = () => {
    if (typeof error === 'object' && error.code) {
      return `Error Code: ${error.code}`;
    }
    return null;
  };

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="text-red-600 text-xl flex-shrink-0">⚠️</div>
        <div className="flex-1">
          <h3 className="text-red-800 font-medium">{title}</h3>
          <p className="text-red-700 mt-1">{getErrorMessage()}</p>
          
          {getErrorDetails() && (
            <p className="text-red-600 text-sm mt-1">{getErrorDetails()}</p>
          )}
          
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 text-red-600 hover:text-red-800 font-medium text-sm underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;