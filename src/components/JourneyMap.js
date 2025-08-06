import React, { useState } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import Stage from './Stage';
import AddStageModal from './AddStageModal';
import JobPerformerLegend from './PersonaLegend';
import AggregatedPainpointView from './AggregatedPainpointView';
import SpreadsheetImportExportModal from './SpreadsheetImportExportModal';
import ZoomPanControls from './ZoomPanControls';
import JobPerformerManager from './JobPerformerManager';
import useZoomPan from '../hooks/useZoomPan';
import { PERSONAS } from '../constants/personas';
import { getTerminology } from '../constants/mapTypes';

const JourneyMap = ({ 
  stages,
  journeyMapName,
  journeyMapType,
  currentView,
  jobPerformers,
  onAddStage, 
  onUpdateStage,
  onDeleteStage,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onAddStep, 
  onUpdateStep, 
  onDeleteStep,
  onMoveStep,
  onSwitchToStepView,
  onImportData,
  onOpenStepDetail,
  onOpenEditPanel,
  onOpenAddStepPanel,
  editPanel,
  editablePainPoints,
  editableOpportunities,
  editableCurrentExperiences,
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
  onSaveEditChanges
}) => {
  const [isAddStageModalOpen, setIsAddStageModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isJobPerformerManagerOpen, setIsJobPerformerManagerOpen] = useState(false);

  // Initialize zoom and pan functionality
  const {
    zoom,
    pan,
    isDragging,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToView,
    containerProps,
    canZoomIn,
    canZoomOut,
  } = useZoomPan();

  // Get terminology based on map type
  const terminology = getTerminology(journeyMapType);
  
  // Debug log to verify deployment
  console.log('🎯 Drag and Drop JourneyMap loaded - Build 60defe0');

  // Handle drag end for step reordering
  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a droppable area
    if (!destination) {
      return;
    }

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Parse the droppable IDs to get stage and task info
    const sourceIds = source.droppableId.split('-');
    const destIds = destination.droppableId.split('-');
    
    const sourceStageId = sourceIds[1];
    const sourceTaskId = sourceIds[2];
    const destStageId = destIds[1];
    const destTaskId = destIds[2];

    if (onMoveStep) {
      onMoveStep({
        stepId: draggableId,
        sourceStageId,
        sourceTaskId,
        sourceIndex: source.index,
        destStageId,
        destTaskId,
        destIndex: destination.index
      });
    }
  };

  return (
    <div className="bg-white rounded-lg p-2 relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-medium text-gray-800">{terminology.stages}</h2>
          <JobPerformerLegend jobPerformers={jobPerformers || []} />
        </div>
        <div className="flex items-center gap-2">
          {currentView === 'painpoint' && (
            <button
              onClick={() => setIsImportExportModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Import/Export
            </button>
          )}
          <button
            onClick={() => setIsJobPerformerManagerOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Job Performers
          </button>
          <button
            onClick={() => setIsAddStageModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add {terminology.stage}
          </button>
        </div>
      </div>

      {/* Zoomable and Pannable Content Area */}
      <div className="relative bg-white rounded-lg border border-gray-200 min-h-96" style={{ height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
        <div {...containerProps} className="bg-white" style={{ ...containerProps.style, minWidth: '100vw', minHeight: '100vh' }}>
          {currentView === 'step' ? (
            <div className="flex gap-6 p-2 min-w-max bg-white min-h-full">
              {stages.map((stage) => (
                <Stage
                  key={stage.id}
                  stage={stage}
                  journeyMapType={journeyMapType}
                  currentView={currentView}
                  onUpdateStage={onUpdateStage}
                  onDeleteStage={onDeleteStage}
                  onAddTask={onAddTask}
                  onUpdateTask={onUpdateTask}
                  onDeleteTask={onDeleteTask}
                  onAddStep={onAddStep}
                  onUpdateStep={onUpdateStep}
                  onDeleteStep={onDeleteStep}
                  onSwitchToStepView={onSwitchToStepView}
                  onOpenStepDetail={onOpenStepDetail}
                  onOpenAddStepPanel={onOpenAddStepPanel}
                />
              ))}
              
              {stages.length === 0 && (
                <div className="w-full text-center py-12 text-gray-500 bg-white min-h-full flex flex-col justify-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-lg font-medium">No {terminology.stages.toLowerCase()} yet</p>
                  <p className="text-sm">Add your first {terminology.stage.toLowerCase()} to get started</p>
                </div>
              )}
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="p-2 bg-white w-full h-full min-h-full">
                <AggregatedPainpointView 
                  stages={stages}
                  journeyMapType={journeyMapType}
                  onSwitchToStepView={onSwitchToStepView}
                  onOpenStepDetail={onOpenStepDetail}
                  onUpdateStep={onUpdateStep}
                  onDeleteStep={onDeleteStep}
                  onMoveStep={onMoveStep}
                  onUpdateStage={onUpdateStage}
                  onUpdateTask={onUpdateTask}
                  onDeleteTask={onDeleteTask}
                  onDeleteStage={onDeleteStage}
                  onOpenEditPanel={onOpenEditPanel}
                  editPanel={editPanel}
                  editablePainPoints={editablePainPoints}
                  editableOpportunities={editableOpportunities}
                  editableCurrentExperiences={editableCurrentExperiences}
                  onCloseEditPanel={onCloseEditPanel}
                  onAddPainPoint={onAddPainPoint}
                  onRemovePainPoint={onRemovePainPoint}
                  onUpdatePainPoint={onUpdatePainPoint}
                  onAddOpportunity={onAddOpportunity}
                  onRemoveOpportunity={onRemoveOpportunity}
                  onUpdateOpportunity={onUpdateOpportunity}
                  onAddCurrentExperience={onAddCurrentExperience}
                  onRemoveCurrentExperience={onRemoveCurrentExperience}
                  onUpdateCurrentExperience={onUpdateCurrentExperience}
                  onSaveEditChanges={onSaveEditChanges}
                />
              </div>
            </DragDropContext>
          )}
        </div>
      </div>

      {/* Zoom and Pan Controls */}
      <ZoomPanControls
        zoom={zoom}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        resetZoom={resetZoom}
        fitToView={fitToView}
        canZoomIn={canZoomIn}
        canZoomOut={canZoomOut}
        isDragging={isDragging}
      />

      <AddStageModal
        isOpen={isAddStageModalOpen}
        onClose={() => setIsAddStageModalOpen(false)}
        onAdd={onAddStage}
        journeyMapType={journeyMapType}
      />

      <SpreadsheetImportExportModal
        isOpen={isImportExportModalOpen}
        onClose={() => setIsImportExportModalOpen(false)}
        stages={stages}
        journeyMapName={journeyMapName}
        journeyMapType={journeyMapType}
        onImportData={onImportData}
      />

      <JobPerformerManager
        isOpen={isJobPerformerManagerOpen}
        onClose={() => setIsJobPerformerManagerOpen(false)}
      />
    </div>
  );
};

export default JourneyMap; 