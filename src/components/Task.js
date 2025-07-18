import React, { useState } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import StepCard from './StepCard';
import AddStepModal from './AddStepModal';
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
  onOpenStepDetail
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
    // Enable drag and drop in both views
    const droppableId = `task-${stageId}-${task.id}`;
    
    return (
      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <div 
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`space-y-3 min-h-24 transition-colors ${
              snapshot.isDraggingOver ? 'bg-blue-50 border-blue-200 border-2 border-dashed rounded-lg p-2' : ''
            }`}
          >
            {task.steps.map((step, index) => (
              <StepCard
                key={step.id}
                step={step}
                index={index}
                stageId={stageId}
                taskId={task.id}
                stageName={stageName}
                taskName={task.name}
                currentView={currentView}
                onUpdateStep={onUpdateStep}
                onDeleteStep={onDeleteStep}
                onOpenStepDetail={onOpenStepDetail}
                isHighlighted={highlightedStepId === step.id}
              />
            ))}
            
            {provided.placeholder}
            
            {task.steps.length === 0 && !snapshot.isDraggingOver && (
              <div className="text-center py-6 text-gray-400">
                <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 0 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-xs">No steps yet</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    );
  };

  return (
    <div className="bg-white rounded-lg p-4 border-2 border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <EditableTitle
          title={task.name}
          onSave={(newName) => onUpdateTask(stageId, task.id, { name: newName })}
          className="text-md font-semibold text-gray-700"
        />
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