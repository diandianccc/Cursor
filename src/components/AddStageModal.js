import React, { useState } from 'react';
import Modal from './Modal';

const AddStageModal = ({ isOpen, onClose, onAdd }) => {
  const [stageName, setStageName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (stageName.trim()) {
      onAdd(stageName.trim());
      setStageName('');
      onClose();
    }
  };

  const handleClose = () => {
    setStageName('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Stage">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="stageName" className="block text-sm font-medium text-gray-700 mb-1">
            Stage Name
          </label>
          <input
            type="text"
            id="stageName"
            value={stageName}
            onChange={(e) => setStageName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Awareness, Consideration, Purchase"
            autoFocus
          />
        </div>
        
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Add Stage
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddStageModal; 