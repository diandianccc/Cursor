import React, { useState, useEffect } from 'react';
import { getStepCommentCounts } from '../firebase/commentService';

const CommentIndicator = ({ stepId, onClick, className = "" }) => {
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (stepId) {
      loadCommentCount();
    }
  }, [stepId]);

  const loadCommentCount = async () => {
    try {
      const counts = await getStepCommentCounts([stepId]);
      setCommentCount(counts[stepId] || 0);
    } catch (error) {
      console.error('Failed to load comment count:', error);
      setCommentCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Don't render if no comments or still loading
  if (loading || commentCount === 0) {
    return null;
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation(); // Prevent triggering parent click events
        onClick();
      }}
      className={`relative inline-flex items-center justify-center ${className}`}
      title={`${commentCount} comment${commentCount !== 1 ? 's' : ''}`}
    >
      {/* Comment Icon */}
      <div className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1.5 shadow-lg transition-colors">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      
      {/* Comment Count Badge */}
      {commentCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
          {commentCount > 99 ? '99+' : commentCount}
        </span>
      )}
    </button>
  );
};

export default CommentIndicator;