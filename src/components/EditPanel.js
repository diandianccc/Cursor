import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const EditPanel = ({
  editPanel,
  editablePainPoints,
  editableOpportunities,
  editableCurrentExperiences,
  editableInsights,
  onCloseEditPanel,
  onAddPainPoint,
  onRemovePainPoint,
  onUpdatePainPoint,
  onAddOpportunity,
  onRemoveOpportunity,
  onUpdateOpportunity,
  onAddCurrentExperience,
  onRemoveCurrentExperience,
  onUpdateCurrentExperience,
  onAddInsight,
  onRemoveInsight,
  onUpdateInsight,
  onSaveEditChanges,
  onDeleteStep
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!editPanel.isOpen) return null;

  const handleDeleteStep = () => {
    const stepDescription = editPanel.editData?.step?.description || 'this step';
    if (window.confirm(`Are you sure you want to delete "${stepDescription}"?`)) {
      onDeleteStep(editPanel.stageId, editPanel.taskId, editPanel.stepId);
      onCloseEditPanel();
    }
  };

  // Handle drag and drop reordering
  const handleDragEnd = (result, listType) => {
    const { destination, source, draggableId } = result;

    // If dropped outside the list or in the same position
    if (!destination || 
        (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    // Reorder the appropriate list
    if (listType === 'currentExperiences') {
      const newList = [...editableCurrentExperiences];
      const [reorderedItem] = newList.splice(source.index, 1);
      newList.splice(destination.index, 0, reorderedItem);
      
      // Update all items to reflect new order
      newList.forEach((item, index) => {
        onUpdateCurrentExperience(index, item);
      });
    } else if (listType === 'painPoints') {
      const newList = [...editablePainPoints];
      const [reorderedItem] = newList.splice(source.index, 1);
      newList.splice(destination.index, 0, reorderedItem);
      
      // Update all items to reflect new order
      newList.forEach((item, index) => {
        onUpdatePainPoint(index, item);
      });
    } else if (listType === 'opportunities') {
      const newList = [...editableOpportunities];
      const [reorderedItem] = newList.splice(source.index, 1);
      newList.splice(destination.index, 0, reorderedItem);
      
      // Update all items to reflect new order
      newList.forEach((item, index) => {
        onUpdateOpportunity(index, item);
      });
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
            <div className="flex items-center gap-2">
              {/* Three-dot dropdown menu */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="text-white hover:text-gray-200 p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
                  title="More options"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <>
                    {/* Backdrop to close dropdown */}
                    <div 
                      className="fixed inset-0 z-10"
                      onClick={() => setDropdownOpen(false)}
                    ></div>
                    
                    {/* Dropdown Content */}
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
                      <div className="py-1">
                        {onDeleteStep && (
                          <button
                            onClick={() => {
                              setDropdownOpen(false);
                              handleDeleteStep();
                            }}
                            className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Step
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {/* Close button */}
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
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {editPanel.editData && (
            <>
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
              </div>

              {/* Current Experience Section */}
              <div className="bg-orange-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Current Experiences ({editableCurrentExperiences?.length || 0})
                  </div>
                </h3>
                <DragDropContext onDragEnd={(result) => handleDragEnd(result, 'currentExperiences')}>
                  <Droppable droppableId="currentExperiences">
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-2 ${snapshot.isDraggingOver ? 'bg-orange-100 rounded-md p-2' : ''}`}
                      >
                        {editableCurrentExperiences && editableCurrentExperiences.length > 0 ? (
                          editableCurrentExperiences.map((experience, index) => (
                            <Draggable key={`current-${index}`} draggableId={`current-${index}`} index={index}>
                              {(dragProvided, dragSnapshot) => (
                                <div
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  className={`flex gap-2 ${dragSnapshot.isDragging ? 'shadow-lg' : ''}`}
                                >
                                  <div 
                                    {...dragProvided.dragHandleProps}
                                    className="flex items-center px-2 py-2 text-orange-600 hover:text-orange-800 cursor-grab"
                                    title="Drag to reorder"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                                    </svg>
                                  </div>
                                  <input
                                    type="text"
                                    value={experience}
                                    onChange={(e) => onUpdateCurrentExperience(index, e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder={`Current experience ${index + 1}`}
                                  />
                                  <button
                                    onClick={() => onRemoveCurrentExperience(index)}
                                    className="px-3 py-2 text-orange-600 hover:bg-orange-100 rounded-md transition-colors"
                                    title="Remove current experience"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </Draggable>
                          ))
                        ) : (
                          <div className="text-center py-4 text-gray-500 italic">
                            No current experiences yet. Click the button below to add the first one.
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
                <button 
                  onClick={onAddCurrentExperience}
                  className="w-full py-2 px-4 border-2 border-dashed border-orange-300 text-orange-600 rounded-md hover:bg-orange-50 transition-colors mt-2"
                >
                  + Add Current Experience
                </button>
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
                <DragDropContext onDragEnd={(result) => handleDragEnd(result, 'painPoints')}>
                  <Droppable droppableId="painPoints">
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-2 ${snapshot.isDraggingOver ? 'bg-red-100 rounded-md p-2' : ''}`}
                      >
                        {editablePainPoints.length > 0 ? (
                          editablePainPoints.map((painPoint, index) => (
                            <Draggable key={`pain-${index}`} draggableId={`pain-${index}`} index={index}>
                              {(dragProvided, dragSnapshot) => (
                                <div
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  className={`flex gap-2 ${dragSnapshot.isDragging ? 'shadow-lg' : ''}`}
                                >
                                  <div 
                                    {...dragProvided.dragHandleProps}
                                    className="flex items-center px-2 py-2 text-red-600 hover:text-red-800 cursor-grab"
                                    title="Drag to reorder"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                                    </svg>
                                  </div>
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
                              )}
                            </Draggable>
                          ))
                        ) : (
                          <div className="text-center py-4 text-gray-500 italic">
                            No pain points yet. Click the button below to add the first one.
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
                <button 
                  onClick={onAddPainPoint}
                  className="w-full py-2 px-4 border-2 border-dashed border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors mt-2"
                >
                  + Add Pain Point
                </button>
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
                <DragDropContext onDragEnd={(result) => handleDragEnd(result, 'opportunities')}>
                  <Droppable droppableId="opportunities">
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-2 ${snapshot.isDraggingOver ? 'bg-green-100 rounded-md p-2' : ''}`}
                      >
                        {editableOpportunities.length > 0 ? (
                          editableOpportunities.map((opportunity, index) => (
                            <Draggable key={`opp-${index}`} draggableId={`opp-${index}`} index={index}>
                              {(dragProvided, dragSnapshot) => (
                                <div
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  className={`flex gap-2 ${dragSnapshot.isDragging ? 'shadow-lg' : ''}`}
                                >
                                  <div 
                                    {...dragProvided.dragHandleProps}
                                    className="flex items-center px-2 py-2 text-green-600 hover:text-green-800 cursor-grab"
                                    title="Drag to reorder"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                                    </svg>
                                  </div>
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
                              )}
                            </Draggable>
                          ))
                        ) : (
                          <div className="text-center py-4 text-gray-500 italic">
                            No opportunities yet. Click the button below to add the first one.
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
                <button 
                  onClick={onAddOpportunity}
                  className="w-full py-2 px-4 border-2 border-dashed border-green-300 text-green-600 rounded-md hover:bg-green-50 transition-colors mt-2"
                >
                  + Add Opportunity
                </button>
              </div>

              {/* Customer Insights Section */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Customer Insights ({editableInsights?.length || 0})
                  </div>
                </h3>
                <div className="space-y-2">
                  {editableInsights && editableInsights.length > 0 ? (
                    editableInsights.map((insight, index) => (
                      <div key={index} className="flex gap-2">
                        <textarea
                          value={insight}
                          onChange={(e) => onUpdateInsight(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                          placeholder={`Customer insight ${index + 1}`}
                          rows="2"
                        />
                        <button
                          onClick={() => onRemoveInsight(index)}
                          className="px-3 py-2 text-yellow-600 hover:bg-yellow-100 rounded-md transition-colors self-start"
                          title="Remove insight"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500 italic">
                      No customer insights yet. Click the button below to add the first one.
                    </div>
                  )}
                  <button 
                    onClick={onAddInsight}
                    className="w-full py-2 px-4 border-2 border-dashed border-yellow-300 text-yellow-600 rounded-md hover:bg-yellow-50 transition-colors"
                  >
                    + Add Customer Insight
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sticky Footer with Save/Cancel */}
        <div className="border-t bg-gray-50 p-6">
          {/* Save/Cancel Actions */}
          <div className="flex justify-between items-center">
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