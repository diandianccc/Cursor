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
  subscribeToJourneyMaps,
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
  const [showSelector, setShowSelector] = useState(false);

  // Initialize authentication and default journey map
  useEffect(() => {
    const unsubscribe = onAuthChange(async (authUser) => {
      if (authUser) {
        setUser(authUser);
        await initializeDefaultJourneyMap();
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

  // Initialize with default journey map or load existing one
  const initializeDefaultJourneyMap = async () => {
    try {
      // Check if we have a saved journey map ID
      let mapId = localStorage.getItem('currentJourneyMapId');
      let mapName = localStorage.getItem('currentJourneyMapName');
      
      if (mapId) {
        // Use existing saved journey map
        setJourneyMapId(mapId);
        setJourneyMapName(mapName || 'My Journey Map');
        setLoading(false);
        return;
      }

      // No saved journey map, check if any journey maps exist
      const unsubscribeFromMaps = subscribeToJourneyMaps((maps) => {
        unsubscribeFromMaps(); // Unsubscribe immediately after getting the data
        
        if (maps.length > 0) {
          // Use the most recent journey map
          const mostRecent = maps[0]; // Already sorted by last_modified desc
          setJourneyMapId(mostRecent.id);
          setJourneyMapName(mostRecent.name);
          
          // Save to localStorage
          localStorage.setItem('currentJourneyMapId', mostRecent.id);
          localStorage.setItem('currentJourneyMapName', mostRecent.name);
        } else {
          // No journey maps exist, create a default one
          createDefaultJourneyMap();
        }
        setLoading(false);
      });
      
    } catch (error) {
      console.error('Failed to initialize journey map:', error);
      setLoading(false);
    }
  };

  // Create the default journey map
  const createDefaultJourneyMap = async () => {
    try {
      const mapId = await createJourneyMap('My Journey Map');
      setJourneyMapId(mapId);
      setJourneyMapName('My Journey Map');
      
      // Save to localStorage
      localStorage.setItem('currentJourneyMapId', mapId);
      localStorage.setItem('currentJourneyMapName', 'My Journey Map');
    } catch (error) {
      console.error('Failed to create default journey map:', error);
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

  // Handle showing selector
  const handleShowSelector = () => {
    setShowSelector(true);
  };

  // Handle returning from selector
  const handleBackFromSelector = () => {
    setShowSelector(false);
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
        onBack={handleBackFromSelector}
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
                onClick={handleShowSelector}
                className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
                title="View all journey maps"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="text-sm">All Maps</span>
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
          journeyMapName={journeyMapName}
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