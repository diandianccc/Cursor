import React, { useState } from 'react';
import Modal from './Modal';
import { MAP_TYPE_OPTIONS, MAP_TYPES } from '../constants/mapTypes';

const AddJourneyMapModal = ({ isOpen, onClose, onAdd }) => {
  const [selectedMapType, setSelectedMapType] = useState(MAP_TYPES.USER_JOURNEY);
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (name.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onAdd(name.trim(), selectedMapType);
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
    setSelectedMapType(MAP_TYPES.USER_JOURNEY);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleMapTypeChange = (mapType) => {
    setSelectedMapType(mapType);
    setName(''); // Clear name when changing type
  };

  // Get suggestions based on selected map type
  const getSuggestions = () => {
    if (selectedMapType === MAP_TYPES.JOBS_TO_BE_DONE) {
      return [
        'Customer Acquisition Jobs',
        'Product Development Jobs',
        'Customer Retention Jobs', 
        'Support & Service Jobs',
        'Onboarding Jobs',
        'Decision Making Jobs',
        'Problem Resolution Jobs',
        'Product Discovery Jobs'
      ];
    } else {
      return [
        'E-commerce Purchase Journey',
        'SaaS Onboarding Journey', 
        'Mobile App User Journey',
        'Customer Support Journey',
        'Product Discovery Journey',
        'Subscription Renewal Journey',
        'Return & Refund Journey',
        'B2B Sales Journey'
      ];
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setName(suggestion);
  };

  const currentMapTypeOption = MAP_TYPE_OPTIONS.find(option => option.type === selectedMapType);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Map">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Map Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Choose Map Type
          </label>
          <div className="grid grid-cols-1 gap-3">
            {MAP_TYPE_OPTIONS.map((option) => (
              <div
                key={option.type}
                onClick={() => handleMapTypeChange(option.type)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedMapType === option.type
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{option.icon}</div>
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      selectedMapType === option.type ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {option.title}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      selectedMapType === option.type ? 'text-blue-700' : 'text-gray-600'
                    }`}>
                      {option.description}
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedMapType === option.type
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedMapType === option.type && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Name */}
        <div>
          <label htmlFor="journeyName" className="block text-sm font-medium text-gray-700 mb-2">
            {currentMapTypeOption?.title} Name
          </label>
          <input
            type="text"
            id="journeyName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`e.g., ${getSuggestions()[0]}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
            maxLength={100}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Give your {currentMapTypeOption?.title.toLowerCase()} a descriptive name.
          </p>
        </div>

        {/* Quick Suggestions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Quick Suggestions
          </label>
          <div className="grid grid-cols-2 gap-2">
            {getSuggestions().map((suggestion) => (
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

        {/* Action Buttons */}
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
                Create {currentMapTypeOption?.title}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddJourneyMapModal; 