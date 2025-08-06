import { supabase } from './config';
import { getAnonymousUser } from './authService';

// Table names
const TABLE_NAME = 'journey_maps';
const VERSION_HISTORY_TABLE = 'journey_map_versions';
const JOB_PERFORMERS_TABLE = 'job_performers';

// Create version history entry
const createVersionHistory = async (journeyMapId, changeType, changeDetails, previousData = null, newData = null) => {
  try {
    console.log('🔄 journeyService: Creating version history');
    console.log('🔄 journeyService: journeyMapId for version:', journeyMapId, 'type:', typeof journeyMapId);
    
    // Ensure journeyMapId is proper type for database
    const sanitizedJourneyMapId = parseInt(journeyMapId, 10);
    if (isNaN(sanitizedJourneyMapId)) {
      console.warn('⚠️ journeyService: Invalid journeyMapId for version history, skipping:', journeyMapId);
      return; // Skip version history if ID is invalid
    }
    
    const versionEntry = {
      journey_map_id: sanitizedJourneyMapId, // Ensure it's an integer
      change_type: changeType,
      change_details: changeDetails,
      previous_data: previousData,
      new_data: newData,
      timestamp: new Date().toISOString()
    };

    console.log('🔄 journeyService: Version entry:', JSON.stringify(versionEntry, null, 2));

    const { error } = await supabase
      .from(VERSION_HISTORY_TABLE)
      .insert([versionEntry]);

    if (error) {
      console.error('❌ journeyService: Error creating version history:', error);
      console.error('❌ journeyService: Version history error details:', JSON.stringify(error, null, 2));
      // Don't throw error for version history - it's not critical for main functionality
    } else {
      console.log('✅ journeyService: Version history created successfully');
    }
  } catch (error) {
    console.error('❌ journeyService: Exception in createVersionHistory:', error);
    console.error('❌ journeyService: Exception details:', JSON.stringify(error, null, 2));
    // Don't throw error for version history - it's not critical for main functionality
  }
};

// Get version history for a journey map
export const getVersionHistory = async (journeyMapId) => {
  try {
    const { data, error } = await supabase
      .from(VERSION_HISTORY_TABLE)
      .select('*')
      .eq('journey_map_id', journeyMapId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching version history:', error);
    throw error;
  }
};

// Subscribe to journey maps with real-time listener
export const subscribeToJourneyMaps = (callback) => {
  // Get initial data
  const fetchData = async () => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('last_modified', { ascending: false });
    
    if (error) {
      console.error('Error fetching journey maps:', error);
      return;
    }
    
    callback(data || []);
  };

  fetchData();

  // Set up real-time subscription
  const subscription = supabase
    .channel('journey_maps_changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: TABLE_NAME 
      }, 
      () => {
        fetchData(); // Refetch data when changes occur
      }
    )
    .subscribe();

  // Return cleanup function
  return () => {
    subscription.unsubscribe();
  };
};

// Create a new journey map
export const createJourneyMap = async (name = 'My Journey Map', mapType = 'user_journey') => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([
        {
          name,
          // map_type: mapType, // TODO: Add this column to Supabase table
          stages: [],
          last_modified: new Date().toISOString(),
          created: new Date().toISOString()
        }
      ])
      .select();

    if (error) throw error;
    
    const journeyMapId = data[0].id;
    
    // Create version history entry
    await createVersionHistory(
      journeyMapId, 
      'map_created', 
      `Journey map "${name}" of type "${mapType}" created`
    );
    
    return journeyMapId;
  } catch (error) {
    console.error('Error creating journey map:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    // Create a more informative error
    const enhancedError = new Error(
      error.message || 
      error.error_description || 
      `Database error while creating journey map: ${JSON.stringify(error)}`
    );
    enhancedError.originalError = error;
    throw enhancedError;
  }
};

