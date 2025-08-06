import React, { useState } from 'react';
import Modal from './Modal';

const AddTaskModal = ({ isOpen, onClose, onAdd, jobPerformers = [] }) => {
  const [taskName, setTaskName] = useState('');
  const [selectedJobPerformers, setSelectedJobPerformers] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (taskName.trim()) {
      onAdd({ 
        name: taskName.trim(),
        jobPerformerIds: selectedJobPerformers
      });
      setTaskName('');
      setSelectedJobPerformers([]);
      onClose();
    }
  };

  const handleClose = () => {
    setTaskName('');
    setSelectedJobPerformers([]);
    onClose();
  };

  const toggleJobPerformer = (jobPerformerId) => {
    setSelectedJobPerformers(prev => 
      prev.includes(jobPerformerId)
        ? prev.filter(id => id !== jobPerformerId)
        : [...prev, jobPerformerId]
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="taskName" className="block text-sm font-medium text-gray-700 mb-1">
            Task Name *
          </label>
          <input
            type="text"
            id="taskName"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Research, Compare, Decide"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assign Job Performers
          </label>
          <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
            {jobPerformers.length > 0 ? (
              jobPerformers.map((jobPerformer) => (
                <label
                  key={jobPerformer.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedJobPerformers.includes(jobPerformer.id)}
                    onChange={() => toggleJobPerformer(jobPerformer.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: jobPerformer.hexColor || jobPerformer.color || '#3B82F6' }}
                  />
                  <span className="text-sm text-gray-700 flex-1">{jobPerformer.name}</span>
                </label>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">No job performers available</p>
            )}
          </div>
          {selectedJobPerformers.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {selectedJobPerformers.length} job performer{selectedJobPerformers.length > 1 ? 's' : ''} selected
            </p>
          )}
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
            Add Task
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddTaskModal; 