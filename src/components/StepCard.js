import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { getPersonaByIdSync, getJobPerformerStyles, getJobPerformersByIds, getMultiPerformerColors } from '../services/jobPerformerService';
import { PERSONAS } from '../constants/personas';
import EditStepModal from './EditStepModal';
import CommentIndicator from './CommentIndicator';


const StepCard = ({ step, index, stageId, taskId, stageName, taskName, currentView, onUpdateStep, onDeleteStep, onOpenStepDetail, isHighlighted }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Handle both old (single personaId) and new (multiple jobPerformerIds) data structures
  let assignedJobPerformers = [];
  if (step?.jobPerformerIds && Array.isArray(step.jobPerformerIds)) {
    assignedJobPerformers = getJobPerformersByIds(step.jobPerformerIds);
  } else if (step?.personaId) {
    const singlePerformer = getPersonaByIdSync(step.personaId);
    assignedJobPerformers = singlePerformer ? [singlePerformer] : [];
  }
  
  // Get primary performer for backward compatibility
  const primaryPerformer = assignedJobPerformers[0] || null;
  const customStyles = getJobPerformerStyles(primaryPerformer);
  const performerColors = getMultiPerformerColors(assignedJobPerformers);
  
  // Debug logging for color issues
  console.log('🎨 StepCard Debug:', {
    stepId: step?.id,
    assignedJobPerformers: assignedJobPerformers,
    performerColors: performerColors,
    hasMultiple: assignedJobPerformers.length > 1
  });

  const handleDeleteStep = () => {
    if (window.confirm('Are you sure you want to delete this step?')) {
      onDeleteStep(stageId, taskId, step.id);
    }
  };

  const highlightClasses = isHighlighted 
    ? 'ring-4 ring-yellow-300 ring-opacity-75 shadow-lg transform scale-105' 
    : '';

  // Get border style for multiple performers
  const getBorderStyle = () => {
    if (performerColors.length === 0) return {};
    if (performerColors.length === 1) {
      return { borderLeftColor: performerColors[0], borderLeftWidth: '4px' };
    }
    // For multiple performers, we'll use CSS stripes
    return {};
  };

  // Generate CSS classes for multiple performer colors
  const getMultiPerformerClass = () => {
    if (performerColors.length <= 1) return '';
    return 'step-multi-performer';
  };

  // Create inline style for CSS variable
  const getMultiPerformerCSSVars = () => {
    if (performerColors.length <= 1) return {};
    
    const stripesCSS = [];
    const stripeHeight = 100 / performerColors.length;
    
    performerColors.forEach((color, index) => {
      const start = index * stripeHeight;
      const end = (index + 1) * stripeHeight;
      stripesCSS.push(`${color} ${start}%, ${color} ${end}%`);
    });
    
    return {
      '--performer-stripes': `linear-gradient(to bottom, ${stripesCSS.join(', ')})`
    };
  };

  // Get border classes - only apply border-l-4 when no job performers assigned
  const getBorderClasses = () => {
    if (performerColors.length === 0 && !primaryPerformer) {
      return 'border-l-4 border-gray-300'; // Gray border when no performers
    } else if (performerColors.length === 0 && primaryPerformer) {
      return `border-l-4 ${primaryPerformer.color} ${primaryPerformer.borderColor}`; // Single performer legacy styling
    } else if (performerColors.length === 1) {
      return 'border-l-4'; // Single performer with custom color
    }
    // Multiple performers - no border class, CSS will handle it
    return '';
  };

  // Conditionally render draggable only in step view
  const stepContent = (
    <div
      className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer h-full flex flex-col relative ${highlightClasses} ${getMultiPerformerClass()} ${getBorderClasses()}`}
      style={{
        ...(performerColors.length > 0 ? getBorderStyle() : (customStyles.borderLeftColor ? { borderLeftColor: customStyles.borderLeftColor } : {})),
        ...getMultiPerformerCSSVars()
      }}
      onClick={() => {
        if (onOpenStepDetail) {
          onOpenStepDetail(step, stageId, taskId, stageName, taskName);
        } else {
          setIsEditModalOpen(true);
        }
      }}
    >
      <div className="flex items-start justify-between h-full">
        <div className="flex-1 flex flex-col h-full">
          {/* Step Description */}
          <p className="text-gray-800 font-medium mb-2">
            {step.description || 'No description'}
          </p>
          
          <div className="flex-1 space-y-2">
            {step.painPoints && step.painPoints.length > 0 && (
              <div>
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
                <p className="text-xs font-semibold text-green-600 mb-1">Highlights:</p>
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
          
          {/* Job Performer Labels at Bottom */}
          {currentView === 'step' && assignedJobPerformers.length > 0 && (
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              {assignedJobPerformers.slice(0, 2).map((performer, index) => (
                <span 
                  key={performer.id}
                  className="text-xs px-1.5 py-0.5 rounded text-white"
                  style={{ 
                    backgroundColor: performer.hexColor || performer.color || '#6B7280',
                    fontSize: '0.65rem'
                  }}
                >
                  {performer.name}
                </span>
              ))}
              {assignedJobPerformers.length > 2 && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-gray-200 text-gray-700" style={{ fontSize: '0.65rem' }}>
                  +{assignedJobPerformers.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1 ml-2">
          {/* Comment Indicator */}
          <CommentIndicator 
            stepId={step.id} 
            onClick={() => {
              if (onOpenStepDetail) {
                onOpenStepDetail(step, stageId, taskId, stageName, taskName, 'comments');
              } else {
                setIsEditModalOpen(true);
              }
            }}
          />
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteStep();
            }}
            className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
            title="Delete step"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Temporarily disable drag and drop to debug Step View issues */}
      <div>
        {stepContent}
      </div>

      <EditStepModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        step={step}
        onUpdate={(stepData) => onUpdateStep(stageId, taskId, step.id, stepData)}
        jobPerformers={PERSONAS}
      />
    </>
  );
};

export default StepCard; 