// Update journey map stages with version tracking
export const updateJourneyMapStages = async (journeyMapId, stages, changeDetails = 'Stages updated') => {
  try {
    console.log('🔄 journeyService: updateJourneyMapStages called');
    console.log('🔄 journeyService: journeyMapId:', journeyMapId, 'type:', typeof journeyMapId);
    console.log('🔄 journeyService: stages:', JSON.stringify(stages, null, 2));
    
    // Validate journeyMapId
    if (!journeyMapId || (typeof journeyMapId !== 'string' && typeof journeyMapId !== 'number')) {
      throw new Error(`Invalid journeyMapId: ${journeyMapId} (type: ${typeof journeyMapId})`);
    }
    
    // Sanitize stages data to ensure proper types
    const sanitizedStages = stages.map(stage => ({
      ...stage,
      id: String(stage.id), // Ensure ID is string
      tasks: stage.tasks.map(task => ({
        ...task,
        id: String(task.id), // Ensure ID is string
        steps: task.steps.map(step => ({
          ...step,
          id: String(step.id), // Ensure ID is string
          personaId: step.personaId ? String(step.personaId) : null,
          painPoints: Array.isArray(step.painPoints) ? step.painPoints : [],
          opportunities: Array.isArray(step.opportunities) ? step.opportunities : [],
          currentExperiences: Array.isArray(step.currentExperiences) ? step.currentExperiences : [],
          insights: step.insights || ''
        }))
      }))
    }));
    
    console.log('🔄 journeyService: sanitizedStages:', JSON.stringify(sanitizedStages, null, 2));
    
    // Get current data for version history
    const currentData = await getJourneyMap(journeyMapId);
    
    const { error } = await supabase
      .from(TABLE_NAME)
      .update({
        stages: sanitizedStages,
        last_modified: new Date().toISOString()
      })
      .eq('id', journeyMapId);

    if (error) {
      console.error('❌ journeyService: Supabase error:', error);
      throw error;
    }
    
    console.log('✅ journeyService: Stages updated successfully');
    
    // Create version history entry
    await createVersionHistory(
      journeyMapId, 
      'stages_updated', 
      changeDetails,
      currentData?.stages,
      sanitizedStages
    );
  } catch (error) {
    console.error('❌ journeyService: Error updating journey map:', error);
    console.error('❌ journeyService: Error details:', JSON.stringify(error, null, 2));
    
    // Create a more informative error
    const enhancedError = new Error(
      error.message || 
      error.error_description || 
      error.hint ||
      `Database error: ${JSON.stringify(error)}`
    );
    enhancedError.originalError = error;
    throw enhancedError;
  }
};

// Update journey map name with version tracking
export const updateJourneyMapName = async (journeyMapId, newName) => {
  try {
    // Get current data for version history
    const currentData = await getJourneyMap(journeyMapId);
    const oldName = currentData?.name;
    
    const { error } = await supabase
      .from(TABLE_NAME)
      .update({
        name: newName,
        last_modified: new Date().toISOString()
      })
      .eq('id', journeyMapId);

    if (error) throw error;
    
    // Create version history entry
    await createVersionHistory(
      journeyMapId, 
      'name_updated', 
      `Journey map name changed from "${oldName}" to "${newName}"`,
      oldName,
      newName
    );
  } catch (error) {
    console.error('Error updating journey map name:', error);
    throw error;
  }
};

// Delete a journey map
export const deleteJourneyMap = async (journeyMapId) => {
  try {
    // Get current data for version history
    const currentData = await getJourneyMap(journeyMapId);
    
    // Create version history entry before deletion
    await createVersionHistory(
      journeyMapId, 
      'map_deleted', 
      `Journey map "${currentData?.name}" deleted`,
      currentData
    );
    
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', journeyMapId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting journey map:', error);
    throw error;
  }
};

// Get a specific journey map
export const getJourneyMap = async (journeyMapId) => {
  try {
    console.log('🔄 journeyService: getJourneyMap called with:', journeyMapId, 'type:', typeof journeyMapId);
    
    // Try to parse as integer first (for numeric IDs)
    const parsedId = parseInt(journeyMapId, 10);
    let queryId = journeyMapId;
    
    // If it's a valid integer, use it as integer
    if (!isNaN(parsedId) && parsedId.toString() === journeyMapId.toString()) {
      queryId = parsedId;
      console.log('🔄 journeyService: Using integer ID:', queryId);
    } else {
      // It's a UUID string, use it directly
      console.log('🔄 journeyService: Using UUID string directly:', queryId);
      queryId = journeyMapId; // Use the original UUID string
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', queryId)
      .single();

    if (error) {
      console.error('❌ journeyService: Database error:', error);
      throw error;
    }
    
    console.log('✅ journeyService: Retrieved journey map:', data);
    return data;
  } catch (error) {
    console.error('Error getting journey map:', error);
    throw error;
  }
};

// Subscribe to a specific journey map
export const subscribeToJourneyMap = (journeyMapId, callback) => {
  // Get initial data
  const fetchData = async () => {
    try {
      const data = await getJourneyMap(journeyMapId);
      callback(data);
    } catch (error) {
      console.error('Error in subscribeToJourneyMap:', error);
    }
  };

  fetchData();

  // Set up real-time subscription
  const subscription = supabase
    .channel(`journey_map_${journeyMapId}`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: TABLE_NAME,
        filter: `id=eq.${journeyMapId}`
      }, 
      () => {
        fetchData(); // Refetch data when changes occur
      }
    )
    .subscribe();

  // Return cleanup function
  return () => {
    subscription.unsubscribe();
  };
};

