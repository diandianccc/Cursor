import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import JourneyMap from './components/JourneyMap';
import JourneyMapSelector from './components/JourneyMapSelector';
import ViewToggle from './components/ViewToggle';
import LoadingSpinner from './components/LoadingSpinner';
import EditableTitle from './components/EditableTitle';
import StepDetailPanel from './components/StepDetailPanel';
import EditPanel from './components/EditPanel';
import AddStepPanel from './components/AddStepPanel';
import { initializeJobPerformers, updatePersonasArray, getAllJobPerformers } from './services/jobPerformerService';
import { subscribeToJobPerformers } from './firebase/journeyService';
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
  const [jobPerformers, setJobPerformers] = useState([]);
  const [currentView, setCurrentView] = useState(() => {
    try {
      return localStorage.getItem('journeyMapView') || 'painpoint';
    } catch (error) {
      return 'painpoint';
    }
  });
  const [showSelector, setShowSelector] = useState(false);
  
  // Side panel state management
  const [stepDetailPanel, setStepDetailPanel] = useState({
    isOpen: false,
    step: null,
    stageId: null,
    taskId: null,
    stageName: '',
    taskName: ''
  });

  // Add step panel state management
  const [addStepPanel, setAddStepPanel] = useState({
    isOpen: false,
    stageId: null,
    taskId: null,
    stageName: '',
    taskName: ''
  });

  // Edit panel state management for painpoint view
  const [editPanel, setEditPanel] = useState({
    isOpen: false,
    editData: null,
    stageId: null,
    stageName: '',
    taskId: null,
    taskName: '',
    stepId: null
  });
  const [editablePainPoints, setEditablePainPoints] = useState([]);
  const [editableOpportunities, setEditableOpportunities] = useState([]);
  const [editableCurrentExperiences, setEditableCurrentExperiences] = useState([]);
  const [editableInsights, setEditableInsights] = useState([]);

  // Side panel functions
  const openStepDetailPanel = (step, stageId, taskId, stageName, taskName, defaultTab = 'details') => {
    setStepDetailPanel({
      isOpen: true,
      step,
      stageId,
      taskId,
      stageName,
      taskName,
      defaultTab
    });
  };

  const closeStepDetailPanel = () => {
    setStepDetailPanel({
      isOpen: false,
      step: null,
      stageId: null,
      taskId: null,
      stageName: '',
      taskName: ''
    });
  };

  // Add step panel functions
  const openAddStepPanel = (stageId, taskId, stageName, taskName) => {
    setAddStepPanel({
      isOpen: true,
      stageId,
      taskId,
      stageName,
      taskName
    });
  };

  const closeAddStepPanel = () => {
    setAddStepPanel({
      isOpen: false,
      stageId: null,
      taskId: null,
      stageName: '',
      taskName: ''
    });
  };

  // Edit panel functions for painpoint view
  const openEditPanel = (item, itemType, stageId, stageName, taskId, taskName) => {
    // Find the complete step data and all related information
    const stage = stages.find(s => s.id === stageId);
    const task = stage?.tasks.find(t => t.id === taskId);
    
    // Handle different item types - step objects have 'id', while pain/opportunity objects have 'stepId'
    const stepId = item.stepId || item.id;
    const step = task?.steps.find(s => s.id === stepId);
    
    if (step && task && stage) {
      // Initialize editable arrays
      setEditablePainPoints(step.painPoints || []);
      setEditableOpportunities(step.opportunities || []);
      setEditableCurrentExperiences(step.currentExperiences || []);
      setEditableInsights(step.insights ? [step.insights] : []);
      
      setEditPanel({
        isOpen: true,
        editData: {
          stage: stage,
          task: task,
          step: step,
          allPainPoints: step.painPoints || [],
          allOpportunities: step.opportunities || []
        },
        stageId: stageId,
        stageName: stageName,
        taskId: taskId,
        taskName: taskName,
        stepId: step.id
      });
    }
  };

  const closeEditPanel = () => {
    setEditPanel({
      isOpen: false,
      editData: null,
      stageId: null,
      stageName: '',
      taskId: null,
      taskName: '',
      stepId: null
    });
    setEditablePainPoints([]);
    setEditableOpportunities([]);
    setEditableCurrentExperiences([]);
  };

  // Pain Points management functions
  const addPainPoint = () => {
    setEditablePainPoints([...editablePainPoints, '']);
  };

  const removePainPoint = (index) => {
    setEditablePainPoints(editablePainPoints.filter((_, i) => i !== index));
  };

  const updatePainPoint = (index, value) => {
    const updated = [...editablePainPoints];
    updated[index] = value;
    setEditablePainPoints(updated);
  };

  // Opportunities management functions
  const addOpportunity = () => {
    setEditableOpportunities([...editableOpportunities, '']);
  };

  const removeOpportunity = (index) => {
    setEditableOpportunities(editableOpportunities.filter((_, i) => i !== index));
  };

  const updateOpportunity = (index, value) => {
    const updated = [...editableOpportunities];
    updated[index] = value;
    setEditableOpportunities(updated);
  };

  // Current Experiences management functions
  const addCurrentExperience = () => {
    setEditableCurrentExperiences([...editableCurrentExperiences, '']);
  };

  const removeCurrentExperience = (index) => {
    setEditableCurrentExperiences(editableCurrentExperiences.filter((_, i) => i !== index));
  };

  const updateCurrentExperience = (index, value) => {
    const updated = [...editableCurrentExperiences];
    updated[index] = value;
    setEditableCurrentExperiences(updated);
  };

  // Lessons Learned management functions
  const addInsight = () => {
    setEditableInsights([...editableInsights, '']);
  };

  const removeInsight = (index) => {
    setEditableInsights(editableInsights.filter((_, i) => i !== index));
  };

  const updateInsight = (index, value) => {
    const updated = [...editableInsights];
    updated[index] = value;
    setEditableInsights(updated);
  };

  // Save function for edit panel
  const saveEditChanges = (stepDescription = '', jobPerformerIds = []) => {
    if (!editPanel.editData) return;

    // Filter out empty pain points, opportunities, current experiences, and insights
    const filteredPainPoints = editablePainPoints.filter(point => point.trim() !== '');
    const filteredOpportunities = editableOpportunities.filter(opp => opp.trim() !== '');
    const filteredCurrentExperiences = editableCurrentExperiences.filter(exp => exp.trim() !== '');
    const filteredInsights = editableInsights.filter(insight => insight.trim() !== '');

    // Create updated step data
    const stepData = {
      ...editPanel.editData.step,
      description: stepDescription,
      jobPerformerIds: jobPerformerIds, // Use new multiple job performers
      painPoints: filteredPainPoints,
      opportunities: filteredOpportunities,
      currentExperiences: filteredCurrentExperiences,
      insights: filteredInsights.length > 0 ? filteredInsights.join('\n\n') : ''
    };

    // For backward compatibility, also set personaId to the first job performer
    if (jobPerformerIds.length > 0) {
      stepData.personaId = jobPerformerIds[0];
    } else {
      stepData.personaId = null;
    }

    // Call the update function
    updateStep(editPanel.stageId, editPanel.taskId, editPanel.stepId, stepData);
    
    // Close the panel
    closeEditPanel();
  };

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
        
        // Initialize job performers
        try {
          await initializeJobPerformers();
        } catch (error) {
          console.error('Failed to initialize job performers:', error);
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

  // Subscribe to job performers changes
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToJobPerformers(async (performers) => {
      // Get the combined list (database + defaults) instead of just database performers
      const allJobPerformers = await getAllJobPerformers();
      setJobPerformers(allJobPerformers);
      // Update the personas array for legacy compatibility
      updatePersonasArray(allJobPerformers);
      
      // Force re-render of components that depend on PERSONAS
      // This ensures dropdowns and legends update immediately
      setStages(prevStages => [...prevStages]);
    });

    return unsubscribe;
  }, [user]);

  // Initialize with default journey map or load existing one
  const initializeDefaultJourneyMap = async () => {
    try {
      // Check if we have a saved journey map ID
      let mapId = localStorage.getItem('currentJourneyMapId');
      let mapName = localStorage.getItem('currentJourneyMapName');
      let mapType = localStorage.getItem('currentJourneyMapType') || MAP_TYPES.USER_JOURNEY;
      
      // If saved ID looks like a UUID, clear localStorage and start fresh
      if (mapId && (mapId.includes('-') || mapId.length > 10)) {
        console.log('🔄 App: Clearing UUID-based localStorage, migrating to integer IDs');
        localStorage.removeItem('currentJourneyMapId');
        localStorage.removeItem('currentJourneyMapName');
        localStorage.removeItem('currentJourneyMapType');
        mapId = null; // Force creation of new journey map
      }
      
      if (mapId) {
        // Use existing saved journey map (integer ID)
        const parsedMapId = parseInt(mapId, 10);
        if (!isNaN(parsedMapId)) {
          setJourneyMapId(parsedMapId);
          setJourneyMapName(mapName || 'My Journey Map');
          setJourneyMapType(mapType);
          setLoading(false);
          return;
        }
      }

      // No saved journey map, check if any journey maps exist
      const unsubscribeFromMaps = subscribeToJourneyMaps((maps) => {
        unsubscribeFromMaps(); // Unsubscribe immediately after getting the data
        
        if (maps.length > 0) {
          // Use the most recent journey map
          const mostRecent = maps[0]; // Already sorted by last_modified desc
          setJourneyMapId(mostRecent.id);
          setJourneyMapName(mostRecent.name);
          setJourneyMapType(MAP_TYPES.USER_JOURNEY); // TODO: Use mostRecent.map_type when column exists
          
          // Save to localStorage
          localStorage.setItem('currentJourneyMapId', mostRecent.id);
          localStorage.setItem('currentJourneyMapName', mostRecent.name);
          localStorage.setItem('currentJourneyMapType', MAP_TYPES.USER_JOURNEY);
        } else {
          // No journey maps exist, show the selector instead of auto-creating
          console.log('🔄 App: No journey maps found, showing selector');
          setShowSelector(true);
        }
        setLoading(false);
      });
      
    } catch (error) {
      console.error('Failed to initialize journey map:', error);
      setLoading(false);
    }
  };

  // Removed createDefaultJourneyMap - now showing selector instead of auto-creating

  // Subscribe to journey map changes
  useEffect(() => {
    if (!journeyMapId) return;

    const unsubscribe = subscribeToJourneyMap(journeyMapId, (journeyMap) => {
      if (journeyMap && journeyMap.stages) {
        setStages(journeyMap.stages);
        setJourneyMapType(MAP_TYPES.USER_JOURNEY); // TODO: Use journeyMap.map_type when column exists
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
    if (!journeyMapId) {
      console.error('No journey map ID available for saving!');
      alert('⚠️ Cannot save: No journey map selected');
      return;
    }
    
    try {
      console.log('🔄 App: Saving stages to journey map:', journeyMapId);
      console.log('🔄 App: Change details:', changeDetails);
      console.log('🔄 App: Stages data being saved:', JSON.stringify(newStages, null, 2));
      
      await updateJourneyMapStages(journeyMapId, newStages, changeDetails);
      console.log('✅ App: Stages saved successfully!');
    } catch (error) {
      console.error('❌ App: Failed to update stages:', error);
      console.error('❌ App: Error details:', JSON.stringify(error, null, 2));
      
      // Better error message handling
      let errorMessage = 'Unknown error occurred';
      if (error && typeof error === 'object') {
        if (error.message) {
          errorMessage = error.message;
        } else if (error.error_description) {
          errorMessage = error.error_description;
        } else if (error.details) {
          errorMessage = error.details;
        } else if (error.hint) {
          errorMessage = error.hint;
        } else {
          errorMessage = JSON.stringify(error, null, 2);
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Check for specific error types
      if (errorMessage.includes('invalid input syntax for type integer')) {
        errorMessage = 'Data type validation error: One of the fields contains invalid data format. Please check your input values.';
      }
      
      alert(`Failed to save changes: ${errorMessage}\n\nCheck the console for full details.`);
      throw error; // Re-throw so calling functions know it failed
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
    try {
      console.log('🔧 App: Adding step with data:', stepData);
      console.log('🔧 App: Stage ID:', stageId, 'Task ID:', taskId);
      
      const terminology = getTerminology(journeyMapType);
      const newStepId = uuidv4();
      
      // Ensure step data has proper structure
      const newStep = { 
        id: newStepId,
        description: stepData.description || '',
        personaId: stepData.personaId || null,
        painPoints: Array.isArray(stepData.painPoints) ? stepData.painPoints : [],
        opportunities: Array.isArray(stepData.opportunities) ? stepData.opportunities : [],
        currentExperiences: Array.isArray(stepData.currentExperiences) ? stepData.currentExperiences : [],
        insights: stepData.insights || ''
      };
      
      console.log('🔧 App: Created new step:', newStep);
      
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
      
      console.log('🔧 App: New stages structure:', newStages);
      
      setStages(newStages);
      
      // Track the change
      await trackStepChange(journeyMapId, 'added', newStep, `Added ${terminology.step.toLowerCase()}: "${stepData.description || 'New step'}"`);
      await updateStagesInFirebase(newStages, `Added ${terminology.step.toLowerCase()}: "${stepData.description || 'New step'}"`);
      
      console.log('✅ App: Step added successfully');
    } catch (error) {
      console.error('❌ App: Error adding step:', error);
      alert('Failed to add step. Please check the console for details.');
      throw error;
    }
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

  const moveStep = async ({ stepId, sourceStageId, sourceTaskId, sourceIndex, destStageId, destTaskId, destIndex }) => {
    const terminology = getTerminology(journeyMapType);
    
    // Find the step being moved
    const sourceStage = stages.find(s => s.id === sourceStageId);
    const sourceTask = sourceStage?.tasks.find(t => t.id === sourceTaskId);
    const stepToMove = sourceTask?.steps.find(s => s.id === stepId);
    
    if (!stepToMove) return;

    // Create new stages array with the step moved
    const newStages = stages.map(stage => {
      if (stage.id === sourceStageId) {
        return {
          ...stage,
          tasks: stage.tasks.map(task => {
            if (task.id === sourceTaskId) {
              // Remove step from source task
              return {
                ...task,
                steps: task.steps.filter(step => step.id !== stepId)
              };
            }
            return task;
          })
        };
      }
      return stage;
    }).map(stage => {
      if (stage.id === destStageId) {
        return {
          ...stage,
          tasks: stage.tasks.map(task => {
            if (task.id === destTaskId) {
              // Add step to destination task at the specified index
              const newSteps = [...task.steps];
              newSteps.splice(destIndex, 0, stepToMove);
              return {
                ...task,
                steps: newSteps
              };
            }
            return task;
          })
        };
      }
      return stage;
    });

    setStages(newStages);
    
    // Track the change
    const sourceTaskName = sourceTask?.name || 'Unknown Task';
    const destStage = stages.find(s => s.id === destStageId);
    const destTask = destStage?.tasks.find(t => t.id === destTaskId);
    const destTaskName = destTask?.name || 'Unknown Task';
    
    const changeMessage = sourceStageId === destStageId && sourceTaskId === destTaskId
      ? `Reordered ${terminology.step.toLowerCase()}: "${stepToMove.description || 'Step'}" within ${sourceTaskName}`
      : `Moved ${terminology.step.toLowerCase()}: "${stepToMove.description || 'Step'}" from ${sourceTaskName} to ${destTaskName}`;
    
    await trackStepChange(journeyMapId, 'moved', stepToMove, changeMessage);
    await updateStagesInFirebase(newStages, changeMessage);
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
        <div className="max-w-full mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleShowSelector}
                className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
                title="Back to all journey maps"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm">Back</span>
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <EditableTitle
                    title={journeyMapName}
                    onSave={handleNameChange}
                    className="text-xl font-bold text-gray-900"
                  />
                </div>
                {user && (
                  <div className="flex items-center mt-1 text-xs text-green-600">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
                    <span>Connected as {getUserDisplayName(user)} • Real-time collaboration enabled</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://cool-pasca-9f2869.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 text-sm"
                title="View Enhanced Writer Workflow Demo"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                ✍️ Writer Workflow
              </a>
              <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-full mx-auto px-4 pt-2 pb-4">        
        <JourneyMap 
          stages={stages}
          journeyMapName={journeyMapName}
          journeyMapType={journeyMapType}
          currentView={currentView}
          jobPerformers={jobPerformers}
          onAddStage={addStage}
          onUpdateStage={updateStage}
          onDeleteStage={deleteStage}
          onAddTask={addTask}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          onAddStep={addStep}
          onUpdateStep={updateStep}
          onDeleteStep={deleteStep}
          onMoveStep={moveStep}
          onSwitchToStepView={switchToStepView}
          onImportData={handleImportData}
          onOpenStepDetail={openStepDetailPanel}
          onOpenEditPanel={openEditPanel}
          onOpenAddStepPanel={openAddStepPanel}
          editPanel={editPanel}
          editablePainPoints={editablePainPoints}
          editableOpportunities={editableOpportunities}
          editableCurrentExperiences={editableCurrentExperiences}
          onCloseEditPanel={closeEditPanel}
          onAddPainPoint={addPainPoint}
          onRemovePainPoint={removePainPoint}
          onUpdatePainPoint={updatePainPoint}
          onAddOpportunity={addOpportunity}
          onRemoveOpportunity={removeOpportunity}
          onUpdateOpportunity={updateOpportunity}
          onAddCurrentExperience={addCurrentExperience}
          onRemoveCurrentExperience={removeCurrentExperience}
          onUpdateCurrentExperience={updateCurrentExperience}
          onSaveEditChanges={saveEditChanges}
        />
      </main>
      
      {/* Side panels at top level to ensure overlay positioning */}
      <StepDetailPanel
        isOpen={stepDetailPanel.isOpen}
        onClose={closeStepDetailPanel}
        step={stepDetailPanel.step}
        onSave={updateStep}
        stageId={stepDetailPanel.stageId}
        taskId={stepDetailPanel.taskId}
        stageName={stepDetailPanel.stageName}
        taskName={stepDetailPanel.taskName}
        journeyMapType={journeyMapType}
        jobPerformers={jobPerformers}
        onDeleteStep={deleteStep}
        onDeleteTask={deleteTask}
        onDeleteStage={deleteStage}
        defaultTab={stepDetailPanel.defaultTab}
      />
      
      <EditPanel
        editPanel={editPanel}
        editablePainPoints={editablePainPoints}
        editableOpportunities={editableOpportunities}
        editableCurrentExperiences={editableCurrentExperiences}
        editableInsights={editableInsights}
        jobPerformers={jobPerformers}
        onCloseEditPanel={closeEditPanel}
        onAddPainPoint={addPainPoint}
        onRemovePainPoint={removePainPoint}
        onUpdatePainPoint={updatePainPoint}
        onAddOpportunity={addOpportunity}
        onRemoveOpportunity={removeOpportunity}
        onUpdateOpportunity={updateOpportunity}
        onAddCurrentExperience={addCurrentExperience}
        onRemoveCurrentExperience={removeCurrentExperience}
        onUpdateCurrentExperience={updateCurrentExperience}
        onAddInsight={addInsight}
        onRemoveInsight={removeInsight}
        onUpdateInsight={updateInsight}
        onSaveEditChanges={saveEditChanges}
        onDeleteStep={deleteStep}
        onDeleteTask={deleteTask}
        onDeleteStage={deleteStage}
      />
      
      <AddStepPanel
        isOpen={addStepPanel.isOpen}
        onClose={closeAddStepPanel}
        onAdd={(stepData) => addStep(addStepPanel.stageId, addStepPanel.taskId, stepData)}
        stageId={addStepPanel.stageId}
        taskId={addStepPanel.taskId}
        stageName={addStepPanel.stageName}
        taskName={addStepPanel.taskName}
        jobPerformers={jobPerformers}
      />
    </div>
  );
}

export default App; 