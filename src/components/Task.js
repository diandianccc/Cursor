import React, { useState } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import StepCard from './StepCard';
import { getJobPerformersByIds, getMultiPerformerColors } from '../services/jobPerformerService';
import EditTaskModal from './EditTaskModal';
import EditableTitle from './EditableTitle';

const Task = ({ 
  task,
  stageId,
  stageName,
  currentView,
  onUpdateTask,
  onDeleteTask, 
  onAddStep, 
  onUpdateStep, 
  onDeleteStep,
  onSwitchToStepView,
  onOpenStepDetail,
  onOpenAddStepPanel,
  jobPerformers = []
}) => {
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [highlightedStepId, setHighlightedStepId] = useState(null);

  // Get assigned job performers for this task
  const assignedJobPerformers = getJobPerformersByIds(task.jobPerformerIds || []);
  const performerColors = getMultiPerformerColors(assignedJobPerformers);

  const handleDeleteTask = () => {
    const taskName = typeof task.name === 'string' ? task.name : task.name?.name || 'this task';
    if (window.confirm(`Are you sure you want to delete the "${taskName}" task? This will also delete all associated steps.`)) {
      onDeleteTask(stageId, task.id);
    }
  };

  const renderTaskContent = () => {
    // Use CSS Grid to ensure all step cards have equal height
    return (
      <div className={`grid gap-3 h-full ${task.steps.length > 0 ? 'grid-rows-[repeat(auto-fit,1fr)]' : ''}`} style={{ gridTemplateRows: task.steps.length > 0 ? `repeat(${task.steps.length}, 1fr)` : 'auto' }}>
        {task.steps.map((step, index) => (
          <StepCard
            key={step.id}
            step={step}
            index={index}
            stageId={stageId}
            taskId={task.id}
            stageName={typeof stageName === 'string' ? stageName : stageName?.name || 'Unnamed Stage'}
            taskName={typeof task.name === 'string' ? task.name : task.name?.name || 'Unnamed Task'}
            currentView={currentView}
            onUpdateStep={onUpdateStep}
            onDeleteStep={onDeleteStep}
            onOpenStepDetail={onOpenStepDetail}
            isHighlighted={highlightedStepId === step.id}
          />
        ))}
        
        {task.steps.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 0 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-xs">No steps yet</p>
          </div>
        )}
      </div>
    );
  };

  // Create style for multiple performers
  const getTaskBorderStyle = () => {
    if (performerColors.length === 0) return {};
    if (performerColors.length === 1) {
      return { borderLeftColor: performerColors[0], borderLeftWidth: '4px' };
    }
    // For multiple performers, we'll use CSS stripes via a pseudo-element
    return {};
  };

  // Generate CSS classes for multiple performer colors
  const getMultiPerformerClass = () => {
    if (performerColors.length <= 1) return '';
    return 'task-multi-performer';
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

  return (
    <div 
      className={`bg-white rounded-lg p-4 border-2 border-gray-100 shadow-sm h-full flex flex-col relative ${getMultiPerformerClass()}`}
      style={{...getTaskBorderStyle(), ...getMultiPerformerCSSVars()}}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-1">
          <EditableTitle
            title={typeof task.name === 'string' ? task.name : task.name?.name || 'Unnamed Task'}
            onSave={(newName) => onUpdateTask(stageId, task.id, { name: newName })}
            className="text-md font-semibold text-gray-700"
          />
          {/* Job Performer Indicators */}
          {assignedJobPerformers.length > 0 && (
            <div className="flex items-center gap-1">
              {assignedJobPerformers.slice(0, 3).map((performer, index) => (
                <div
                  key={performer.id}
                  className="w-3 h-3 rounded-full border border-gray-200"
                  style={{ 
                    backgroundColor: performer.hexColor || performer.color || '#6B7280',
                    zIndex: assignedJobPerformers.length - index
                  }}
                  title={performer.name}
                />
              ))}
              {assignedJobPerformers.length > 3 && (
                <span className="text-xs text-gray-500 ml-1">+{assignedJobPerformers.length - 3}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {currentView === 'step' && (
            <button
              onClick={() => onOpenAddStepPanel(stageId, task.id, stageName, typeof task.name === 'string' ? task.name : task.name?.name || 'Unnamed Task')}
              className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-md transition-colors"
              title="Add new step"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
          <button
            onClick={handleDeleteTask}
            className="text-red-400 hover:text-red-600 p-1 rounded transition-colors"
            title="Delete task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1">
        {renderTaskContent()}
      </div>

      <EditTaskModal
        isOpen={isEditTaskModalOpen}
        onClose={() => setIsEditTaskModalOpen(false)}
        task={task}
        onUpdate={(taskData) => onUpdateTask(stageId, task.id, taskData)}
        jobPerformers={jobPerformers}
      />
    </div>
  );
};

export default Task; 