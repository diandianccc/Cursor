import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const JobPerformerModal = ({ isOpen, onClose, onSave, onDelete, editingJobPerformer = null }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6'); // Default blue
  const [resources, setResources] = useState([{ name: '', url: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or editing job performer changes
  useEffect(() => {
    if (isOpen) {
      if (editingJobPerformer) {
        setName(editingJobPerformer.name || '');
        setDescription(editingJobPerformer.description || '');
        setColor(editingJobPerformer.hexColor || editingJobPerformer.hex_color || editingJobPerformer.color || '#3B82F6');
        setResources(editingJobPerformer.resources && editingJobPerformer.resources.length > 0 
          ? editingJobPerformer.resources 
          : [{ name: '', url: '' }]);
      } else {
        resetForm();
      }
    }
  }, [isOpen, editingJobPerformer]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setColor('#3B82F6');
    setResources([{ name: '', url: '' }]);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addResource = () => {
    setResources([...resources, { name: '', url: '' }]);
  };

  const removeResource = (index) => {
    if (resources.length > 1) {
      setResources(resources.filter((_, i) => i !== index));
    }
  };

  const updateResource = (index, field, value) => {
    const updated = [...resources];
    updated[index][field] = value;
    setResources(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      // Filter out empty resources
      const filteredResources = resources.filter(r => r.name.trim() || r.url.trim());
      
      const jobPerformerData = {
        name: name.trim(),
        description: description.trim(),
        color: color,  // Database uses 'color' column, not 'hex_color'
        resources: filteredResources
      };

      await onSave(jobPerformerData);
      handleClose();
    } catch (error) {
      console.error('Error saving job performer:', error);
      // Let the error bubble up to JobPerformerManager for better error handling
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingJobPerformer) return;
    
    if (editingJobPerformer.isDefault) {
      alert('Default Job Performers cannot be deleted. You can edit them to create custom versions.');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete "${editingJobPerformer.name}"? This action cannot be undone.`)) {
      try {
        await onDelete(editingJobPerformer.id);
        handleClose();
      } catch (error) {
        console.error('Error deleting job performer:', error);
        alert('Failed to delete job performer. Please try again.');
      }
    }
  };

  // Convert hex color to Tailwind-like bg class for preview
  const getColorStyle = (hexColor) => ({
    backgroundColor: hexColor
  });

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={editingJobPerformer ? 'Edit Job Performer' : 'Add Job Performer'}>
      {editingJobPerformer && editingJobPerformer.isDefault && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> You're editing a default Job Performer. Saving will create a custom version that you can modify.
          </p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Performer Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., Customer Service Rep, Product Manager, End User"
            required
          />
        </div>

        {/* Description Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Brief description of this job performer's role and responsibilities"
            rows="3"
          />
        </div>

        {/* Color Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <div 
              className="w-20 h-10 rounded-md border-2 border-gray-300 flex items-center justify-center text-white text-xs font-medium"
              style={getColorStyle(color)}
            >
              Preview
            </div>
            <span className="text-sm text-gray-500">{color}</span>
          </div>
        </div>

        {/* Resources Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Resources & Links
            </label>
            <button
              type="button"
              onClick={addResource}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              + Add Resource
            </button>
          </div>
          
          <div className="space-y-3">
            {resources.map((resource, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    value={resource.name}
                    onChange={(e) => updateResource(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Resource name"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="url"
                    value={resource.url}
                    onChange={(e) => updateResource(index, 'url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://example.com"
                  />
                </div>
                {resources.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeResource(index)}
                    className="p-2 text-red-600 hover:text-red-800"
                    title="Remove resource"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <div>
            {editingJobPerformer && !editingJobPerformer.isDefault && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 hover:text-red-800 font-medium"
              >
                Delete Job Performer
              </button>
            )}
            {editingJobPerformer && editingJobPerformer.isDefault && (
              <span className="text-sm text-gray-500 italic">
                Default Job Performers cannot be deleted
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? 'Saving...' : (
                editingJobPerformer && editingJobPerformer.isDefault 
                  ? 'Create Custom Version'
                  : editingJobPerformer 
                    ? 'Update Job Performer' 
                    : 'Add Job Performer'
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default JobPerformerModal;