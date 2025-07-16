import React, { useState, useRef, useEffect } from 'react';
import { getPersonaById } from '../constants/personas';
import usePanScroll from '../hooks/usePanScroll';

const AggregatedPainpointView = ({ stages, onSwitchToStepView }) => {
  const [highlightedItems, setHighlightedItems] = useState({ 
    stepId: null, 
    painPointIndex: null, 
    opportunityIndex: null,
    highlightAllRelated: false  // New flag to highlight all related items when step is clicked
  });
  const [connectorLines, setConnectorLines] = useState([]);
  const containerRef = useRef(null);
  const cardRefs = useRef({});
  const panScroll = usePanScroll();
  // Collect all tasks and organize by stage, maintaining order
  const allTasks = [];
  const stageSpans = []; // Track which columns belong to which stage

  stages.forEach((stage, stageIndex) => {
    if (stage.tasks.length > 0) {
      const stageStartIndex = allTasks.length;
      
      stage.tasks.forEach((task, taskIndex) => {
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
          opportunities: taskOpportunities,
          stageIndex: stageIndex,
          taskIndex: taskIndex,
          isLastTaskInStage: taskIndex === stage.tasks.length - 1,
          isFirstTaskInStage: taskIndex === 0
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

  // Function to calculate elbow connector between two points
  const calculateElbowConnector = (startRect, endRect, containerRect) => {
    const startX = startRect.left - containerRect.left + startRect.width / 2;
    const startY = startRect.top - containerRect.top + startRect.height / 2;
    const endX = endRect.left - containerRect.left + endRect.width / 2;
    const endY = endRect.top - containerRect.top + endRect.height / 2;
    
    // Create elbow connector (L-shaped)
    const midX = startX + (endX - startX) / 2;
    
    return `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;
  };

  // Function to handle item clicks (pain points, opportunities, or steps)
  const handleItemClick = (clickedItem, itemType, itemIndex) => {
    if (!containerRef.current) return;
    
    // Check if this item is already highlighted - if so, clear highlighting
    const isAlreadyHighlighted = 
      highlightedItems.stepId === clickedItem.stepId && 
      ((itemType === 'painpoint' && highlightedItems.painPointIndex === itemIndex) ||
       (itemType === 'opportunity' && highlightedItems.opportunityIndex === itemIndex) ||
       (itemType === 'step' && highlightedItems.highlightAllRelated));
    
    if (isAlreadyHighlighted) {
      clearHighlighting();
      return;
    }
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const lines = [];
    
    // Find related step and all pain points/opportunities from the same step
    const relatedStep = allTasks
      .flatMap(task => task.steps)
      .find(step => step.stepId === clickedItem.stepId);
    
    if (relatedStep) {
      const stepRefKey = `step-${clickedItem.taskId}-${clickedItem.stepId}`;
      const stepRect = cardRefs.current[stepRefKey]?.getBoundingClientRect();
      
      // Find all pain points and opportunities from the same step
      const sameStepPainPoints = allTasks
        .flatMap(task => task.painPoints)
        .filter(pp => pp.stepId === clickedItem.stepId);
      
      const sameStepOpportunities = allTasks
        .flatMap(task => task.opportunities)
        .filter(opp => opp.stepId === clickedItem.stepId);
      
      if (itemType === 'step') {
        // Step clicked - draw lines to all its pain points and opportunities
        [...sameStepPainPoints, ...sameStepOpportunities].forEach((relatedItem, index) => {
          const relatedType = sameStepPainPoints.includes(relatedItem) ? 'painpoint' : 'opportunity';
          const relatedIndex = relatedType === 'painpoint' ? 
            sameStepPainPoints.indexOf(relatedItem) : 
            sameStepOpportunities.indexOf(relatedItem);
          const relatedRefKey = `${relatedType}-${relatedItem.taskId}-${relatedItem.stepId}-${relatedIndex}`;
          const relatedRect = cardRefs.current[relatedRefKey]?.getBoundingClientRect();
          
          if (relatedRect && stepRect) {
            const pathToRelated = calculateElbowConnector(stepRect, relatedRect, containerRect);
            lines.push({ 
              path: pathToRelated, 
              color: relatedType === 'painpoint' ? '#dc2626' : '#16a34a' 
            });
          }
        });
      } else {
        // Pain point or opportunity clicked
        const clickedRefKey = `${itemType}-${clickedItem.taskId}-${clickedItem.stepId}-${itemIndex}`;
        const clickedRect = cardRefs.current[clickedRefKey]?.getBoundingClientRect();
        
        if (stepRect && clickedRect) {
          // Draw line from clicked item to its step
          const pathToStep = calculateElbowConnector(clickedRect, stepRect, containerRect);
          lines.push({ path: pathToStep, color: '#6366f1' });
          
          // Draw connectors to all related pain points and opportunities
          [...sameStepPainPoints, ...sameStepOpportunities].forEach((relatedItem, index) => {
            const isCurrentClicked = (itemType === 'painpoint' && sameStepPainPoints.includes(relatedItem) && 
                                    sameStepPainPoints.indexOf(relatedItem) === itemIndex) ||
                                    (itemType === 'opportunity' && sameStepOpportunities.includes(relatedItem) && 
                                    sameStepOpportunities.indexOf(relatedItem) === itemIndex);
            
            if (!isCurrentClicked) {
              const relatedType = sameStepPainPoints.includes(relatedItem) ? 'painpoint' : 'opportunity';
              const relatedIndex = relatedType === 'painpoint' ? 
                sameStepPainPoints.indexOf(relatedItem) : 
                sameStepOpportunities.indexOf(relatedItem);
              const relatedRefKey = `${relatedType}-${relatedItem.taskId}-${relatedItem.stepId}-${relatedIndex}`;
              const relatedRect = cardRefs.current[relatedRefKey]?.getBoundingClientRect();
              
              if (relatedRect) {
                const pathToRelated = calculateElbowConnector(clickedRect, relatedRect, containerRect);
                lines.push({ 
                  path: pathToRelated, 
                  color: relatedType === 'painpoint' ? '#dc2626' : '#16a34a' 
                });
              }
            }
          });
        }
      }
      
      // Set highlighting
      setHighlightedItems({
        stepId: clickedItem.stepId,
        painPointIndex: itemType === 'painpoint' ? itemIndex : null,
        opportunityIndex: itemType === 'opportunity' ? itemIndex : null,
        highlightAllRelated: itemType === 'step'  // Highlight all related items when step is clicked
      });
    }
    
    setConnectorLines(lines);
  };

  // Function to clear highlighting
  const clearHighlighting = () => {
    setHighlightedItems({ stepId: null, painPointIndex: null, opportunityIndex: null, highlightAllRelated: false });
    setConnectorLines([]);
  };

  // Handle escape key and outside clicks
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        clearHighlighting();
      }
    };

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        clearHighlighting();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div 
      ref={(el) => {
        containerRef.current = el;
        panScroll.ref.current = el;
      }}
      className={`overflow-x-auto bg-white p-4 relative pan-scroll-container ${panScroll.isDragging ? 'dragging' : ''}`}
      title="Click and drag to pan horizontally"
      onClick={(e) => {
        // Clear highlighting if clicking on background
        if (e.target === e.currentTarget) {
          clearHighlighting();
        }
      }}
    >
      {/* SVG Overlay for connector lines */}
      {connectorLines.length > 0 && (
        <svg 
          className="absolute inset-0 pointer-events-none" 
          style={{ zIndex: 10 }}
        >
          {connectorLines.map((line, index) => (
            <path
              key={index}
              d={line.path}
              stroke={line.color}
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
              opacity="0.8"
            />
          ))}
        </svg>
      )}
      <table className="min-w-full border-separate" style={{borderSpacing: '12px 16px'}}>
        <tbody>
          {/* Stages Row */}
          <tr>
            <td className="w-32 bg-purple-50 py-4 px-4 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="font-semibold text-purple-800">Stages</span>
              </div>
            </td>
            {stageSpans.map((stageSpan) => (
              <td 
                key={`stage-${stageSpan.stageName}`}
                colSpan={stageSpan.span}
                className="bg-purple-100 text-center rounded-lg"
              >
                <div className="font-semibold text-purple-800 py-4 px-4">
                  {stageSpan.stageName}
                </div>
              </td>
            ))}
          </tr>

          {/* Tasks Row */}
          <tr>
            <td className="w-32 bg-blue-50 py-4 px-4 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="font-semibold text-blue-800">Tasks</span>
              </div>
            </td>
            {allTasks.map((task) => (
              <td 
                key={`task-${task.taskId}`} 
                className="min-w-64 align-top"
              >
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
          <tr>
            <td className="w-32 bg-indigo-50 py-4 px-4 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="font-semibold text-indigo-800">Steps</span>
              </div>
            </td>
            {allTasks.map((task) => (
              <td 
                key={`steps-${task.taskId}`} 
                className="min-w-64 align-top"
              >
                <div className="space-y-2">
                  {task.steps.map((step) => {
                    const isHighlighted = highlightedItems.stepId === step.stepId;
                    const stepRefKey = `step-${step.taskId}-${step.stepId}`;
                    
                    return (
                      <div 
                        key={step.id}
                        ref={el => cardRefs.current[stepRefKey] = el}
                        className={`bg-indigo-100 rounded-lg p-2 cursor-pointer hover:bg-indigo-200 transition-all duration-200 ${
                          isHighlighted ? 'ring-4 ring-indigo-400 ring-opacity-50 scale-105 shadow-lg bg-indigo-200' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(step, 'step', null);
                        }}
                        title="Click to highlight and show connections to related pain points and opportunities (click again to dismiss)"
                      >
                        <p className="text-indigo-800 font-medium text-sm">{step.description || 'No description'}</p>
                        {step.persona && (
                          <div className="flex items-center gap-1 mt-1">
                            <div className={`${step.persona.color} w-2 h-2 rounded-full`}></div>
                            <span className="text-xs text-indigo-600">{step.persona.name}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {task.steps.length === 0 && (
                    <div className="text-indigo-400 text-sm italic py-4 text-center">No steps</div>
                  )}
                </div>
              </td>
            ))}
          </tr>

          {/* Pain Points Row */}
          <tr>
            <td className="w-32 bg-red-50 py-4 px-4 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="font-semibold text-red-800">Pain Points</span>
              </div>
            </td>
            {allTasks.map((task) => (
              <td 
                key={`pain-${task.taskId}`} 
                className="min-w-64 align-top"
              >
                <div className="space-y-2">
                  {task.painPoints.map((item, index) => {
                    const isHighlighted = highlightedItems.stepId === item.stepId && 
                                         (highlightedItems.painPointIndex === index || highlightedItems.highlightAllRelated);
                    const painPointRefKey = `painpoint-${item.taskId}-${item.stepId}-${index}`;
                    
                    return (
                      <div 
                        key={`${item.stepId}-${index}`}
                        ref={el => cardRefs.current[painPointRefKey] = el}
                        className={`bg-red-100 rounded-lg p-2 cursor-pointer hover:bg-red-200 transition-all duration-200 ${
                          isHighlighted ? 'ring-4 ring-red-400 ring-opacity-50 scale-105 shadow-lg bg-red-200' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(item, 'painpoint', index);
                        }}
                        title="Click to highlight and show connections to related step and opportunities (click again to dismiss)"
                      >
                        <p className="text-red-800 font-medium text-sm">{item.text}</p>
                        {item.persona && (
                          <div className="flex items-center gap-1 mt-1">
                            <div className={`${item.persona.color} w-2 h-2 rounded-full`}></div>
                            <span className="text-xs text-red-600">{item.persona.name}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {task.painPoints.length === 0 && (
                    <div className="text-red-400 text-sm italic py-4 text-center">No pain points</div>
                  )}
                </div>
              </td>
            ))}
          </tr>

          {/* Opportunities Row */}
          <tr>
            <td className="w-32 bg-green-50 py-4 px-4 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="font-semibold text-green-800">Opportunities</span>
              </div>
            </td>
            {allTasks.map((task) => (
              <td 
                key={`opp-${task.taskId}`} 
                className="min-w-64 align-top"
              >
                <div className="space-y-2">
                  {task.opportunities.map((item, index) => {
                    const isHighlighted = highlightedItems.stepId === item.stepId && 
                                         (highlightedItems.opportunityIndex === index || highlightedItems.highlightAllRelated);
                    const opportunityRefKey = `opportunity-${item.taskId}-${item.stepId}-${index}`;
                    
                    return (
                      <div 
                        key={`${item.stepId}-${index}`}
                        ref={el => cardRefs.current[opportunityRefKey] = el}
                        className={`bg-green-100 rounded-lg p-2 cursor-pointer hover:bg-green-200 transition-all duration-200 ${
                          isHighlighted ? 'ring-4 ring-green-400 ring-opacity-50 scale-105 shadow-lg bg-green-200' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(item, 'opportunity', index);
                        }}
                        title="Click to highlight and show connections to related step and pain points (click again to dismiss)"
                      >
                        <p className="text-green-800 font-medium text-sm">{item.text}</p>
                        {item.persona && (
                          <div className="flex items-center gap-1 mt-1">
                            <div className={`${item.persona.color} w-2 h-2 rounded-full`}></div>
                            <span className="text-xs text-green-600">{item.persona.name}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
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