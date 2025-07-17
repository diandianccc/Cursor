import React, { useState, useEffect } from 'react';
import { getPersonaById, PERSONAS } from '../constants/personas';

const StepDetailPanel = ({ 
  isOpen, 
  onClose, 
  step, 
  onSave, 
  stageId, 
  taskId,
  stageName,
  taskName,
  onDeleteStep,
  onDeleteTask,
  onDeleteStage 
}) => {
  const [description, setDescription] = useState('');
  const [personaId, setPersonaId] = useState(PERSONAS[0].id);
  const [painPoints, setPainPoints] = useState('');
  const [opportunities, setOpportunities] = useState('');
  const [insights, setInsights] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Reset form when step changes or panel opens
  useEffect(() => {
    if (step && isOpen) {
      setDescription(step.description || '');
      setPersonaId(step.personaId || PERSONAS[0].id);
      setPainPoints(step.painPoints ? step.painPoints.join('. ') : '');
      setOpportunities(step.opportunities ? step.opportunities.join('. ') : '');
      setInsights(step.insights || '');
      setHasChanges(false);
    }
  }, [step, isOpen]);

  // Track changes
  useEffect(() => {
    if (step) {
      const originalPainPoints = step.painPoints ? step.painPoints.join('. ') : '';
      const originalOpportunities = step.opportunities ? step.opportunities.join('. ') : '';
      
      const hasChanged = 
        description !== (step.description || '') ||
        personaId !== (step.personaId || PERSONAS[0].id) ||
        painPoints !== originalPainPoints ||
        opportunities !== originalOpportunities ||
        insights !== (step.insights || '');
      
      setHasChanges(hasChanged);
    }
  }, [description, personaId, painPoints, opportunities, insights, step]);

  const handleSave = () => {
    if (!step) return;

    const stepData = {
      description: description.trim(),
      personaId,
      painPoints: painPoints ? painPoints.split('.').map(p => p.trim()).filter(p => p) : [],
      opportunities: opportunities ? opportunities.split('.').map(o => o.trim()).filter(o => o) : [],
      insights: insights.trim()
    };

    onSave(stageId, taskId, step.id, stepData);
    setHasChanges(false);
    onClose();
  };

  const handleCancel = () => {
    if (hasChanges && !window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
      return;
    }
    onClose();
  };

  const handleDeleteStep = () => {
    if (window.confirm(`Are you sure you want to delete this step: "${step.description}"?`)) {
      onDeleteStep && onDeleteStep(stageId, taskId, step.id);
      onClose();
    }
  };

  const handleDeleteTask = () => {
    if (window.confirm(`Are you sure you want to delete the task "${taskName}" and all its steps?`)) {
      onDeleteTask && onDeleteTask(stageId, taskId);
      onClose();
    }
  };

  const handleDeleteStage = () => {
    if (window.confirm(`Are you sure you want to delete the stage "${stageName}" and all its tasks and steps?`)) {
      onDeleteStage && onDeleteStage(stageId);
      onClose();
    }
  };

  const persona = getPersonaById(personaId);

  if (!isOpen || !step) return null;

  return (
    <div className="fixed inset-0 z-[60] flex">
      {/* Backdrop - only covers left side */}
      <div 
        className="flex-1 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={handleCancel}
      />
      
      {/* Panel Container */}
      <div className={`w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } flex flex-col h-full relative z-[60]`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Step Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              {stageName} → {taskName}
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Step Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows="3"
              placeholder="Describe what happens in this step..."
            />
          </div>

          {/* Persona */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Persona
            </label>
            <select
              value={personaId}
              onChange={(e) => setPersonaId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              {PERSONAS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {persona && (
              <div className="flex items-center gap-2 mt-2">
                <div className={`${persona.color} w-3 h-3 rounded-full`}></div>
                <span className="text-sm text-gray-600">{persona.name}</span>
              </div>
            )}
          </div>

          {/* Pain Points */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pain Points
            </label>
            <textarea
              value={painPoints}
              onChange={(e) => setPainPoints(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows="3"
              placeholder="Enter pain points separated by periods..."
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple pain points with periods</p>
          </div>

          {/* Opportunities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opportunities
            </label>
            <textarea
              value={opportunities}
              onChange={(e) => setOpportunities(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows="3"
              placeholder="Enter opportunities separated by periods..."
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple opportunities with periods</p>
          </div>

          {/* Customer Insights */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Insights
            </label>
            <textarea
              value={insights}
              onChange={(e) => setInsights(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows="4"
              placeholder="Enter customer insights, research findings, or additional context..."
            />
            <p className="text-xs text-gray-500 mt-1">Add any customer research, behavioral insights, or contextual information</p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0 space-y-4">
          {/* Delete Options */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {hasChanges && (
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  Unsaved changes
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {onDeleteStep && (
                <button
                  onClick={handleDeleteStep}
                  className="px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 text-sm rounded transition-colors flex items-center gap-1"
                  title="Delete this step"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Step
                </button>
              )}
              {onDeleteTask && (
                <button
                  onClick={handleDeleteTask}
                  className="px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 text-sm rounded transition-colors flex items-center gap-1"
                  title="Delete this task and all its steps"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Task
                </button>
              )}
              {onDeleteStage && (
                <button
                  onClick={handleDeleteStage}
                  className="px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 text-sm rounded transition-colors flex items-center gap-1"
                  title="Delete this stage and all its tasks and steps"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Stage
                </button>
              )}
            </div>
          </div>
          
          {/* Save/Cancel Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!description.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepDetailPanel; 