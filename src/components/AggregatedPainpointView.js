import React, { useState, useRef, useEffect } from 'react';
import { getPersonaById } from '../constants/personas';

const AggregatedPainpointView = ({ stages, onSwitchToStepView, onOpenStepDetail, onUpdateStep, onDeleteStep, onDeleteTask, onDeleteStage }) => {
  const [highlightedItems, setHighlightedItems] = useState({ 
    stepId: null, 
    painPointIndex: null, 
    opportunityIndex: null,
    highlightAllRelated: false  // New flag to highlight all related items when step is clicked
  });
  const [connectorLines, setConnectorLines] = useState([]);
  const [editPanel, setEditPanel] = useState({
    isOpen: false,
    editData: null, // Will contain the step data and all related info
    stageId: null,
    stageName: '',
    taskId: null,
    taskName: '',
    stepId: null
  });
  const [editablePainPoints, setEditablePainPoints] = useState([]);
  const [editableOpportunities, setEditableOpportunities] = useState([]);
  const cardRefs = useRef({});
  const containerRef = useRef(null);
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
    // Find the complete step data and all related information
    const stage = stages.find(s => s.id === stageId);
    const task = stage?.tasks.find(t => t.id === taskId);
    const step = task?.steps.find(s => s.id === item.stepId);
    
    if (step && task && stage) {
      // Initialize editable arrays
      setEditablePainPoints(step.painPoints || []);
      setEditableOpportunities(step.opportunities || []);
      
      setEditPanel({
        isOpen: true,
        editData: {
          stage: stage,
          task: task,
          step: step,
          allPainPoints: step.painPoints || [],
          allOpportunities: step.opportunities || []
        },
        stageId: stageId,
        stageName: stageName,
        taskId: taskId,
        taskName: taskName,
        stepId: step.id
      });
    }
  };

  const closeEditPanel = () => {
    setEditPanel({
      isOpen: false,
      editData: null,
      stageId: null,
      stageName: '',
      taskId: null,
      taskName: '',
      stepId: null
    });
    setEditablePainPoints([]);
    setEditableOpportunities([]);
  };

  // Pain Points management functions
  const addPainPoint = () => {
    setEditablePainPoints([...editablePainPoints, '']);
  };

  const removePainPoint = (index) => {
    setEditablePainPoints(editablePainPoints.filter((_, i) => i !== index));
  };

  const updatePainPoint = (index, value) => {
    const updated = [...editablePainPoints];
    updated[index] = value;
    setEditablePainPoints(updated);
  };

  // Opportunities management functions
  const addOpportunity = () => {
    setEditableOpportunities([...editableOpportunities, '']);
  };

  const removeOpportunity = (index) => {
    setEditableOpportunities(editableOpportunities.filter((_, i) => i !== index));
  };

  const updateOpportunity = (index, value) => {
    const updated = [...editableOpportunities];
    updated[index] = value;
    setEditableOpportunities(updated);
  };

  // Save function
  const saveChanges = () => {
    if (!editPanel.editData || !onUpdateStep) return;

    // Filter out empty pain points and opportunities
    const filteredPainPoints = editablePainPoints.filter(point => point.trim() !== '');
    const filteredOpportunities = editableOpportunities.filter(opp => opp.trim() !== '');

    // Create updated step data
    const stepData = {
      ...editPanel.editData.step,
      painPoints: filteredPainPoints,
      opportunities: filteredOpportunities
    };

    // Call the update function
    onUpdateStep(editPanel.stageId, editPanel.taskId, editPanel.stepId, stepData);
    
    // Close the panel
    closeEditPanel();
  };

  // Delete functions
  const handleDeleteStep = () => {
    if (!editPanel.editData || !onDeleteStep) return;
    
    const stepDescription = editPanel.editData.step.description || 'this step';
    if (window.confirm(`Are you sure you want to delete "${stepDescription}"?`)) {
      onDeleteStep(editPanel.stageId, editPanel.taskId, editPanel.stepId);
      closeEditPanel();
    }
  };

  const handleDeleteTask = () => {
    if (!editPanel.editData || !onDeleteTask) return;
    
    if (window.confirm(`Are you sure you want to delete the task "${editPanel.taskName}" and all its steps?`)) {
      onDeleteTask(editPanel.stageId, editPanel.taskId);
      closeEditPanel();
    }
  };

  const handleDeleteStage = () => {
    if (!editPanel.editData || !onDeleteStage) return;
    
    if (window.confirm(`Are you sure you want to delete the stage "${editPanel.stageName}" and all its tasks and steps?`)) {
      onDeleteStage(editPanel.stageId);
      closeEditPanel();
    }
  };

  // Reusable card component with hover edit icon
  const CardWithEdit = ({ 
    children, 
    onClick, 
    onEdit, 
    className, 
    isHighlighted, 
    highlightColor = 'blue',
    title,
    type = 'step'
  }) => {
    const [isHovering, setIsHovering] = useState(false);
    
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
        onClick={onClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        title={title}
      >
        {children}
        
        {/* Pencil edit icon on hover */}
        {isHovering && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="absolute top-1 right-1 bg-white hover:bg-gray-100 rounded-full p-1 shadow-md border border-gray-200 transition-all duration-200 hover:scale-110"
            title={`Edit ${type}`}
          >
            <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}
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
                      <div key={step.id} ref={el => cardRefs.current[stepRefKey] = el}>
                        <CardWithEdit
                          className="bg-indigo-100 rounded-lg p-2 hover:bg-indigo-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemClick(step, 'step', null);
                          }}
                          onEdit={() => {
                            // Find stage and task for this step
                            const stageData = stages.find(s => s.tasks.some(t => t.id === step.taskId));
                            const taskData = stageData?.tasks.find(t => t.id === step.taskId);
                            if (stageData && taskData) {
                              openEditPanel(step, 'step', stageData.id, stageData.name, taskData.id, taskData.name);
                            }
                          }}
                          isHighlighted={isHighlighted}
                          highlightColor="indigo"
                          title="Click to highlight related pain points and opportunities. Hover for edit option."
                          type="step"
                        >
                          <p className="text-indigo-800 font-medium text-sm">{step.description || 'No description'}</p>
                          {step.persona && (
                            <div className="flex items-center gap-1 mt-1">
                              <div className={`${step.persona.color} w-2 h-2 rounded-full`}></div>
                              <span className="text-xs text-indigo-600">{step.persona.name}</span>
                            </div>
                          )}
                        </CardWithEdit>
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
                      >
                        <CardWithEdit
                          className="bg-red-100 rounded-lg p-2 hover:bg-red-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemClick(item, 'painpoint', index);
                          }}
                          onEdit={() => {
                            // Find stage and task for this pain point
                            const stageData = stages.find(s => s.tasks.some(t => t.id === item.taskId));
                            const taskData = stageData?.tasks.find(t => t.id === item.taskId);
                            if (stageData && taskData) {
                              openEditPanel(item, 'painpoint', stageData.id, stageData.name, taskData.id, taskData.name);
                            }
                          }}
                          isHighlighted={isHighlighted}
                          highlightColor="red"
                          title="Click to highlight related step and opportunities. Hover for edit option."
                          type="pain point"
                        >
                          <p className="text-red-800 font-medium text-sm">{item.text}</p>
                        </CardWithEdit>
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
                      >
                        <CardWithEdit
                          className="bg-green-100 rounded-lg p-2 hover:bg-green-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemClick(item, 'opportunity', index);
                          }}
                          onEdit={() => {
                            // Find stage and task for this opportunity
                            const stageData = stages.find(s => s.tasks.some(t => t.id === item.taskId));
                            const taskData = stageData?.tasks.find(t => t.id === item.taskId);
                            if (stageData && taskData) {
                              openEditPanel(item, 'opportunity', stageData.id, stageData.name, taskData.id, taskData.name);
                            }
                          }}
                          isHighlighted={isHighlighted}
                          highlightColor="green"
                          title="Click to highlight related step and pain points. Hover for edit option."
                          type="opportunity"
                        >
                          <p className="text-green-800 font-medium text-sm">{item.text}</p>
                        </CardWithEdit>
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

    {/* Comprehensive Edit Panel */}
    {editPanel.isOpen && (
      <div className="fixed inset-0 z-[60] flex">
        {/* Backdrop - only covers left side */}
        <div 
          className="flex-1 bg-black bg-opacity-50"
          onClick={closeEditPanel}
        ></div>
        
        {/* Side Panel */}
        <div className="w-1/2 max-w-2xl bg-white shadow-2xl h-full overflow-hidden flex flex-col relative z-[60]">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Edit Journey Details</h2>
                <p className="text-blue-100 mt-1">
                  {editPanel.editData?.stage?.name} → {editPanel.editData?.task?.name}
                </p>
              </div>
              <button
                onClick={closeEditPanel}
                className="text-white hover:text-gray-200 p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {editPanel.editData && (
              <>
                {/* Stage Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Stage
                  </h3>
                  <input
                    type="text"
                    defaultValue={editPanel.editData.stage.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Stage name"
                  />
                </div>

                {/* Task Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Task
                  </h3>
                  <input
                    type="text"
                    defaultValue={editPanel.editData.task.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Task name"
                  />
                  <textarea
                    defaultValue={editPanel.editData.task.description || ''}
                    className="w-full px-3 py-2 mt-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Task description"
                    rows="3"
                  />
                </div>

                {/* Step Section */}
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Step Details
                  </h3>
                  <textarea
                    defaultValue={editPanel.editData.step.description || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Step description"
                    rows="3"
                  />
                  <textarea
                    defaultValue={editPanel.editData.step.insights || ''}
                    className="w-full px-3 py-2 mt-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Customer insights for this step..."
                    rows="4"
                  />
                </div>

                {/* Pain Points Section */}
                <div className="bg-red-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      Pain Points ({editablePainPoints.length})
                    </div>
                  </h3>
                  <div className="space-y-2">
                    {editablePainPoints.length > 0 ? (
                      editablePainPoints.map((painPoint, index) => (
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
                      Opportunities ({editableOpportunities.length})
                    </div>
                  </h3>
                  <div className="space-y-2">
                    {editableOpportunities.length > 0 ? (
                      editableOpportunities.map((opportunity, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={opportunity}
                            onChange={(e) => updateOpportunity(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder={`Opportunity ${index + 1}`}
                          />
                          <button
                            onClick={() => removeOpportunity(index)}
                            className="px-3 py-2 text-green-600 hover:bg-green-100 rounded-md transition-colors"
                            title="Remove opportunity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500 italic">
                        No opportunities yet. Click the button below to add the first one.
                      </div>
                    )}
                    <button 
                      onClick={addOpportunity}
                      className="w-full py-2 px-4 border-2 border-dashed border-green-300 text-green-600 rounded-md hover:bg-green-50 transition-colors"
                    >
                      + Add Opportunity
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sticky Footer with Save/Cancel */}
          <div className="border-t bg-gray-50 p-6 space-y-4">
            {/* Delete Options */}
            <div className="flex justify-center gap-2">
              {onDeleteStep && (
                <button
                  onClick={handleDeleteStep}
                  className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 text-sm rounded-lg transition-colors flex items-center gap-2"
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
                  className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 text-sm rounded-lg transition-colors flex items-center gap-2"
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
                  className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 text-sm rounded-lg transition-colors flex items-center gap-2"
                  title="Delete this stage and all its tasks and steps"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Stage
                </button>
              )}
            </div>
            
            {/* Save/Cancel Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <button
                onClick={closeEditPanel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={saveChanges}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
  );
};

export default AggregatedPainpointView; 