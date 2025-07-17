import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import JourneyMap from './components/JourneyMap';
import JourneyMapSelector from './components/JourneyMapSelector';
import ViewToggle from './components/ViewToggle';
import LoadingSpinner from './components/LoadingSpinner';
import EditableTitle from './components/EditableTitle';
import { PERSONAS } from './constants/personas';
import { getTerminology, MAP_TYPES } from './constants/mapTypes';

// Supabase imports
import { 
  subscribeToJourneyMap, 
  subscribeToJourneyMaps,
  updateJourneyMapStages, 
  updateJourneyMapName,
  createJourneyMap,
  resetAllData,
  trackStageChange,
  trackTaskChange,
  trackStepChange
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
  const [journeyMapType, setJourneyMapType] = useState(MAP_TYPES.USER_JOURNEY);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasReset, setHasReset] = useState(false);
  const [currentView, setCurrentView] = useState(() => {
    try {
      return localStorage.getItem('journeyMapView') || 'painpoint';
    } catch (error) {
      return 'painpoint';
    }
  });
  const [showSelector, setShowSelector] = useState(false);

  // Initialize authentication and handle reset
  useEffect(() => {
    const unsubscribe = onAuthChange(async (authUser) => {
      if (authUser) {
        setUser(authUser);
        
        // Check if we need to reset (first time setup)
        const hasResetBefore = localStorage.getItem('hasResetData');
        if (!hasResetBefore) {
          try {
            await resetAllData();
            localStorage.setItem('hasResetData', 'true');
            setHasReset(true);
          } catch (error) {
            console.error('Failed to reset data:', error);
          }
        }
        
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
      let mapType = localStorage.getItem('currentJourneyMapType') || MAP_TYPES.USER_JOURNEY;
      
      if (mapId) {
        // Use existing saved journey map
        setJourneyMapId(mapId);
        setJourneyMapName(mapName || 'My Journey Map');
        setJourneyMapType(mapType);
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
          setJourneyMapType(mostRecent.map_type || MAP_TYPES.USER_JOURNEY);
          
          // Save to localStorage
          localStorage.setItem('currentJourneyMapId', mostRecent.id);
          localStorage.setItem('currentJourneyMapName', mostRecent.name);
          localStorage.setItem('currentJourneyMapType', mostRecent.map_type || MAP_TYPES.USER_JOURNEY);
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
      const mapId = await createJourneyMap('My Journey Map', MAP_TYPES.USER_JOURNEY);
      setJourneyMapId(mapId);
      setJourneyMapName('My Journey Map');
      setJourneyMapType(MAP_TYPES.USER_JOURNEY);
      
      // Save to localStorage
      localStorage.setItem('currentJourneyMapId', mapId);
      localStorage.setItem('currentJourneyMapName', 'My Journey Map');
      localStorage.setItem('currentJourneyMapType', MAP_TYPES.USER_JOURNEY);
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
        setJourneyMapType(journeyMap.map_type || MAP_TYPES.USER_JOURNEY);
      } else {
        // Initialize with default stages if empty
        const terminology = getTerminology(journeyMapType);
        const defaultStages = [
          {
            id: uuidv4(),
            name: `${terminology.stage} 1`,
            tasks: []
          },
          {
            id: uuidv4(),
            name: `${terminology.stage} 2`, 
            tasks: []
          }
        ];
        setStages(defaultStages);
        updateJourneyMapStages(journeyMapId, defaultStages, 'Created default stages');
      }
    });

    return unsubscribe;
  }, [journeyMapId, journeyMapType]);

  // Save current view to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('journeyMapView', currentView);
    } catch (error) {
      console.error('Error saving view to localStorage:', error);
    }
  }, [currentView]);

  // Handle journey map selection
  const handleSelectJourneyMap = (mapId, mapName, mapType) => {
    setJourneyMapId(mapId);
    setJourneyMapName(mapName);
    setJourneyMapType(mapType || MAP_TYPES.USER_JOURNEY);
    setShowSelector(false);
    
    // Save to localStorage for direct access
    localStorage.setItem('currentJourneyMapId', mapId);
    localStorage.setItem('currentJourneyMapName', mapName);
    localStorage.setItem('currentJourneyMapType', mapType || MAP_TYPES.USER_JOURNEY);
  };

  // Handle showing selector
  const handleShowSelector = () => {
    setShowSelector(true);
  };

  // Handle returning from selector
  const handleBackFromSelector = () => {
    setShowSelector(false);
  };

  // Handle journey map name change
  const handleNameChange = async (newName) => {
    try {
      await updateJourneyMapName(journeyMapId, newName);
      setJourneyMapName(newName);
      localStorage.setItem('currentJourneyMapName', newName);
    } catch (error) {
      console.error('Failed to update journey map name:', error);
      throw error;
    }
  };

  // Helper function to update stages in Firebase with detailed tracking
  const updateStagesInFirebase = async (newStages, changeDetails) => {
    if (journeyMapId) {
      try {
        await updateJourneyMapStages(journeyMapId, newStages, changeDetails);
      } catch (error) {
        console.error('Failed to update stages:', error);
      }
    }
  };

  const addStage = async (stageName) => {
    const terminology = getTerminology(journeyMapType);
    const newStage = {
      id: uuidv4(),
      name: stageName,
      tasks: []
    };
    const newStages = [...stages, newStage];
    setStages(newStages);
    
    // Track the change
    await trackStageChange(journeyMapId, 'added', newStage, `Added ${terminology.stage.toLowerCase()}: "${stageName}"`);
    await updateStagesInFirebase(newStages, `Added ${terminology.stage.toLowerCase()}: "${stageName}"`);
  };

  const updateStage = async (stageId, stageName) => {
    const terminology = getTerminology(journeyMapType);
    const oldStage = stages.find(s => s.id === stageId);
    const newStages = stages.map(stage => 
      stage.id === stageId 
        ? { ...stage, name: stageName }
        : stage
    );
    setStages(newStages);
    
    // Track the change
    await trackStageChange(journeyMapId, 'updated', { id: stageId, name: stageName }, `Updated ${terminology.stage.toLowerCase()}: "${oldStage?.name}" → "${stageName}"`);
    await updateStagesInFirebase(newStages, `Updated ${terminology.stage.toLowerCase()}: "${oldStage?.name}" → "${stageName}"`);
  };

  const deleteStage = async (stageId) => {
    const terminology = getTerminology(journeyMapType);
    const deletedStage = stages.find(s => s.id === stageId);
    const newStages = stages.filter(stage => stage.id !== stageId);
    setStages(newStages);
    
    // Track the change
    await trackStageChange(journeyMapId, 'deleted', deletedStage, `Deleted ${terminology.stage.toLowerCase()}: "${deletedStage?.name}"`);
    await updateStagesInFirebase(newStages, `Deleted ${terminology.stage.toLowerCase()}: "${deletedStage?.name}"`);
  };

  const addTask = async (stageId, taskData) => {
    const terminology = getTerminology(journeyMapType);
    const newTask = { ...taskData, id: uuidv4(), steps: [] };
    const newStages = stages.map(stage => 
      stage.id === stageId 
        ? { ...stage, tasks: [...stage.tasks, newTask] }
        : stage
    );
    setStages(newStages);
    
    // Track the change
    await trackTaskChange(journeyMapId, 'added', newTask, `Added ${terminology.task.toLowerCase()}: "${taskData.name}"`);
    await updateStagesInFirebase(newStages, `Added ${terminology.task.toLowerCase()}: "${taskData.name}"`);
  };

  const updateTask = async (stageId, taskId, taskData) => {
    const terminology = getTerminology(journeyMapType);
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
    
    // Track the change
    await trackTaskChange(journeyMapId, 'updated', { ...taskData, id: taskId }, `Updated ${terminology.task.toLowerCase()}: "${taskData.name}"`);
    await updateStagesInFirebase(newStages, `Updated ${terminology.task.toLowerCase()}: "${taskData.name}"`);
  };

  const deleteTask = async (stageId, taskId) => {
    const terminology = getTerminology(journeyMapType);
    const stage = stages.find(s => s.id === stageId);
    const deletedTask = stage?.tasks.find(t => t.id === taskId);
    const newStages = stages.map(stage => 
      stage.id === stageId 
        ? { ...stage, tasks: stage.tasks.filter(task => task.id !== taskId) }
        : stage
    );
    setStages(newStages);
    
    // Track the change
    await trackTaskChange(journeyMapId, 'deleted', deletedTask, `Deleted ${terminology.task.toLowerCase()}: "${deletedTask?.name}"`);
    await updateStagesInFirebase(newStages, `Deleted ${terminology.task.toLowerCase()}: "${deletedTask?.name}"`);
  };

  const addStep = async (stageId, taskId, stepData) => {
    const terminology = getTerminology(journeyMapType);
    const newStep = { ...stepData, id: uuidv4() };
    const newStages = stages.map(stage => 
      stage.id === stageId 
        ? { 
            ...stage, 
            tasks: stage.tasks.map(task => 
              task.id === taskId 
                ? { ...task, steps: [...task.steps, newStep] }
                : task
            ) 
          }
        : stage
    );
    setStages(newStages);
    
    // Track the change
    await trackStepChange(journeyMapId, 'added', newStep, `Added ${terminology.step.toLowerCase()}: "${stepData.description || 'New step'}"`);
    await updateStagesInFirebase(newStages, `Added ${terminology.step.toLowerCase()}: "${stepData.description || 'New step'}"`);
  };

  const updateStep = async (stageId, taskId, stepId, stepData) => {
    const terminology = getTerminology(journeyMapType);
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
    
    // Track the change
    await trackStepChange(journeyMapId, 'updated', { ...stepData, id: stepId }, `Updated ${terminology.step.toLowerCase()}: "${stepData.description || 'Step'}"`);
    await updateStagesInFirebase(newStages, `Updated ${terminology.step.toLowerCase()}: "${stepData.description || 'Step'}"`);
  };

  const deleteStep = async (stageId, taskId, stepId) => {
    const terminology = getTerminology(journeyMapType);
    const stage = stages.find(s => s.id === stageId);
    const task = stage?.tasks.find(t => t.id === taskId);
    const deletedStep = task?.steps.find(s => s.id === stepId);
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
    
    // Track the change
    await trackStepChange(journeyMapId, 'deleted', deletedStep, `Deleted ${terminology.step.toLowerCase()}: "${deletedStep?.description || 'Step'}"`);
    await updateStagesInFirebase(newStages, `Deleted ${terminology.step.toLowerCase()}: "${deletedStep?.description || 'Step'}"`);
  };

  const switchToStepView = () => {
    setCurrentView('step');
  };

  const handleImportData = async (importedStages) => {
    if (window.confirm('This will replace all current data. Are you sure you want to continue?')) {
      setStages(importedStages);
      await updateStagesInFirebase(importedStages, 'Data imported from file');
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

  // Get current terminology
  const terminology = getTerminology(journeyMapType);

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
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{terminology.icon}</span>
                  <EditableTitle
                    title={journeyMapName}
                    onSave={handleNameChange}
                    className="text-3xl font-bold text-gray-900"
                  />
                </div>
                <p className="text-gray-600 mt-2">{terminology.description}</p>
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
          journeyMapType={journeyMapType}
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