// Helper function to track specific changes with more details
export const trackStageChange = async (journeyMapId, changeType, stageData, details) => {
  await createVersionHistory(
    journeyMapId,
    `stage_${changeType}`,
    details,
    null,
    stageData
  );
};

export const trackTaskChange = async (journeyMapId, changeType, taskData, details) => {
  await createVersionHistory(
    journeyMapId,
    `task_${changeType}`,
    details,
    null,
    taskData
  );
};

export const trackStepChange = async (journeyMapId, changeType, stepData, details) => {
  await createVersionHistory(
    journeyMapId,
    `step_${changeType}`,
    details,
    null,
    stepData
  );
}; 

// Reset all journey maps and version history (for fresh start)
export const resetAllData = async () => {
  try {
    // Delete all version history first
    const { error: versionError } = await supabase
      .from(VERSION_HISTORY_TABLE)
      .delete()
      .neq('id', 0); // Delete all records

    if (versionError) {
      console.error('Error clearing version history:', versionError);
    }

    // Delete all journey maps
    const { error: mapsError } = await supabase
      .from(TABLE_NAME)
      .delete()
      .neq('id', 0); // Delete all records

    if (mapsError) {
      console.error('Error clearing journey maps:', mapsError);
    }

    console.log('All data cleared successfully');
    return true;
  } catch (error) {
    console.error('Error resetting data:', error);
    throw error;
  }
};

// ============================================
// JOB PERFORMER MANAGEMENT FUNCTIONS
// ============================================

// Get all job performers for the current user
export const getJobPerformers = async () => {
  try {
    const user = getAnonymousUser();
    const { data, error } = await supabase
      .from(JOB_PERFORMERS_TABLE)
      .select('*')
      .eq('user_id', user.uid)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching job performers:', error);
    throw error;
  }
};

// Create a new job performer
export const createJobPerformer = async (jobPerformerData) => {
  try {
    const user = getAnonymousUser();
    const { data, error } = await supabase
      .from(JOB_PERFORMERS_TABLE)
      .insert([
        {
          ...jobPerformerData,
          user_id: user.uid,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error creating job performer:', error);
    throw error;
  }
};

// Update an existing job performer
export const updateJobPerformer = async (id, jobPerformerData) => {
  try {
    console.log('🔧 updateJobPerformer called with:', { id, jobPerformerData });
    
    const { data, error } = await supabase
      .from(JOB_PERFORMERS_TABLE)
      .update({
        ...jobPerformerData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    console.log('🔧 updateJobPerformer result:', { data, error });

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error updating job performer:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw error;
  }
};

// Delete a job performer
export const deleteJobPerformer = async (id) => {
  try {
    const user = getAnonymousUser();
    const { error } = await supabase
      .from(JOB_PERFORMERS_TABLE)
      .delete()
      .eq('id', id)
      .eq('user_id', user.uid);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting job performer:', error);
    throw error;
  }
};

// Subscribe to job performers changes
export const subscribeToJobPerformers = (callback) => {
  const user = getAnonymousUser();
  
  // Initial data fetch with fallback to defaults
  const fetchInitialData = async () => {
    try {
      const jobPerformers = await getJobPerformers();
      callback(jobPerformers);
    } catch (error) {
      console.error('Error fetching job performers, using defaults:', error);
      // Call callback with empty array so the component can use defaults
      callback([]);
    }
  };

  // Set up subscription (but don't let it fail silently)
  let subscription;
  try {
    subscription = supabase
      .channel('job_performers_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: JOB_PERFORMERS_TABLE,
          filter: `user_id=eq.${user.uid}`
        },
        async () => {
          // Fetch fresh data when changes occur
          try {
            const jobPerformers = await getJobPerformers();
            callback(jobPerformers);
          } catch (error) {
            console.error('Error in job performers subscription:', error);
            // Still call callback with empty array for consistency
            callback([]);
          }
        }
      )
      .subscribe();
  } catch (error) {
    console.error('Failed to set up job performers subscription:', error);
    subscription = null;
  }

  // Fetch initial data
  fetchInitialData();

  return () => {
    if (subscription) {
      subscription.unsubscribe();
    }
  };
}; 