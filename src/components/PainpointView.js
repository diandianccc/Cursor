import React from 'react';
import { getPersonaByIdSync } from '../services/jobPerformerService';
import CommentIndicator from './CommentIndicator';

const PainpointView = ({ task, onPainpointClick }) => {
  // Collect all pain points and opportunities from all steps in this task
  const allPainPoints = [];
  const allOpportunities = [];

  task.steps.forEach(step => {
    if (step.painPoints) {
      step.painPoints.forEach(point => {
        allPainPoints.push({
          text: point,
          stepDescription: step.description,
          persona: getPersonaByIdSync(step.personaId),
          stepId: step.id,
          taskId: task.id
        });
      });
    }
    
    if (step.opportunities) {
      step.opportunities.forEach(opportunity => {
        allOpportunities.push({
          text: opportunity,
          stepDescription: step.description,
          persona: getPersonaByIdSync(step.personaId),
          stepId: step.id,
          taskId: task.id
        });
      });
    }
  });

  const handleItemClick = (item) => {
    if (onPainpointClick) {
      onPainpointClick(item.taskId, item.stepId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Steps Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h5 className="font-semibold text-blue-800">Steps ({task.steps.length})</h5>
        </div>
        
        {task.steps.length > 0 ? (
          <div className="space-y-2">
            {task.steps.map((step) => {
              return (
                <div key={step.id} className="bg-white rounded p-3 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-800 font-medium flex-1">{step.description || 'No description'}</p>
                    <CommentIndicator 
                      stepId={step.id} 
                      onClick={() => handleItemClick({ taskId: task.id, stepId: step.id })}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-blue-600 text-sm italic">No steps in this task</p>
        )}
      </div>

      {/* Pain Points Section */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h5 className="font-semibold text-red-800">Pain Points ({allPainPoints.length})</h5>
        </div>
        
        {allPainPoints.length > 0 ? (
          <div className="space-y-2">
            {allPainPoints.map((item, index) => (
              <div 
                key={`${item.stepId}-${index}`} 
                className="bg-white rounded p-3 border border-red-100 cursor-pointer hover:bg-red-25 hover:border-red-200 transition-colors"
                onClick={() => handleItemClick(item)}
                title="Click to navigate to related task"
              >
                <p className="text-gray-800 font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-red-600 text-sm italic">No pain points identified for this task</p>
        )}
      </div>

      {/* Opportunities Section */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <h5 className="font-semibold text-green-800">Highlights ({allOpportunities.length})</h5>
        </div>
        
        {allOpportunities.length > 0 ? (
          <div className="space-y-2">
            {allOpportunities.map((item, index) => (
              <div 
                key={`${item.stepId}-${index}`} 
                className="bg-white rounded p-3 border border-green-100 cursor-pointer hover:bg-green-25 hover:border-green-200 transition-colors"
                onClick={() => handleItemClick(item)}
                title="Click to navigate to related task"
              >
                <p className="text-gray-800 font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-green-600 text-sm italic">No highlights identified for this task</p>
        )}
      </div>
    </div>
  );
};

export default PainpointView; 