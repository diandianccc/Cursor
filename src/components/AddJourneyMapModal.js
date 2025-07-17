import React, { useState } from 'react';
import Modal from './Modal';

const AddJourneyMapModal = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (name.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onAdd(name.trim());
        resetForm();
        onClose();
      } catch (error) {
        console.error('Error creating journey map:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const resetForm = () => {
    setName('');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Predefined journey map suggestions
  const suggestions = [
    'E-commerce Purchase Journey',
    'SaaS Onboarding Journey', 
    'Mobile App User Journey',
    'Customer Support Journey',
    'Product Discovery Journey',
    'Subscription Renewal Journey',
    'Return & Refund Journey',
    'B2B Sales Journey'
  ];

  const handleSuggestionClick = (suggestion) => {
    setName(suggestion);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Journey Map">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="journeyName" className="block text-sm font-medium text-gray-700 mb-2">
            Journey Map Name
          </label>
          <input
            type="text"
            id="journeyName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., E-commerce Purchase Journey"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
            maxLength={100}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Give your journey map a descriptive name to identify the user flow or product.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Quick Suggestions
          </label>
          <div className="grid grid-cols-2 gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-left px-3 py-2 text-sm bg-gray-50 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 rounded-lg transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim() || isSubmitting}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                Creating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Journey Map
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddJourneyMapModal; 