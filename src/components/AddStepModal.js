import React, { useState } from 'react';
import Modal from './Modal';
import { PERSONAS } from '../constants/personas';

const AddStepModal = ({ isOpen, onClose, onAdd }) => {
  const [description, setDescription] = useState('');
  const [personaId, setPersonaId] = useState(PERSONAS[0].id);
  const [painPoints, setPainPoints] = useState('');
  const [opportunities, setOpportunities] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (description.trim()) {
      const stepData = {
        description: description.trim(),
        personaId,
              painPoints: painPoints.split('.').map(p => p.trim()).filter(p => p),
      opportunities: opportunities.split('.').map(o => o.trim()).filter(o => o)
      };
      onAdd(stepData);
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setDescription('');
    setPersonaId(PERSONAS[0].id);
    setPainPoints('');
    setOpportunities('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Step">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Step Description *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            placeholder="Describe what happens in this step..."
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="persona" className="block text-sm font-medium text-gray-700 mb-1">
            Persona
          </label>
          <select
            id="persona"
            value={personaId}
            onChange={(e) => setPersonaId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            {PERSONAS.map((persona) => (
              <option key={persona.id} value={persona.id}>
                {persona.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="painPoints" className="block text-sm font-medium text-gray-700 mb-1">
            Pain Points
          </label>
          <textarea
            id="painPoints"
            value={painPoints}
            onChange={(e) => setPainPoints(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            rows="2"
            placeholder="Enter pain points separated by periods..."
          />
                      <p className="text-xs text-gray-500 mt-1">Separate multiple pain points with periods</p>
        </div>

        <div>
          <label htmlFor="opportunities" className="block text-sm font-medium text-gray-700 mb-1">
            Opportunities
          </label>
          <textarea
            id="opportunities"
            value={opportunities}
            onChange={(e) => setOpportunities(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            rows="2"
            placeholder="Enter opportunities separated by periods..."
          />
                      <p className="text-xs text-gray-500 mt-1">Separate multiple opportunities with periods</p>
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
            Add Step
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddStepModal; 