import React, { useState } from 'react';
import Stage from './Stage';
import AddStageModal from './AddStageModal';
import PersonaLegend from './PersonaLegend';
import AggregatedPainpointView from './AggregatedPainpointView';
import PanScrollIndicator from './PanScrollIndicator';
import { PERSONAS } from '../constants/personas';
import usePanScroll from '../hooks/usePanScroll';

const JourneyMap = ({ 
  stages,
  currentView,
  onAddStage, 
  onUpdateStage,
  onDeleteStage,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onAddStep, 
  onUpdateStep, 
  onDeleteStep,
  onSwitchToStepView
}) => {
  const [isAddStageModalOpen, setIsAddStageModalOpen] = useState(false);
  const panScroll = usePanScroll();

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <h2 className="text-xl font-semibold text-gray-800">Journey Stages</h2>
          <PersonaLegend personas={PERSONAS} />
        </div>
        <button
          onClick={() => setIsAddStageModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Stage
        </button>
      </div>

      {currentView === 'step' && (
        <PanScrollIndicator containerRef={panScroll.ref} className="mb-4" />
      )}

      {currentView === 'step' ? (
        <div 
          ref={panScroll.ref}
          className={`flex gap-6 overflow-x-auto pb-4 pan-scroll-container ${panScroll.isDragging ? 'dragging' : ''}`}
          title="Click and drag to pan horizontally"
        >
          {stages.map((stage) => (
            <Stage
              key={stage.id}
              stage={stage}
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
            />
          ))}
          
          {stages.length === 0 && (
            <div className="flex-1 text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-lg font-medium">No stages yet</p>
              <p className="text-sm">Add your first stage to get started</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
          <AggregatedPainpointView 
            stages={stages}
            onSwitchToStepView={onSwitchToStepView}
          />
        </div>
      )}

      <AddStageModal
        isOpen={isAddStageModalOpen}
        onClose={() => setIsAddStageModalOpen(false)}
        onAdd={onAddStage}
      />
    </div>
  );
};

export default JourneyMap; 