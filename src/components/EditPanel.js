import React from 'react';

const EditPanel = ({
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
  onSaveEditChanges,
  onDeleteStep,
  onDeleteTask,
  onDeleteStage
}) => {
  console.log('EditPanel render - isOpen:', editPanel.isOpen, 'editPanel:', editPanel);
  
  if (!editPanel.isOpen) {
    console.log('EditPanel not rendering - isOpen is false');
    return null;
  }

  console.log('EditPanel rendering - panel is open!');

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

  return (
    <div className="fixed inset-0 z-[9999] flex">
      {/* Backdrop - only covers left side */}
      <div 
        className="flex-1 bg-black bg-opacity-50"
        onClick={onCloseEditPanel}
      ></div>
      
      {/* Side Panel */}
      <div className="w-1/2 max-w-2xl bg-white shadow-2xl h-full overflow-hidden flex flex-col relative z-[9999]">
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
              onClick={onCloseEditPanel}
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
                          onChange={(e) => onUpdatePainPoint(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder={`Pain point ${index + 1}`}
                        />
                        <button
                          onClick={() => onRemovePainPoint(index)}
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
                    onClick={onAddPainPoint}
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
                          onChange={(e) => onUpdateOpportunity(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder={`Opportunity ${index + 1}`}
                        />
                        <button
                          onClick={() => onRemoveOpportunity(index)}
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
                    onClick={onAddOpportunity}
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
              onClick={onCloseEditPanel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={onSaveEditChanges}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPanel; 