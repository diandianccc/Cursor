import React, { useState, useEffect } from 'react';
import { getStepComments, addStepComment } from '../firebase/commentService';

const CommentsSection = ({ stepId, stepDescription = "this step" }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState({
    authorName: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Load comments when component mounts or stepId changes
  useEffect(() => {
    if (stepId) {
      loadComments();
    }
  }, [stepId]);

  const loadComments = async () => {
    if (!stepId) return;
    
    setLoading(true);
    try {
      const stepComments = await getStepComments(stepId);
      setComments(stepComments);
    } catch (error) {
      console.error('Failed to load comments:', error);
      setComments([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.authorName.trim() || !newComment.message.trim()) {
      alert('Please enter both your name and a message');
      return;
    }

    setSubmitting(true);
    try {
      await addStepComment(stepId, newComment.authorName.trim(), newComment.message.trim());
      
      // Clear form
      setNewComment({ authorName: '', message: '' });
      
      // Refresh comments to show the new one
      await loadComments();
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!stepId) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Comments will be available once you add and save this step.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comments List */}
      <div className="space-y-4 max-h-64 overflow-y-auto">
        {loading ? (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-500">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.721-.424l-3.178 2.65A1 1 0 015 21V12a8 8 0 018-8c4.418 0 8 3.582 8 8z" />
            </svg>
            <p className="mt-2">No comments yet on {stepDescription}.</p>
            <p className="text-sm">Be the first to add one!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {comment.author_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{comment.author_name}</p>
                      <p className="text-xs text-gray-500">{formatDate(comment.created_at)}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{comment.message}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="space-y-4 border-t pt-4">
        <h4 className="font-medium text-gray-900">Add a comment</h4>
        
        <div>
          <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-1">
            Your name
          </label>
          <input
            type="text"
            id="authorName"
            value={newComment.authorName}
            onChange={(e) => setNewComment({ ...newComment, authorName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your name"
            disabled={submitting}
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            id="message"
            rows={3}
            value={newComment.message}
            onChange={(e) => setNewComment({ ...newComment, message: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Add your comment..."
            disabled={submitting}
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !newComment.authorName.trim() || !newComment.message.trim()}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Adding comment...
            </div>
          ) : (
            'Add Comment'
          )}
        </button>
      </form>
    </div>
  );
};

export default CommentsSection;