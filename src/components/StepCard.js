import React, { useState } from 'react';
import { getPersonaById } from '../constants/personas';
import EditStepModal from './EditStepModal';

const StepCard = ({ step, stageId, taskId, stageName, taskName, currentView, onUpdateStep, onDeleteStep, onOpenStepDetail, isHighlighted }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const persona = getPersonaById(step.personaId);

  const handleDeleteStep = () => {
    if (window.confirm('Are you sure you want to delete this step?')) {
      onDeleteStep(stageId, taskId, step.id);
    }
  };

  const highlightClasses = isHighlighted 
    ? 'ring-4 ring-yellow-300 ring-opacity-75 shadow-lg transform scale-105' 
    : '';

  return (
    <>
      <div 
        className={`${persona.color} ${persona.borderColor} border-l-4 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${highlightClasses}`}
        onClick={() => {
          if (onOpenStepDetail) {
            onOpenStepDetail(step, stageId, taskId, stageName, taskName);
          } else {
            setIsEditModalOpen(true);
          }
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {currentView === 'step' && (
              <div className="flex items-center gap-2 mb-2">
                <span className={`${persona.color} ${persona.textColor} text-xs px-2 py-1 rounded-full`}>
                  {persona.name}
                </span>
              </div>
            )}
            
            <p className="text-gray-800 font-medium mb-2">
              {step.description || 'No description'}
            </p>
            
            {step.painPoints && step.painPoints.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-semibold text-red-600 mb-1">Pain Points:</p>
                <div className="flex flex-wrap gap-1">
                  {step.painPoints.map((point, index) => (
                    <span key={index} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      {point.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {step.opportunities && step.opportunities.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-green-600 mb-1">Opportunities:</p>
                <div className="flex flex-wrap gap-1">
                  {step.opportunities.map((opportunity, index) => (
                    <span key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {opportunity.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteStep();
            }}
            className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors ml-2"
            title="Delete step"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <EditStepModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        step={step}
        onUpdate={(stepData) => onUpdateStep(stageId, taskId, step.id, stepData)}
      />
    </>
  );
};

export default StepCard; 