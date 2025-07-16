import React from 'react';
import { getPersonaById } from '../constants/personas';

const AggregatedPainpointView = ({ stages, onSwitchToStepView }) => {
  // Collect all tasks and organize by stage, maintaining order
  const allTasks = [];
  const stageSpans = []; // Track which columns belong to which stage

  stages.forEach(stage => {
    if (stage.tasks.length > 0) {
      const stageStartIndex = allTasks.length;
      
      stage.tasks.forEach(task => {
        const taskSteps = [];
        const taskPainPoints = [];
        const taskOpportunities = [];

        task.steps.forEach(step => {
          // Collect steps for this task
          taskSteps.push({
            ...step,
            persona: getPersonaById(step.personaId),
            stepId: step.id,
            taskId: task.id,
            stageName: stage.name,
            taskName: task.name
          });

          // Collect pain points for this task
          if (step.painPoints) {
            step.painPoints.forEach(point => {
              taskPainPoints.push({
                text: point,
                stepDescription: step.description,
                persona: getPersonaById(step.personaId),
                stepId: step.id,
                taskId: task.id,
                stageName: stage.name,
                taskName: task.name
              });
            });
          }
          
          // Collect opportunities for this task
          if (step.opportunities) {
            step.opportunities.forEach(opportunity => {
              taskOpportunities.push({
                text: opportunity,
                stepDescription: step.description,
                persona: getPersonaById(step.personaId),
                stepId: step.id,
                taskId: task.id,
                stageName: stage.name,
                taskName: task.name
              });
            });
          }
        });

        allTasks.push({
          stageName: stage.name,
          taskName: task.name,
          taskId: task.id,
          steps: taskSteps,
          painPoints: taskPainPoints,
          opportunities: taskOpportunities
        });
      });

      // Record the span for this stage
      stageSpans.push({
        stageName: stage.name,
        startIndex: stageStartIndex,
        span: stage.tasks.length
      });
    }
  });

  const handleItemClick = (item) => {
    if (onSwitchToStepView) {
      onSwitchToStepView();
      // Add highlight logic here if needed
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <tbody>
          {/* Stages Row */}
          <tr className="border-b border-gray-200">
            <td className="w-32 bg-purple-50 p-4 border-r border-gray-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="font-semibold text-purple-800">Stages</span>
              </div>
            </td>
            {stageSpans.map((stageSpan, index) => (
              <td 
                key={`stage-${stageSpan.stageName}`}
                colSpan={stageSpan.span}
                className={`bg-purple-100 border-r border-gray-200 last:border-r-0 text-center ${
                  index > 0 ? 'border-l-4 border-l-white' : ''
                }`}
              >
                <div className={`font-semibold text-purple-800 py-4 ${
                  index > 0 ? 'ml-4' : ''
                } ${
                  index < stageSpans.length - 1 ? 'mr-4' : ''
                }`}>
                  {stageSpan.stageName}
                </div>
              </td>
            ))}
          </tr>

          {/* Tasks Row */}
          <tr className="border-b border-gray-200">
            <td className="w-32 bg-blue-50 p-4 border-r border-gray-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="font-semibold text-blue-800">Tasks</span>
              </div>
            </td>
            {allTasks.map((task) => (
              <td key={`task-${task.taskId}`} className="min-w-64 p-4 border-r border-gray-200 last:border-r-0">
                <div className="bg-blue-100 rounded-lg p-3">
                  <div className="font-semibold text-blue-800 mb-2">{task.taskName}</div>
                  <div className="text-xs text-blue-600">
                    {task.steps.length} step{task.steps.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </td>
            ))}
          </tr>

          {/* Steps Row */}
          <tr className="border-b border-gray-200">
            <td className="w-32 bg-indigo-50 p-4 border-r border-gray-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="font-semibold text-indigo-800">Steps</span>
              </div>
            </td>
            {allTasks.map((task) => (
              <td key={`steps-${task.taskId}`} className="min-w-64 p-4 border-r border-gray-200 last:border-r-0 align-top">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {task.steps.map((step) => (
                    <div 
                      key={step.id} 
                      className="bg-indigo-100 rounded-lg p-2"
                    >
                      <p className="text-indigo-800 font-medium text-sm">{step.description || 'No description'}</p>
                      {step.persona && (
                        <div className="flex items-center gap-1 mt-1">
                          <div className={`${step.persona.color} w-2 h-2 rounded-full`}></div>
                          <span className="text-xs text-indigo-600">{step.persona.name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {task.steps.length === 0 && (
                    <div className="text-indigo-400 text-sm italic py-4 text-center">No steps</div>
                  )}
                </div>
              </td>
            ))}
          </tr>

          {/* Pain Points Row */}
          <tr className="border-b border-gray-200">
            <td className="w-32 bg-red-50 p-4 border-r border-gray-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="font-semibold text-red-800">Pain Points</span>
              </div>
            </td>
            {allTasks.map((task) => (
              <td key={`pain-${task.taskId}`} className="min-w-64 p-4 border-r border-gray-200 last:border-r-0 align-top">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {task.painPoints.map((item, index) => (
                    <div 
                      key={`${item.stepId}-${index}`} 
                      className="bg-red-100 rounded-lg p-2 cursor-pointer hover:bg-red-200 transition-colors"
                      onClick={() => handleItemClick(item)}
                      title="Click to navigate to related task"
                    >
                      <p className="text-red-800 font-medium text-sm">{item.text}</p>
                      {item.persona && (
                        <div className="flex items-center gap-1 mt-1">
                          <div className={`${item.persona.color} w-2 h-2 rounded-full`}></div>
                          <span className="text-xs text-red-600">{item.persona.name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {task.painPoints.length === 0 && (
                    <div className="text-red-400 text-sm italic py-4 text-center">No pain points</div>
                  )}
                </div>
              </td>
            ))}
          </tr>

          {/* Opportunities Row */}
          <tr>
            <td className="w-32 bg-green-50 p-4 border-r border-gray-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="font-semibold text-green-800">Opportunities</span>
              </div>
            </td>
            {allTasks.map((task) => (
              <td key={`opp-${task.taskId}`} className="min-w-64 p-4 border-r border-gray-200 last:border-r-0 align-top">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {task.opportunities.map((item, index) => (
                    <div 
                      key={`${item.stepId}-${index}`} 
                      className="bg-green-100 rounded-lg p-2 cursor-pointer hover:bg-green-200 transition-colors"
                      onClick={() => handleItemClick(item)}
                      title="Click to navigate to related task"
                    >
                      <p className="text-green-800 font-medium text-sm">{item.text}</p>
                      {item.persona && (
                        <div className="flex items-center gap-1 mt-1">
                          <div className={`${item.persona.color} w-2 h-2 rounded-full`}></div>
                          <span className="text-xs text-green-600">{item.persona.name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {task.opportunities.length === 0 && (
                    <div className="text-green-400 text-sm italic py-4 text-center">No opportunities</div>
                  )}
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default AggregatedPainpointView; 