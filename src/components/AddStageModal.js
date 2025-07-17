import React, { useState } from 'react';
import Modal from './Modal';
import { getTerminology } from '../constants/mapTypes';

const AddStageModal = ({ isOpen, onClose, onAdd, journeyMapType }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim());
      setName('');
      onClose();
    }
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  const terminology = getTerminology(journeyMapType);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Add ${terminology.stage}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="stageName" className="block text-sm font-medium text-gray-700 mb-1">
            {terminology.stage} Name
          </label>
          <input
            type="text"
            id="stageName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`Enter ${terminology.stage.toLowerCase()} name`}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
            required
          />
        </div>
        
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Add {terminology.stage}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddStageModal; 