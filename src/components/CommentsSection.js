import React, { useState, useEffect } from 'react';
import { getStepComments, addStepComment, subscribeToStepComments } from '../firebase/commentService';

const CommentsSection = ({ stepId, isActive = false }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState({
    authorName: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Load comments when component mounts or stepId changes
  useEffect(() => {
    if (stepId && isActive) {
      loadComments();
    }
  }, [stepId, isActive]);

  // Subscribe to real-time comment updates
  useEffect(() => {
    if (stepId && isActive) {
      const subscription = subscribeToStepComments(stepId, (payload) => {
        // For JSON approach, we'll manually refresh instead of real-time
        loadComments();
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [stepId, isActive]);

  const loadComments = async () => {
    if (!stepId) return;
    
    setLoading(true);
    try {
      const stepComments = await getStepComments(stepId);
      setComments(stepComments);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.authorName.trim() || !newComment.message.trim()) {
      alert('Please enter both your name and a message.');
      return;
    }

    if (!stepId) {
      alert('No step selected. Please try again.');
      return;
    }

    setSubmitting(true);
    try {
      console.log('📝 Submitting comment for step:', stepId);
      await addStepComment(stepId, newComment.authorName, newComment.message);
      setNewComment({ authorName: '', message: '' });
      console.log('✅ Comment submitted successfully');
      // Refresh comments to show the new one
      loadComments();
        } catch (error) {
      console.error('❌ Failed to add comment:', error);
      console.error('❌ Full error object:', error);
      let errorMessage = 'Failed to add comment. ';

      if (error.message?.includes('step_comments') || error.message?.includes('column')) {
        errorMessage += 'Database column may not exist. Please run the SQL setup command.';
      } else if (error.message?.includes('No journey map ID')) {
        errorMessage += 'No journey map selected. Please reload the page.';
      } else if (error.code) {
        errorMessage += `Error: ${error.message} (Code: ${error.code})`;
      } else {
        errorMessage += `Error: ${error.message}`;
      }

      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isActive) return null;

  return (
    <div className="bg-purple-50 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Comments ({comments.length})
      </h3>

      {/* Comments List */}
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
        {loading ? (
          <div className="text-center py-4 text-purple-600">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-4 text-gray-500 italic">
            No comments yet. Be the first to add one!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-md p-3 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-purple-800">{comment.author_name}</span>
                <span className="text-sm text-gray-500">{formatDate(comment.created_at)}</span>
              </div>
              <p className="text-gray-700 text-sm">{comment.message}</p>
            </div>
          ))
        )}
      </div>

      {/* Add New Comment Form */}
      <form onSubmit={handleSubmitComment} className="space-y-3">
        <div>
          <input
            type="text"
            value={newComment.authorName}
            onChange={(e) => setNewComment(prev => ({ ...prev, authorName: e.target.value }))}
            placeholder="Your name"
            className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            disabled={submitting}
          />
        </div>
        <div>
          <textarea
            value={newComment.message}
            onChange={(e) => setNewComment(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Write your comment..."
            rows={3}
            className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
            disabled={submitting}
          />
        </div>
        <button
          type="submit"
          disabled={submitting || !newComment.authorName.trim() || !newComment.message.trim()}
          className="w-full py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {submitting ? 'Adding Comment...' : 'Add Comment'}
        </button>
      </form>
    </div>
  );
};

export default CommentsSection;