import React, { useState, useRef, useEffect } from 'react';
import { getPersonaById } from '../constants/personas';
import EditableTitle from './EditableTitle';

const AggregatedPainpointView = ({ 
  stages, 
  onSwitchToStepView, 
  onOpenStepDetail, 
  onUpdateStep, 
  onDeleteStep, 
  onDeleteTask, 
  onDeleteStage,
  onUpdateStage,
  onUpdateTask,
  onMoveStep,
  onOpenEditPanel,
  editPanel,
  editablePainPoints,
  editableOpportunities,
  onCloseEditPanel,
  onAddPainPoint,
  onRemovePainPoint,
  onUpdatePainPoint,
  onAddOpportunity,
  onRemoveOpportunity,
  onUpdateOpportunity,
  onSaveEditChanges
}) => {
  const [highlightedItems, setHighlightedItems] = useState({ 
    stepId: null, 
    painPointIndex: null, 
    opportunityIndex: null,
    highlightAllRelated: false  // New flag to highlight all related items when step is clicked
  });
  const [connectorLines, setConnectorLines] = useState([]);
  const cardRefs = useRef({});
  const containerRef = useRef(null);
  // Collect all steps as individual columns, organize by stage and task
  const allSteps = [];
  const taskSpans = []; // Track which columns each task spans
  const stageSpans = []; // Track which columns each stage spans

  stages.forEach((stage, stageIndex) => {
    if (stage.tasks.length > 0) {
      const stageStartIndex = allSteps.length;
      let stageTotalSteps = 0;
      
      stage.tasks.forEach((task, taskIndex) => {
        const taskStartIndex = allSteps.length;
        
        // Handle tasks with no steps
        if (task.steps.length === 0) {
          // Create a placeholder step for empty tasks
          allSteps.push({
            id: `empty-${task.id}`,
            description: '',
            painPoints: [],
            opportunities: [],
            persona: null,
            stepId: `empty-${task.id}`,
            taskId: task.id,
            stageName: typeof stage.name === 'string' ? stage.name : stage.name?.name || 'Unnamed Stage',
            taskName: typeof task.name === 'string' ? task.name : task.name?.name || 'Unnamed Task',
            isEmpty: true
          });
          stageTotalSteps += 1;
          
          taskSpans.push({
            taskName: typeof task.name === 'string' ? task.name : task.name?.name || 'Unnamed Task',
            taskId: task.id,
            startIndex: taskStartIndex,
            span: 1
          });
        } else {
          // Add each step as its own column
          task.steps.forEach((step, stepIndex) => {
            allSteps.push({
              ...step,
              persona: getPersonaById(step.personaId),
              stepId: step.id,
              taskId: task.id,
              stageName: typeof stage.name === 'string' ? stage.name : stage.name?.name || 'Unnamed Stage',
              taskName: typeof task.name === 'string' ? task.name : task.name?.name || 'Unnamed Task',
              isEmpty: false
            });
          });
          
          stageTotalSteps += task.steps.length;
          
          taskSpans.push({
            taskName: typeof task.name === 'string' ? task.name : task.name?.name || 'Unnamed Task',
            taskId: task.id,
            startIndex: taskStartIndex,
            span: task.steps.length
          });
        }
      });

      // Record the span for this stage
      stageSpans.push({
        stageName: typeof stage.name === 'string' ? stage.name : stage.name?.name || 'Unnamed Stage',
        startIndex: stageStartIndex,
        span: stageTotalSteps
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
    // For step clicks, highlight all related items
    if (itemType === 'step') {
      // Check if this step is already highlighted with all related items
      const isAlreadyHighlighted = 
        highlightedItems.stepId === clickedItem.stepId && 
        highlightedItems.highlightAllRelated;
      
      if (isAlreadyHighlighted) {
        clearHighlighting();
        return;
      }
      
      // Highlight the step and all its related pain points and opportunities
      setHighlightedItems({
        stepId: clickedItem.stepId,
        painPointIndex: null,
        opportunityIndex: null,
        highlightAllRelated: true
      });
      return;
    }

    // For pain points and opportunities, handle existing highlighting logic
    // Check if this item is already highlighted - if so, clear highlighting
    const isAlreadyHighlighted = 
      highlightedItems.stepId === clickedItem.stepId && 
      ((itemType === 'painpoint' && highlightedItems.painPointIndex === itemIndex) ||
       (itemType === 'opportunity' && highlightedItems.opportunityIndex === itemIndex));
    
    if (isAlreadyHighlighted) {
      clearHighlighting();
      return;
    }
    
    // Set highlighting for pain points and opportunities
    setHighlightedItems({
      stepId: clickedItem.stepId,
      painPointIndex: itemType === 'painpoint' ? itemIndex : null,
      opportunityIndex: itemType === 'opportunity' ? itemIndex : null,
      highlightAllRelated: false
    });
    
    // Open step detail panel for pain points and opportunities
    if (onOpenStepDetail) {
      let foundStep = null;
      let foundStageId = null;
      
      // Find the full step data from stages
      for (const stage of stages) {
        for (const task of stage.tasks) {
          const step = task.steps.find(s => s.id === clickedItem.stepId);
          if (step) {
            foundStep = step;
            foundStageId = stage.id;
            break;
          }
        }
        if (foundStep) break;
      }
      
      if (foundStep) {
        onOpenStepDetail(
          foundStep,
          foundStageId,
          clickedItem.taskId,
          clickedItem.stageName,
          clickedItem.taskName
        );
      }
    }
  };

  // Function to clear highlighting
  const clearHighlighting = () => {
    setHighlightedItems({ stepId: null, painPointIndex: null, opportunityIndex: null, highlightAllRelated: false });
  };

  // Function to open the comprehensive edit panel
  const openEditPanel = (item, itemType, stageId, stageName, taskId, taskName) => {
    onOpenEditPanel(item, itemType, stageId, stageName, taskId, taskName);
  };

  // Delete functions
  const handleDeleteStep = () => {
    const stepDescription = editPanel.editData?.step?.description || 'this step';
    if (window.confirm(`Are you sure you want to delete "${stepDescription}"?`)) {
      onDeleteStep(editPanel.stageId, editPanel.taskId, editPanel.stepId);
      onCloseEditPanel();
    }
  };

  const handleDeleteTask = () => {
    if (window.confirm(`Are you sure you want to delete the task "${editPanel.taskName}" and all its steps?`)) {
      onDeleteTask(editPanel.stageId, editPanel.taskId);
      onCloseEditPanel();
    }
  };

  const handleDeleteStage = () => {
    if (window.confirm(`Are you sure you want to delete the stage "${editPanel.stageName}" and all its tasks and steps?`)) {
      onDeleteStage(editPanel.stageId);
      onCloseEditPanel();
    }
  };

  // Reusable card component
  const CardWithEdit = ({ 
    children, 
    onEdit, 
    className, 
    isHighlighted, 
    highlightColor = 'blue',
    title,
    type = 'step'
  }) => {
    const highlightClasses = {
      blue: 'ring-4 ring-blue-400 ring-opacity-50 scale-105 shadow-lg bg-blue-200',
      red: 'ring-4 ring-red-400 ring-opacity-50 scale-105 shadow-lg bg-red-200',
      green: 'ring-4 ring-green-400 ring-opacity-50 scale-105 shadow-lg bg-green-200',
      indigo: 'ring-4 ring-indigo-400 ring-opacity-50 scale-105 shadow-lg bg-indigo-200'
    };

    return (
      <div 
        className={`${className} cursor-pointer relative transition-all duration-200 ${
          isHighlighted ? highlightClasses[highlightColor] : ''
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        title={title}
      >
        {children}
      </div>
    );
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
    <>
      <div 
        ref={containerRef}
        className="bg-white p-4 relative w-full min-h-full"
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
      <table className="w-max border-separate" style={{borderSpacing: '12px 16px'}}>
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
                <div className="py-4 px-4 text-center">
                  <EditableTitle
                    title={stageSpan.stageName}
                    onSave={(newName) => {
                      const stage = stages.find(s => (typeof s.name === 'string' ? s.name : s.name?.name) === stageSpan.stageName);
                      if (stage && onUpdateStage) {
                        onUpdateStage(stage.id, { name: newName });
                      }
                    }}
                    className="font-semibold text-purple-800 text-center"
                  />
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
            {taskSpans.map((taskSpan) => (
              <td 
                key={`task-${taskSpan.taskId}`} 
                colSpan={taskSpan.span}
                className="w-64 text-center"
              >
                <div className="bg-blue-100 rounded-lg p-3 text-center">
                  <EditableTitle
                    title={taskSpan.taskName}
                    onSave={(newName) => {
                      const stage = stages.find(s => s.tasks.some(t => t.id === taskSpan.taskId));
                      if (stage && onUpdateTask) {
                        onUpdateTask(stage.id, taskSpan.taskId, { name: newName });
                      }
                    }}
                    className="font-semibold text-blue-800 break-words text-center"
                  />
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
            {allSteps.map((step, index) => {
              const isHighlighted = highlightedItems.stepId === step.stepId;
              const stepRefKey = `step-${step.taskId}-${step.stepId}`;
              
              return (
                <td 
                  key={`step-${step.stepId || step.id}`} 
                  className="w-64 align-top"
                >
                  {step.isEmpty ? (
                    <div className="text-indigo-400 text-sm italic py-4 text-center min-h-24 flex items-center justify-center">
                      No steps
                    </div>
                  ) : (
                    <div ref={el => cardRefs.current[stepRefKey] = el}>
                      <CardWithEdit
                        className="bg-indigo-100 rounded-lg p-2 hover:bg-indigo-200"
                        onEdit={() => {
                          // Find stage and task for this step
                          const stageData = stages.find(s => s.tasks.some(t => t.id === step.taskId));
                          const taskData = stageData?.tasks.find(t => t.id === step.taskId);
                          if (stageData && taskData) {
                            const stageName = typeof stageData.name === 'string' ? stageData.name : stageData.name?.name || 'Unnamed Stage';
                            const taskName = typeof taskData.name === 'string' ? taskData.name : taskData.name?.name || 'Unnamed Task';
                            openEditPanel(step, 'step', stageData.id, stageName, taskData.id, taskName);
                          }
                        }}
                        isHighlighted={isHighlighted}
                        highlightColor="indigo"
                        title="Click to edit step details"
                        type="step"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-indigo-800 font-medium text-sm">{step.description || 'No description'}</p>
                            {step.persona && (
                              <div className="flex items-center gap-1 mt-1">
                                <div className={`${step.persona.color} w-2 h-2 rounded-full`}></div>
                                <span className="text-xs text-indigo-600">{step.persona.name || 'Unknown Persona'}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardWithEdit>
                    </div>
                  )}
                </td>
              );
            })}
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
            {allSteps.map((step, index) => (
              <td 
                key={`pain-${step.stepId || step.id}`} 
                className="w-64 align-top"
              >
                <div className="space-y-2">
                  {step.isEmpty ? (
                    <div className="text-red-400 text-sm italic py-4 text-center">No pain points</div>
                  ) : (
                    step.painPoints && step.painPoints.length > 0 ? (
                      step.painPoints.map((painPoint, painPointIndex) => {
                        const isHighlighted = highlightedItems.stepId === step.stepId && 
                                             (highlightedItems.painPointIndex === painPointIndex || highlightedItems.highlightAllRelated);
                        const painPointRefKey = `painpoint-${step.taskId}-${step.stepId}-${painPointIndex}`;
                        
                        return (
                          <div 
                            key={`${step.stepId}-${painPointIndex}`}
                            ref={el => cardRefs.current[painPointRefKey] = el}
                          >
                            <CardWithEdit
                              className="bg-red-100 rounded-lg p-2 hover:bg-red-200"
                              onEdit={() => {
                                // Find stage and task for this pain point
                                const stageData = stages.find(s => s.tasks.some(t => t.id === step.taskId));
                                const taskData = stageData?.tasks.find(t => t.id === step.taskId);
                                if (stageData && taskData) {
                                  const stageName = typeof stageData.name === 'string' ? stageData.name : stageData.name?.name || 'Unnamed Stage';
                                  const taskName = typeof taskData.name === 'string' ? taskData.name : taskData.name?.name || 'Unnamed Task';
                                  const painPointItem = {
                                    text: painPoint,
                                    stepDescription: step.description,
                                    persona: step.persona,
                                    stepId: step.stepId,
                                    taskId: step.taskId,
                                    stageName,
                                    taskName
                                  };
                                  openEditPanel(painPointItem, 'painpoint', stageData.id, stageName, taskData.id, taskName);
                                }
                              }}
                              isHighlighted={isHighlighted}
                              highlightColor="red"
                              title="Click to edit pain point details"
                              type="pain point"
                            >
                              <p className="text-red-800 font-medium text-sm">{painPoint}</p>
                            </CardWithEdit>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-red-400 text-sm italic py-4 text-center">No pain points</div>
                    )
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
            {allSteps.map((step, index) => (
              <td 
                key={`opp-${step.stepId || step.id}`} 
                className="w-64 align-top"
              >
                <div className="space-y-2">
                  {step.isEmpty ? (
                    <div className="text-green-400 text-sm italic py-4 text-center">No opportunities</div>
                  ) : (
                    step.opportunities && step.opportunities.length > 0 ? (
                      step.opportunities.map((opportunity, opportunityIndex) => {
                        const isHighlighted = highlightedItems.stepId === step.stepId && 
                                             (highlightedItems.opportunityIndex === opportunityIndex || highlightedItems.highlightAllRelated);
                        const opportunityRefKey = `opportunity-${step.taskId}-${step.stepId}-${opportunityIndex}`;
                        
                        return (
                          <div 
                            key={`${step.stepId}-${opportunityIndex}`}
                            ref={el => cardRefs.current[opportunityRefKey] = el}
                          >
                            <CardWithEdit
                              className="bg-green-100 rounded-lg p-2 hover:bg-green-200"
                              onEdit={() => {
                                // Find stage and task for this opportunity
                                const stageData = stages.find(s => s.tasks.some(t => t.id === step.taskId));
                                const taskData = stageData?.tasks.find(t => t.id === step.taskId);
                                if (stageData && taskData) {
                                  const stageName = typeof stageData.name === 'string' ? stageData.name : stageData.name?.name || 'Unnamed Stage';
                                  const taskName = typeof taskData.name === 'string' ? taskData.name : taskData.name?.name || 'Unnamed Task';
                                  const opportunityItem = {
                                    text: opportunity,
                                    stepDescription: step.description,
                                    persona: step.persona,
                                    stepId: step.stepId,
                                    taskId: step.taskId,
                                    stageName,
                                    taskName
                                  };
                                  openEditPanel(opportunityItem, 'opportunity', stageData.id, stageName, taskData.id, taskName);
                                }
                              }}
                              isHighlighted={isHighlighted}
                              highlightColor="green"
                              title="Click to edit opportunity details"
                              type="opportunity"
                            >
                              <p className="text-green-800 font-medium text-sm">{opportunity}</p>
                            </CardWithEdit>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-green-400 text-sm italic py-4 text-center">No opportunities</div>
                    )
                  )}
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>

    {/* Edit panel is now rendered at the top level in App.js */}
    </>
  );
};

export default AggregatedPainpointView; 