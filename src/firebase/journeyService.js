import { supabase } from './config';

// Table name for journey maps
const TABLE_NAME = 'journey_maps';

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
export const createJourneyMap = async (name = 'My Journey Map') => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([
        {
          name,
          stages: [],
          last_modified: new Date().toISOString(),
          created: new Date().toISOString()
        }
      ])
      .select();

    if (error) throw error;
    return data[0].id;
  } catch (error) {
    console.error('Error creating journey map:', error);
    throw error;
  }
};

// Update journey map stages
export const updateJourneyMapStages = async (journeyMapId, stages) => {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .update({
        stages,
        last_modified: new Date().toISOString()
      })
      .eq('id', journeyMapId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating journey map:', error);
    throw error;
  }
};

// Delete a journey map
export const deleteJourneyMap = async (journeyMapId) => {
  try {
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