import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import JourneyMap from './components/JourneyMap';
import ViewToggle from './components/ViewToggle';
import SpreadsheetImportExport from './components/SpreadsheetImportExport';
import LoadingSpinner from './components/LoadingSpinner';
import { PERSONAS } from './constants/personas';

// Supabase imports
import { 
  subscribeToJourneyMap, 
  updateJourneyMapStages, 
  createJourneyMap 
} from './firebase/journeyService';
import { 
  signInAnonymous, 
  onAuthChange, 
  getUserDisplayName 
} from './firebase/authService';

function App() {
  const [user, setUser] = useState(null);
  const [journeyMapId, setJourneyMapId] = useState(null);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState(() => {
    try {
      return localStorage.getItem('journeyMapView') || 'painpoint';
    } catch (error) {
      return 'painpoint';
    }
  });

  // Initialize authentication
  useEffect(() => {
    const unsubscribe = onAuthChange(async (authUser) => {
      if (authUser) {
        setUser(authUser);
        // Load or create default journey map
        await initializeJourneyMap();
      } else {
        // Sign in anonymously
        try {
          await signInAnonymous();
        } catch (error) {
          console.error('Failed to sign in:', error);
          setLoading(false);
        }
      }
    });

    return unsubscribe;
  }, []);

  // Initialize journey map
  const initializeJourneyMap = async () => {
    try {
      // For now, we'll use a default journey map ID
      // In the future, you could have multiple journey maps per user
      let mapId = localStorage.getItem('currentJourneyMapId');
      
      if (!mapId) {
        // Create a new journey map
        mapId = await createJourneyMap('My Journey Map');
        localStorage.setItem('currentJourneyMapId', mapId);
      }
      
      setJourneyMapId(mapId);
    } catch (error) {
      console.error('Failed to initialize journey map:', error);
      setLoading(false);
    }
  };

  // Subscribe to journey map changes
  useEffect(() => {
    if (!journeyMapId) return;

    const unsubscribe = subscribeToJourneyMap(journeyMapId, (journeyMap) => {
      if (journeyMap && journeyMap.stages) {
        setStages(journeyMap.stages);
      } else {
        // Initialize with default stages if empty
        const defaultStages = [
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
        setStages(defaultStages);
        updateJourneyMapStages(journeyMapId, defaultStages);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [journeyMapId]);

  // Save current view to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('journeyMapView', currentView);
    } catch (error) {
      console.error('Error saving view to localStorage:', error);
    }
  }, [currentView]);

  // Helper function to update stages in Firebase
  const updateStagesInFirebase = async (newStages) => {
    if (journeyMapId) {
      try {
        await updateJourneyMapStages(journeyMapId, newStages);
      } catch (error) {
        console.error('Failed to update stages:', error);
      }
    }
  };

  const addStage = async (stageName) => {
    const newStage = {
      id: uuidv4(),
      name: stageName,
      tasks: []
    };
    const newStages = [...stages, newStage];
    setStages(newStages);
    await updateStagesInFirebase(newStages);
  };

  const updateStage = async (stageId, stageName) => {
    const newStages = stages.map(stage => 
      stage.id === stageId 
        ? { ...stage, name: stageName }
        : stage
    );
    setStages(newStages);
    await updateStagesInFirebase(newStages);
  };

  const deleteStage = async (stageId) => {
    const newStages = stages.filter(stage => stage.id !== stageId);
    setStages(newStages);
    await updateStagesInFirebase(newStages);
  };

  const addTask = async (stageId, taskData) => {
    const newStages = stages.map(stage => 
      stage.id === stageId 
        ? { ...stage, tasks: [...stage.tasks, { ...taskData, id: uuidv4(), steps: [] }] }
        : stage
    );
    setStages(newStages);
    await updateStagesInFirebase(newStages);
  };

  const updateTask = async (stageId, taskId, taskData) => {
    const newStages = stages.map(stage => 
      stage.id === stageId 
        ? { 
            ...stage, 
            tasks: stage.tasks.map(task => 
              task.id === taskId ? { ...taskData, id: taskId, steps: task.steps } : task
            ) 
          }
        : stage
    );
    setStages(newStages);
    await updateStagesInFirebase(newStages);
  };

  const deleteTask = async (stageId, taskId) => {
    const newStages = stages.map(stage => 
      stage.id === stageId 
        ? { ...stage, tasks: stage.tasks.filter(task => task.id !== taskId) }
        : stage
    );
    setStages(newStages);
    await updateStagesInFirebase(newStages);
  };

  const addStep = async (stageId, taskId, stepData) => {
    const newStages = stages.map(stage => 
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
    );
    setStages(newStages);
    await updateStagesInFirebase(newStages);
  };

  const updateStep = async (stageId, taskId, stepId, stepData) => {
    const newStages = stages.map(stage => 
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
    );
    setStages(newStages);
    await updateStagesInFirebase(newStages);
  };

  const deleteStep = async (stageId, taskId, stepId) => {
    const newStages = stages.map(stage => 
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
    );
    setStages(newStages);
    await updateStagesInFirebase(newStages);
  };

  const switchToStepView = () => {
    setCurrentView('step');
  };

  const handleImportData = async (importedStages) => {
    if (window.confirm('This will replace all current data. Are you sure you want to continue?')) {
      setStages(importedStages);
      await updateStagesInFirebase(importedStages);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-full mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Journey Map</h1>
              <p className="text-gray-600 mt-2">Create and visualize customer journey stages, tasks, and touchpoints</p>
              {user && (
                <div className="flex items-center mt-3 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>Connected as {getUserDisplayName(user)} • Real-time collaboration enabled</span>
                </div>
              )}
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