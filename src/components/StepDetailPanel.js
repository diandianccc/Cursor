import React, { useState, useEffect } from 'react';
import { PERSONAS } from '../constants/personas';
import { getPersonaByIdSync, getJobPerformerStyles } from '../services/jobPerformerService';


const StepDetailPanel = ({ 
  isOpen, 
  onClose, 
  step, 
  onSave, 
  stageId, 
  taskId,
  stageName,
  taskName,
  jobPerformers,
  onDeleteStep,
  onDeleteTask,
  onDeleteStage,
  defaultTab = 'details'
}) => {
  const [description, setDescription] = useState('');
  const [personaId, setPersonaId] = useState(''); // Keep for backward compatibility
  const [selectedJobPerformers, setSelectedJobPerformers] = useState([]);
  const [painPoints, setPainPoints] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [currentExperiences, setCurrentExperiences] = useState([]);
  const [insights, setInsights] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);


  // Reset form when step changes or panel opens
  useEffect(() => {
    if (step && isOpen) {
      setDescription(step.description || '');

      const availableJobPerformers = jobPerformers || PERSONAS || [];
      
      // Handle backward compatibility: if step has jobPerformerIds, use those, otherwise use single personaId
      if (step.jobPerformerIds && Array.isArray(step.jobPerformerIds)) {
        setSelectedJobPerformers(step.jobPerformerIds);
        setPersonaId(step.jobPerformerIds[0] || (availableJobPerformers.length > 0 ? availableJobPerformers[0].id : 'customer'));
      } else if (step.personaId) {
        setSelectedJobPerformers([step.personaId]);
        setPersonaId(step.personaId);
      } else {
        const defaultId = availableJobPerformers.length > 0 ? availableJobPerformers[0].id : 'customer';
        setSelectedJobPerformers([defaultId]);
        setPersonaId(defaultId);
      }
      
      setPainPoints(step.painPoints || []);
      setOpportunities(step.opportunities || []);
      setCurrentExperiences(step.currentExperiences || []);
      setInsights(step.insights || '');
      setHasChanges(false);
    }
  }, [step, isOpen, jobPerformers, defaultTab]);

  // Track changes
  useEffect(() => {
    if (step) {
      const availableJobPerformers = jobPerformers || PERSONAS || [];
      
      // Get original job performer IDs for comparison
      let originalJobPerformerIds = [];
      if (step.jobPerformerIds && Array.isArray(step.jobPerformerIds)) {
        originalJobPerformerIds = step.jobPerformerIds;
      } else if (step.personaId) {
        originalJobPerformerIds = [step.personaId];
      } else {
        originalJobPerformerIds = availableJobPerformers.length > 0 ? [availableJobPerformers[0].id] : ['customer'];
      }
      
      const hasChanged = 
        description !== (step.description || '') ||
        JSON.stringify(selectedJobPerformers.sort()) !== JSON.stringify(originalJobPerformerIds.sort()) ||
        JSON.stringify(painPoints) !== JSON.stringify(step.painPoints || []) ||
        JSON.stringify(opportunities) !== JSON.stringify(step.opportunities || []) ||
        JSON.stringify(currentExperiences) !== JSON.stringify(step.currentExperiences || []) ||
        insights !== (step.insights || '');
      
      setHasChanges(hasChanged);
    }
  }, [description, selectedJobPerformers, painPoints, opportunities, currentExperiences, insights, step, jobPerformers]);

  const handleSave = () => {
    if (!step) return;

    try {
      const stepData = {
        description: description.trim(),
        personaId: selectedJobPerformers.length > 0 ? selectedJobPerformers[0] : null, // Keep for backward compatibility
        jobPerformerIds: selectedJobPerformers, // New multi-performer field
        painPoints: painPoints.filter(p => p && p.trim && p.trim()),
        opportunities: opportunities.filter(o => o && o.trim && o.trim()),
        currentExperiences: currentExperiences.filter(e => e && e.trim && e.trim()),
        insights: insights.trim()
      };

      console.log('🔧 StepDetailPanel: Saving step data:', stepData);
      onSave(stageId, taskId, step.id, stepData);
      setHasChanges(false);
      onClose();
    } catch (error) {
      console.error('Error saving step data:', error);
      alert('Failed to save step data. Please check the console for details.');
    }
  };

  const handleCancel = () => {
    if (hasChanges && !window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
      return;
    }
    onClose();
  };

  // toggleJobPerformer function removed - now using dropdown-style selection like EditPanel

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

  // Helper functions for managing array items
  const addPainPoint = () => {
    setPainPoints([...painPoints, '']);
  };

  const updatePainPoint = (index, value) => {
    const updated = [...painPoints];
    updated[index] = value;
    setPainPoints(updated);
  };

  const removePainPoint = (index) => {
    setPainPoints(painPoints.filter((_, i) => i !== index));
  };

  const addOpportunity = () => {
    setOpportunities([...opportunities, '']);
  };

  const updateOpportunity = (index, value) => {
    const updated = [...opportunities];
    updated[index] = value;
    setOpportunities(updated);
  };

  const removeOpportunity = (index) => {
    setOpportunities(opportunities.filter((_, i) => i !== index));
  };

  const addCurrentExperience = () => {
    setCurrentExperiences([...currentExperiences, '']);
  };

  const updateCurrentExperience = (index, value) => {
    const updated = [...currentExperiences];
    updated[index] = value;
    setCurrentExperiences(updated);
  };

  const removeCurrentExperience = (index) => {
    setCurrentExperiences(currentExperiences.filter((_, i) => i !== index));
  };

  const persona = getPersonaByIdSync(personaId) || getPersonaByIdSync('customer');

  if (!isOpen || !step) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex">
      {/* Backdrop - only covers left side */}
      <div 
        className="flex-1 bg-black bg-opacity-50"
        onClick={handleCancel}
      />
      
      {/* Side Panel */}
      <div className="w-1/2 max-w-2xl bg-white shadow-2xl h-full overflow-hidden flex flex-col relative z-[9999]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Step Details</h2>
              <p className="text-blue-100 mt-1">
                {typeof stageName === 'string' ? stageName : stageName?.name || 'Unnamed Stage'} → {typeof taskName === 'string' ? taskName : taskName?.name || 'Unnamed Task'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Three-dot dropdown menu */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="text-white hover:text-gray-200 p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
                  title="More options"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <>
                    {/* Backdrop to close dropdown */}
                    <div 
                      className="fixed inset-0 z-10"
                      onClick={() => setDropdownOpen(false)}
                    ></div>
                    
                    {/* Dropdown Content */}
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
                      <div className="py-1">
                        {onDeleteStep && (
                          <button
                            onClick={() => {
                              setDropdownOpen(false);
                              handleDeleteStep();
                            }}
                            className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Step
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {/* Close button */}
              <button
                onClick={handleCancel}
                className="text-white hover:text-gray-200 p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>



        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Step Details */}
          {(
            <>
              {/* Step Section */}
          <div className="bg-indigo-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Step Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Step description"
                  rows="3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Performers
                </label>
                
                {/* Multiple Job Performer Selector - matching EditPanel style */}
                <div className="space-y-2">
                  {selectedJobPerformers.map((performerId, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <select
                        value={performerId}
                        onChange={(e) => {
                          const newIds = [...selectedJobPerformers];
                          newIds[index] = e.target.value;
                          setSelectedJobPerformers(newIds);
                          // Update personaId for backward compatibility
                          setPersonaId(newIds[0] || '');
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {(jobPerformers || PERSONAS || []).map((persona) => (
                          <option key={persona.id} value={persona.id}>
                            {persona.name}
                          </option>
                        ))}
                      </select>
                      {selectedJobPerformers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newIds = selectedJobPerformers.filter((_, i) => i !== index);
                            setSelectedJobPerformers(newIds);
                            setPersonaId(newIds[0] || '');
                          }}
                          className="px-2 py-2 text-red-600 hover:bg-red-100 rounded-md transition-colors"
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
                        performer => !selectedJobPerformers.includes(performer.id)
                      );
                      if (unusedPerformers.length > 0) {
                        const newIds = [...selectedJobPerformers, unusedPerformers[0].id];
                        setSelectedJobPerformers(newIds);
                        setPersonaId(newIds[0] || '');
                      }
                    }}
                    className="w-full py-2 px-4 border-2 border-dashed border-indigo-300 text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
                    disabled={selectedJobPerformers.length >= (jobPerformers || PERSONAS || []).length}
                  >
                    + Add Job Performer
                  </button>
                </div>

                {/* Display selected job performers */}
                {selectedJobPerformers.length > 0 && (
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {selectedJobPerformers.map((performerId) => {
                      const performer = getPersonaByIdSync(performerId);
                      if (!performer) return null;
                      return (
                        <div key={performerId} className="flex items-center gap-1">
                          <div 
                            className={`w-3 h-3 rounded-full ${!getJobPerformerStyles(performer).backgroundColor ? performer.color : ''}`}
                            style={getJobPerformerStyles(performer).backgroundColor ? { backgroundColor: getJobPerformerStyles(performer).backgroundColor } : {}}
                          ></div>
                          <span className="text-sm text-gray-600">{performer.name}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Current Experience Section */}
          <div className="bg-orange-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Current Experiences ({currentExperiences.length})
              </div>
            </h3>
            <div className="space-y-2">
              {currentExperiences.length > 0 ? (
                currentExperiences.map((experience, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={experience}
                      onChange={(e) => updateCurrentExperience(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder={`Current experience ${index + 1}`}
                    />
                    <button
                      onClick={() => removeCurrentExperience(index)}
                      className="px-3 py-2 text-orange-600 hover:bg-orange-100 rounded-md transition-colors"
                      title="Remove current experience"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 italic">
                  No current experiences yet. Click the button below to add the first one.
                </div>
              )}
              <button 
                onClick={addCurrentExperience}
                className="w-full py-2 px-4 border-2 border-dashed border-orange-300 text-orange-600 rounded-md hover:bg-orange-50 transition-colors"
              >
                + Add Current Experience
              </button>
            </div>
          </div>

          {/* Pain Points Section */}
          <div className="bg-red-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Pain Points ({painPoints.length})
              </div>
            </h3>
            <div className="space-y-2">
              {painPoints.length > 0 ? (
                painPoints.map((painPoint, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={painPoint}
                      onChange={(e) => updatePainPoint(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder={`Pain point ${index + 1}`}
                    />
                    <button
                      onClick={() => removePainPoint(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                      title="Remove pain point"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 italic">
                  No pain points yet. Click the button below to add the first one.
                </div>
              )}
              <button 
                onClick={addPainPoint}
                className="w-full py-2 px-4 border-2 border-dashed border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
              >
                + Add Pain Point
              </button>
            </div>
          </div>

          {/* Opportunities Section */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v18m9-9H3" />
                </svg>
                Highlights ({opportunities.length})
              </div>
            </h3>
            <div className="space-y-2">
              {opportunities.length > 0 ? (
                opportunities.map((opportunity, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={opportunity}
                      onChange={(e) => updateOpportunity(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder={`Highlight ${index + 1}`}
                    />
                    <button
                      onClick={() => removeOpportunity(index)}
                      className="px-3 py-2 text-green-600 hover:bg-green-100 rounded-md transition-colors"
                      title="Remove highlight"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 italic">
                  No highlights yet. Click the button below to add the first one.
                </div>
              )}
              <button 
                onClick={addOpportunity}
                className="w-full py-2 px-4 border-2 border-dashed border-green-300 text-green-600 rounded-md hover:bg-green-50 transition-colors"
              >
                + Add Highlight
              </button>
            </div>
          </div>

          {/* Lessons Learned Section */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Lessons Learned ({insights ? 1 : 0})
              </div>
            </h3>
            <div className="space-y-2">
              <textarea
                value={insights}
                onChange={(e) => setInsights(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="Enter lessons learned, key takeaways, or additional context..."
                rows="4"
              />
            </div>
          </div>
            </>
          )}


        </div>

        {/* Sticky Footer with Save/Cancel */}
        <div className="border-t bg-gray-50 p-6">
          <div className="flex justify-between items-center">
            <button
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={!description.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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