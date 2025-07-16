import React, { useState } from 'react';
import StepCard from './StepCard';
import AddStepModal from './AddStepModal';
import EditTaskModal from './EditTaskModal';

const Task = ({ 
  task,
  stageId,
  currentView,
  onUpdateTask,
  onDeleteTask, 
  onAddStep, 
  onUpdateStep, 
  onDeleteStep,
  onSwitchToStepView
}) => {
  const [isAddStepModalOpen, setIsAddStepModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [highlightedStepId, setHighlightedStepId] = useState(null);

  const handleDeleteTask = () => {
    if (window.confirm(`Are you sure you want to delete the "${task.name}" task? This will also delete all associated steps.`)) {
      onDeleteTask(stageId, task.id);
    }
  };



  const renderTaskContent = () => {
    // Show steps in both views, but without personas in painpoint view
    return (
      <div className="space-y-3">
        {task.steps.map((step) => (
          <StepCard
            key={step.id}
            step={step}
            stageId={stageId}
            taskId={task.id}
            currentView={currentView}
            onUpdateStep={onUpdateStep}
            onDeleteStep={onDeleteStep}
            isHighlighted={highlightedStepId === step.id}
          />
        ))}
        
        {task.steps.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-xs">No steps yet</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg p-4 border-2 border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h4 className="text-md font-semibold text-gray-700">{task.name}</h4>
          <button
            onClick={() => setIsEditTaskModalOpen(true)}
            className="text-gray-400 hover:text-blue-600 p-1 rounded transition-colors"
            title="Edit task name"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2">
          {currentView === 'step' && (
            <button
              onClick={() => setIsAddStepModalOpen(true)}
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

      {renderTaskContent()}

      <AddStepModal
        isOpen={isAddStepModalOpen}
        onClose={() => setIsAddStepModalOpen(false)}
        onAdd={(stepData) => onAddStep(stageId, task.id, stepData)}
      />

      <EditTaskModal
        isOpen={isEditTaskModalOpen}
        onClose={() => setIsEditTaskModalOpen(false)}
        task={task}
        onUpdate={(taskData) => onUpdateTask(stageId, task.id, taskData)}
      />
    </div>
  );
};

export default Task; 