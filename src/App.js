import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import JourneyMap from './components/JourneyMap';
import ViewToggle from './components/ViewToggle';
import SpreadsheetImportExport from './components/SpreadsheetImportExport';
import { PERSONAS } from './constants/personas';

function App() {
  // Load data from localStorage or use default stages
  const loadStagesFromStorage = () => {
    try {
      const savedStages = localStorage.getItem('journeyMapStages');
      if (savedStages) {
        return JSON.parse(savedStages);
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
    
    // Return default stages if no saved data
    return [
      {
        id: uuidv4(),
        name: 'Awareness',
        tasks: []
      },
      {
        id: uuidv4(),
        name: 'Consideration', 
        tasks: []
      }
    ];
  };

  const [stages, setStages] = useState(loadStagesFromStorage);
  const [currentView, setCurrentView] = useState(() => {
    try {
      return localStorage.getItem('journeyMapView') || 'step';
    } catch (error) {
      return 'step';
    }
  });

  // Save stages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('journeyMapStages', JSON.stringify(stages));
    } catch (error) {
      console.error('Error saving stages to localStorage:', error);
    }
  }, [stages]);

  // Save current view to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('journeyMapView', currentView);
    } catch (error) {
      console.error('Error saving view to localStorage:', error);
    }
  }, [currentView]);

  const addStage = (stageName) => {
    const newStage = {
      id: uuidv4(),
      name: stageName,
      tasks: []
    };
    setStages([...stages, newStage]);
  };

  const updateStage = (stageId, stageName) => {
    setStages(stages.map(stage => 
      stage.id === stageId 
        ? { ...stage, name: stageName }
        : stage
    ));
  };

  const deleteStage = (stageId) => {
    setStages(stages.filter(stage => stage.id !== stageId));
  };

  const addTask = (stageId, taskData) => {
    setStages(stages.map(stage => 
      stage.id === stageId 
        ? { ...stage, tasks: [...stage.tasks, { ...taskData, id: uuidv4(), steps: [] }] }
        : stage
    ));
  };

  const updateTask = (stageId, taskId, taskData) => {
    setStages(stages.map(stage => 
      stage.id === stageId 
        ? { 
            ...stage, 
            tasks: stage.tasks.map(task => 
              task.id === taskId ? { ...taskData, id: taskId, steps: task.steps } : task
            ) 
          }
        : stage
    ));
  };

  const deleteTask = (stageId, taskId) => {
    setStages(stages.map(stage => 
      stage.id === stageId 
        ? { ...stage, tasks: stage.tasks.filter(task => task.id !== taskId) }
        : stage
    ));
  };

  const addStep = (stageId, taskId, stepData) => {
    setStages(stages.map(stage => 
      stage.id === stageId 
        ? { 
            ...stage, 
            tasks: stage.tasks.map(task => 
              task.id === taskId 
                ? { ...task, steps: [...task.steps, { ...stepData, id: uuidv4() }] }
                : task
            ) 
          }
        : stage
    ));
  };

  const updateStep = (stageId, taskId, stepId, stepData) => {
    setStages(stages.map(stage => 
      stage.id === stageId 
        ? { 
            ...stage, 
            tasks: stage.tasks.map(task => 
              task.id === taskId 
                ? { 
                    ...task, 
                    steps: task.steps.map(step => 
                      step.id === stepId ? { ...stepData, id: stepId } : step
                    ) 
                  }
                : task
            ) 
          }
        : stage
    ));
  };

  const deleteStep = (stageId, taskId, stepId) => {
    setStages(stages.map(stage => 
      stage.id === stageId 
        ? { 
            ...stage, 
            tasks: stage.tasks.map(task => 
              task.id === taskId 
                ? { ...task, steps: task.steps.filter(step => step.id !== stepId) }
                : task
            ) 
          }
        : stage
    ));
  };

  const switchToStepView = () => {
    setCurrentView('step');
  };

  const handleImportData = (importedStages) => {
    if (window.confirm('This will replace all current data. Are you sure you want to continue?')) {
      setStages(importedStages);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-full mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Journey Map</h1>
              <p className="text-gray-600 mt-2">Create and visualize customer journey stages, tasks, and touchpoints</p>
            </div>
            <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
          </div>
        </div>
      </header>
      
      <main className="max-w-full mx-auto px-4 pt-6 pb-8">
        <SpreadsheetImportExport
          stages={stages}
          onImportData={handleImportData}
        />
        
        <JourneyMap 
          stages={stages}
          currentView={currentView}
          onAddStage={addStage}
          onUpdateStage={updateStage}
          onDeleteStage={deleteStage}
          onAddTask={addTask}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          onAddStep={addStep}
          onUpdateStep={updateStep}
          onDeleteStep={deleteStep}
          onSwitchToStepView={switchToStepView}
        />
      </main>
    </div>
  );
}

export default App; 