import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { PERSONAS } from '../constants/personas';

const EditStepModal = ({ isOpen, onClose, step, onUpdate }) => {
  const [description, setDescription] = useState('');
  const [personaId, setPersonaId] = useState(PERSONAS && PERSONAS.length > 0 ? PERSONAS[0].id : 'developer');
  const [painPoints, setPainPoints] = useState('');
  const [opportunities, setOpportunities] = useState('');
  const [insights, setInsights] = useState('');

  useEffect(() => {
    if (step && isOpen) {
      setDescription(step.description || '');
      setPersonaId(step.personaId || (PERSONAS && PERSONAS.length > 0 ? PERSONAS[0].id : 'developer'));
      setPainPoints(step.painPoints ? step.painPoints.join('. ') : '');
      setOpportunities(step.opportunities ? step.opportunities.join('. ') : '');
      setInsights(step.insights || '');
    }
  }, [step, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (description.trim()) {
      const stepData = {
        description: description.trim(),
        personaId,
        painPoints: painPoints.split('.').map(p => p.trim()).filter(p => p),
        opportunities: opportunities.split('.').map(o => o.trim()).filter(o => o),
        insights: insights.trim()
      };
      onUpdate(stepData);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Step">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700 mb-1">
            Step Description *
          </label>
          <textarea
            id="editDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            placeholder="Describe what happens in this step..."
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="editPersona" className="block text-sm font-medium text-gray-700 mb-1">
            Persona
          </label>
          <select
            id="editPersona"
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
          <label htmlFor="editPainPoints" className="block text-sm font-medium text-gray-700 mb-1">
            Pain Points
          </label>
          <textarea
            id="editPainPoints"
            value={painPoints}
            onChange={(e) => setPainPoints(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            rows="2"
            placeholder="Enter pain points separated by periods..."
          />
                      <p className="text-xs text-gray-500 mt-1">Separate multiple pain points with periods</p>
        </div>

        <div>
          <label htmlFor="editOpportunities" className="block text-sm font-medium text-gray-700 mb-1">
            Opportunities
          </label>
          <textarea
            id="editOpportunities"
            value={opportunities}
            onChange={(e) => setOpportunities(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            rows="2"
            placeholder="Enter opportunities separated by periods..."
          />
          <p className="text-xs text-gray-500 mt-1">Separate multiple opportunities with periods</p>
        </div>

        <div>
          <label htmlFor="editInsights" className="block text-sm font-medium text-gray-700 mb-1">
            Customer Insights
          </label>
          <textarea
            id="editInsights"
            value={insights}
            onChange={(e) => setInsights(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            placeholder="Enter customer insights, research findings, or additional context..."
          />
          <p className="text-xs text-gray-500 mt-1">Add any customer research, behavioral insights, or contextual information</p>
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
            Update Step
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditStepModal; 