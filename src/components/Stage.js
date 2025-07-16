import React, { useState } from 'react';
import Task from './Task';
import AddTaskModal from './AddTaskModal';
import EditStageModal from './EditStageModal';

const Stage = ({ 
  stage,
  currentView,
  onUpdateStage,
  onDeleteStage,
  onAddTask,
  onUpdateTask, 
  onDeleteTask,
  onAddStep, 
  onUpdateStep, 
  onDeleteStep,
  onSwitchToStepView,
  onOpenStepDetail
}) => {
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEditStageModalOpen, setIsEditStageModalOpen] = useState(false);

  const handleDeleteStage = () => {
    if (window.confirm(`Are you sure you want to delete the "${stage.name}" stage? This will also delete all associated tasks and steps.`)) {
      onDeleteStage(stage.id);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-800">{stage.name}</h3>
          <button
            onClick={() => setIsEditStageModalOpen(true)}
            className="text-gray-400 hover:text-blue-600 p-1 rounded transition-colors"
            title="Edit stage name"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddTaskModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition-colors"
            title="Add new task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={handleDeleteStage}
            className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
            title="Delete stage"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div 
        className="flex gap-4 overflow-x-auto pb-4"
      >
        {stage.tasks.map((task) => (
          <Task
            key={task.id}
            task={task}
            stageId={stage.id}
            stageName={stage.name}
            currentView={currentView}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
            onAddStep={onAddStep}
            onUpdateStep={onUpdateStep}
            onDeleteStep={onDeleteStep}
            onSwitchToStepView={onSwitchToStepView}
            onOpenStepDetail={onOpenStepDetail}
          />
        ))}
        
        {stage.tasks.length === 0 && (
          <div className="flex-1 text-center py-8 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-sm">No tasks yet</p>
          </div>
        )}
      </div>

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onAdd={(taskData) => onAddTask(stage.id, taskData)}
      />

      <EditStageModal
        isOpen={isEditStageModalOpen}
        onClose={() => setIsEditStageModalOpen(false)}
        stage={stage}
        onUpdate={onUpdateStage}
      />
    </div>
  );
};

export default Stage; 