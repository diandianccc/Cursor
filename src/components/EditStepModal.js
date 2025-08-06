import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { PERSONAS } from '../constants/personas';
import { getPersonaByIdSync, getJobPerformerStyles, getJobPerformersByIds } from '../services/jobPerformerService';

const EditStepModal = ({ isOpen, onClose, step, onUpdate, jobPerformers }) => {
  const [description, setDescription] = useState('');
  const [jobPerformerIds, setJobPerformerIds] = useState([]);
  const [painPoints, setPainPoints] = useState('');
  const [opportunities, setOpportunities] = useState('');
  const [insights, setInsights] = useState('');
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    if (step && isOpen) {
      setDescription(step.description || '');
      
      // Handle both new jobPerformerIds and legacy personaId
      const availableJobPerformers = jobPerformers || PERSONAS || [];
      if (step.jobPerformerIds && Array.isArray(step.jobPerformerIds)) {
        setJobPerformerIds(step.jobPerformerIds);
      } else if (step.personaId) {
        setJobPerformerIds([step.personaId]);
      } else {
        setJobPerformerIds(availableJobPerformers.length > 0 ? [availableJobPerformers[0].id] : ['customer']);
      }
      
      setPainPoints(step.painPoints ? step.painPoints.join('. ') : '');
      setOpportunities(step.opportunities ? step.opportunities.join('. ') : '');
      setInsights(step.insights || '');
    }
  }, [step, isOpen, jobPerformers]);

  // Listen for job performer updates
  useEffect(() => {
    const handleJobPerformersUpdate = () => {
      setForceUpdate(prev => prev + 1);
    };

    window.addEventListener('jobPerformersUpdated', handleJobPerformersUpdate);
    return () => {
      window.removeEventListener('jobPerformersUpdated', handleJobPerformersUpdate);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (description.trim()) {
      const stepData = {
        description: description.trim(),
        jobPerformerIds: jobPerformerIds,
        personaId: jobPerformerIds.length > 0 ? jobPerformerIds[0] : null, // For backward compatibility
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Performers
          </label>
          
          {/* Multiple Job Performer Selector */}
          <div className="space-y-2">
            {jobPerformerIds.map((performerId, index) => (
              <div key={index} className="flex items-center gap-2">
                <select
                  value={performerId}
                  onChange={(e) => {
                    const newIds = [...jobPerformerIds];
                    newIds[index] = e.target.value;
                    setJobPerformerIds(newIds);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  {(jobPerformers || PERSONAS || []).map((persona) => (
                    <option key={persona.id} value={persona.id}>
                      {persona.name}
                    </option>
                  ))}
                </select>
                {jobPerformerIds.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setJobPerformerIds(jobPerformerIds.filter((_, i) => i !== index));
                    }}
                    className="px-2 py-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Remove job performer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            
            {/* Add Job Performer Button */}
            <button
              type="button"
              onClick={() => {
                const availableJobPerformers = jobPerformers || PERSONAS || [];
                const unusedPerformers = availableJobPerformers.filter(
                  performer => !jobPerformerIds.includes(performer.id)
                );
                if (unusedPerformers.length > 0) {
                  setJobPerformerIds([...jobPerformerIds, unusedPerformers[0].id]);
                }
              }}
              className="w-full py-2 px-4 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              disabled={jobPerformerIds.length >= (jobPerformers || PERSONAS || []).length}
            >
              + Add Job Performer
            </button>
          </div>

          {/* Display selected job performers */}
          {jobPerformerIds.length > 0 && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {getJobPerformersByIds(jobPerformerIds).map((performer) => (
                <div key={performer.id} className="flex items-center gap-1">
                  <div 
                    className={`w-3 h-3 rounded-full ${!getJobPerformerStyles(performer).backgroundColor ? performer.color : ''}`}
                    style={getJobPerformerStyles(performer).backgroundColor ? { backgroundColor: getJobPerformerStyles(performer).backgroundColor } : {}}
                  ></div>
                  <span className="text-sm text-gray-600">{performer.name}</span>
                </div>
              ))}
            </div>
          )}
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
            Highlights
          </label>
          <textarea
            id="editOpportunities"
            value={opportunities}
            onChange={(e) => setOpportunities(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            rows="2"
            placeholder="Enter highlights separated by periods..."
          />
          <p className="text-xs text-gray-500 mt-1">Separate multiple highlights with periods</p>
        </div>

        <div>
          <label htmlFor="editInsights" className="block text-sm font-medium text-gray-700 mb-1">
            Lessons Learned
          </label>
          <textarea
            id="editInsights"
            value={insights}
            onChange={(e) => setInsights(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            placeholder="Enter lessons learned, key takeaways, or additional context..."
          />
          <p className="text-xs text-gray-500 mt-1">Add key takeaways, lessons learned, or contextual information</p>
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