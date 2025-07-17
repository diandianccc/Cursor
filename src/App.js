import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import JourneyMap from './components/JourneyMap';
import JourneyMapSelector from './components/JourneyMapSelector';
import ViewToggle from './components/ViewToggle';
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
  const [journeyMapName, setJourneyMapName] = useState('');
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState(() => {
    try {
      return localStorage.getItem('journeyMapView') || 'painpoint';
    } catch (error) {
      return 'painpoint';
    }
  });
  const [showSelector, setShowSelector] = useState(true);

  // Initialize authentication
  useEffect(() => {
    const unsubscribe = onAuthChange(async (authUser) => {
      if (authUser) {
        setUser(authUser);
        setLoading(false);
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

  // Handle journey map selection
  const handleSelectJourneyMap = (mapId, mapName) => {
    setJourneyMapId(mapId);
    setJourneyMapName(mapName);
    setShowSelector(false);
    
    // Save to localStorage for direct access
    localStorage.setItem('currentJourneyMapId', mapId);
    localStorage.setItem('currentJourneyMapName', mapName);
  };

  // Handle returning to selector
  const handleBackToSelector = () => {
    setShowSelector(true);
    setJourneyMapId(null);
    setJourneyMapName('');
    setStages([]);
    
    // Clear localStorage
    localStorage.removeItem('currentJourneyMapId');
    localStorage.removeItem('currentJourneyMapName');
  };

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

  // Show journey map selector
  if (showSelector) {
    return (
      <JourneyMapSelector 
        onSelectJourneyMap={handleSelectJourneyMap}
        user={user}
      />
    );
  }

  // Show individual journey map
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-full mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToSelector}
                className="text-gray-600 hover:text-gray-900 transition-colors"
                title="Back to journey maps"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{journeyMapName}</h1>
                <p className="text-gray-600 mt-2">Create and visualize customer journey stages, tasks, and touchpoints</p>
                {user && (
                  <div className="flex items-center mt-3 text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span>Connected as {getUserDisplayName(user)} • Real-time collaboration enabled</span>
                  </div>
                )}
              </div>
            </div>
            <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
          </div>
        </div>
      </header>
      
      <main className="max-w-full mx-auto px-4 pt-6 pb-8">        
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
          onImportData={handleImportData}
        />
      </main>
    </div>
  );
}

export default App; 