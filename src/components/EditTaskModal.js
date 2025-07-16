import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const EditTaskModal = ({ isOpen, onClose, task, onUpdate }) => {
  const [taskName, setTaskName] = useState('');

  useEffect(() => {
    if (task && isOpen) {
      setTaskName(task.name || '');
    }
  }, [task, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (taskName.trim()) {
      onUpdate({ name: taskName.trim() });
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="editTaskName" className="block text-sm font-medium text-gray-700 mb-1">
            Task Name *
          </label>
          <input
            type="text"
            id="editTaskName"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Research, Compare, Decide"
            autoFocus
          />
        </div>
        
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Update Task
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditTaskModal; 