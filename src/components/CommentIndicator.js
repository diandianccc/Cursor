import React, { useState, useEffect } from 'react';
import { getStepCommentCounts } from '../firebase/commentService';

const CommentIndicator = ({ stepId, onClick }) => {
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load comment count when component mounts or stepId changes
  useEffect(() => {
    if (stepId) {
      loadCommentCount();
    }
  }, [stepId]);

  const loadCommentCount = async () => {
    if (!stepId) return;
    
    setLoading(true);
    try {
      const commentCounts = await getStepCommentCounts();
      const count = commentCounts[stepId] || 0;
      setCommentCount(count);
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

  const handleClick = (e) => {
    e.stopPropagation(); // Prevent step card click
    if (onClick) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors group"
      title={`${commentCount} comment${commentCount !== 1 ? 's' : ''} - Click to view`}
    >
      {/* Comment Icon */}
      <svg 
        className="w-4 h-4" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.721-.424l-3.178 2.65A1 1 0 015 21V12a8 8 0 018-8c4.418 0 8 3.582 8 8z" 
        />
      </svg>
      
      {/* Comment Count */}
      <span className="text-xs font-medium min-w-[1rem] text-center">
        {commentCount}
      </span>
    </button>
  );
};

export default CommentIndicator;