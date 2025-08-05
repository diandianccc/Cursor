import { supabase } from './config';
import { getAnonymousUser } from './authService';

// Table names
const TABLE_NAME = 'journey_maps';
const VERSION_HISTORY_TABLE = 'journey_map_versions';

// Create version history entry
const createVersionHistory = async (journeyMapId, changeType, changeDetails, previousData = null, newData = null) => {
  try {
    const user = getAnonymousUser();
    const versionEntry = {
      journey_map_id: journeyMapId,
      user_id: user.uid,
      change_type: changeType,
      change_details: changeDetails,
      previous_data: previousData,
      new_data: newData,
      timestamp: new Date().toISOString(),
      user_session: user.uid // For tracking collaborative users
    };

    const { error } = await supabase
      .from(VERSION_HISTORY_TABLE)
      .insert([versionEntry]);

    if (error) {
      console.error('Error creating version history:', error);
    }
  } catch (error) {
    console.error('Error in createVersionHistory:', error);
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
          map_type: mapType, // 'user_journey' or 'jobs_to_be_done'
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
    throw error;
  }
};

// Update journey map stages with version tracking
export const updateJourneyMapStages = async (journeyMapId, stages, changeDetails = 'Stages updated') => {
  try {
    // Get current data for version history
    const currentData = await getJourneyMap(journeyMapId);
    
    const { error } = await supabase
      .from(TABLE_NAME)
      .update({
        stages,
        last_modified: new Date().toISOString()
      })
      .eq('id', journeyMapId);

    if (error) throw error;
    
    // Create version history entry
    await createVersionHistory(
      journeyMapId, 
      'stages_updated', 
      changeDetails,
      currentData?.stages,
      stages
    );
  } catch (error) {
    console.error('Error updating journey map:', error);
    throw error;
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
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', journeyMapId)
      .single();

    if (error) throw error;
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