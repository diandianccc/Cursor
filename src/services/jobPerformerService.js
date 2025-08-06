import { getJobPerformers, updateJobPerformer } from '../firebase/journeyService';

// Default job performers (fallback when database is empty)
export const DEFAULT_JOB_PERFORMERS = [
  {
    id: 'customer',
    name: 'Customer',
    description: 'End users who interact with the product or service',
    color: '#3B82F6', // Blue
    resources: [],
    isDefault: true
  },
  {
    id: 'support-agent',
    name: 'Support Agent',
    description: 'Customer service representatives who help users',
    color: '#10B981', // Green
    resources: [],
    isDefault: true
  },
  {
    id: 'product-manager',
    name: 'Product Manager',
    description: 'Team members responsible for product strategy and development',
    color: '#8B5CF6', // Purple
    resources: [],
    isDefault: true
  },
  {
    id: 'admin',
    name: 'Admin User',
    description: 'Administrative users with elevated permissions',
    color: '#EF4444', // Red
    resources: [],
    isDefault: true
  }
];

// Convert hex color to Tailwind classes
const hexToTailwindClasses = (hexColor) => {
  // This is a simplified conversion - in a real app you might want a more sophisticated mapping
  const colorMap = {
    '#3B82F6': { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-500' },
    '#10B981': { bg: 'bg-green-500', text: 'text-white', border: 'border-green-500' },
    '#8B5CF6': { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-500' },
    '#EF4444': { bg: 'bg-red-500', text: 'text-white', border: 'border-red-500' },
    '#F59E0B': { bg: 'bg-yellow-500', text: 'text-white', border: 'border-yellow-500' },
    '#F97316': { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-500' },
    '#EC4899': { bg: 'bg-pink-500', text: 'text-white', border: 'border-pink-500' },
    '#6366F1': { bg: 'bg-indigo-500', text: 'text-white', border: 'border-indigo-500' },
  };
  
  return colorMap[hexColor] || { bg: 'bg-gray-500', text: 'text-white', border: 'border-gray-500' };
};

// Convert database job performer to legacy persona format
const convertToPersonaFormat = (jobPerformer) => {
  // If this is already a converted persona, return it as-is
  if (jobPerformer.hexColor && jobPerformer.hexColor.startsWith('#')) {
    console.log('🎨 convertToPersonaFormat: Already converted, returning as-is:', jobPerformer);
    return jobPerformer;
  }
  
  // Handle default job performers vs database job performers
  const hexColor = jobPerformer.color;
  const isDefault = jobPerformer.isDefault || false;
  
  console.log('🎨 convertToPersonaFormat INPUT (fresh conversion):', jobPerformer);
  console.log('🎨 convertToPersonaFormat EXTRACTED hexColor:', hexColor);
  
  const result = {
    id: jobPerformer.id,
    name: jobPerformer.name,
    description: jobPerformer.description,
    color: 'bg-gray-500', // Fallback Tailwind class in case custom styles fail
    textColor: 'text-white',
    borderColor: 'border-gray-500',
    hexColor: hexColor,  // This should be the actual hex color
    resources: jobPerformer.resources || [],
    isDefault: isDefault
  };
  
  console.log('🎨 convertToPersonaFormat OUTPUT:', result);
  return result;
};

// Get multiple job performers by IDs
export const getJobPerformersByIds = (jobPerformerIds) => {
  if (!Array.isArray(jobPerformerIds)) return [];
  
  return jobPerformerIds
    .map(id => getPersonaByIdSync(id))
    .filter(performer => performer !== null);
};

// Get styles for multiple job performers (for displaying multiple badges)
export const getJobPerformersStyles = (jobPerformers) => {
  if (!Array.isArray(jobPerformers)) return [];
  
  return jobPerformers.map(performer => getJobPerformerStyles(performer));
};

// Generate color stripes for multiple job performers
export const getMultiPerformerColors = (jobPerformers) => {
  if (!Array.isArray(jobPerformers) || jobPerformers.length <= 1) return [];
  
  return jobPerformers.slice(0, 4).map(performer => {
    const hexColor = performer.hexColor || performer.hex_color || performer.color;
    return hexColor || '#6B7280'; // Default gray if no color
  });
};

// Clean up duplicate job performers (for users who had the bug)
export const cleanupDuplicateJobPerformers = async () => {
  try {
    const databaseJobPerformers = await getJobPerformers();
    const defaultIds = DEFAULT_JOB_PERFORMERS.map(d => d.id);
    
    // Find database entries that have the same ID as defaults but no replaces_default_id
    const problematicEntries = databaseJobPerformers.filter(performer => 
      defaultIds.includes(performer.id) && !performer.replaces_default_id
    );
    
    // Update them to have replaces_default_id
    for (const entry of problematicEntries) {
      await updateJobPerformer(entry.id, {
        ...entry,
        replaces_default_id: entry.id
      });
    }
    
    console.log(`✅ Cleaned up ${problematicEntries.length} duplicate job performers`);
  } catch (error) {
    console.error('Error cleaning up duplicates:', error);
  }
};

// Get all job performers (database + defaults, with database taking priority for same IDs)
export const getAllJobPerformers = async () => {
  try {
    console.log('🔍 getAllJobPerformers: Fetching from database...');
    let databaseJobPerformers = await getJobPerformers();
    console.log('🔍 Database job performers:', databaseJobPerformers);
    
    // Auto-cleanup duplicates if needed (one-time fix for users who had the bug)
    if (databaseJobPerformers.length > 0) {
      const defaultIds = DEFAULT_JOB_PERFORMERS.map(d => d.id);
      const hasDuplicates = databaseJobPerformers.some(performer => 
        defaultIds.includes(performer.id) && !performer.replaces_default_id
      );
      
      if (hasDuplicates) {
        console.log('🔧 Auto-cleaning duplicate job performers...');
        await cleanupDuplicateJobPerformers();
        // Refetch after cleanup
        databaseJobPerformers = await getJobPerformers();
      }
    }
    
    // If database is empty, return default job performers
    if (!databaseJobPerformers || databaseJobPerformers.length === 0) {
      console.log('🔍 Database empty, returning defaults');
      const result = DEFAULT_JOB_PERFORMERS.map(convertToPersonaFormat);
      console.log('🔍 Final converted defaults:', result);
      return result;
    }
    
    // Track which defaults have been replaced by custom performers
    const replacedDefaultIds = new Set();
    databaseJobPerformers.forEach(performer => {
      if (performer.replaces_default_id) {
        replacedDefaultIds.add(performer.replaces_default_id);
      }
    });
    
    // Add database performers and non-replaced defaults
    const allJobPerformers = [...databaseJobPerformers];
    DEFAULT_JOB_PERFORMERS.forEach(defaultPerformer => {
      if (!replacedDefaultIds.has(defaultPerformer.id)) {
        allJobPerformers.push(defaultPerformer);
      }
    });
    
    const result = allJobPerformers.map(convertToPersonaFormat);
    console.log('🔍 Final combined result (database + remaining defaults):', result);
    return result;
  } catch (error) {
    console.error('Error fetching job performers:', error);
    // Return defaults as fallback
    console.log('🔍 Error occurred, returning defaults as fallback');
    return DEFAULT_JOB_PERFORMERS.map(convertToPersonaFormat);
  }
};

// Get job performer by ID
export const getJobPerformerById = async (id) => {
  try {
    const allJobPerformers = await getAllJobPerformers();
    return allJobPerformers.find(jp => jp.id === id) || allJobPerformers[0];
  } catch (error) {
    console.error('Error fetching job performer by ID:', error);
    return convertToPersonaFormat(DEFAULT_JOB_PERFORMERS[0]);
  }
};

// Legacy compatibility - maintain the PERSONAS export for existing code
export let PERSONAS = [];

// Initialize PERSONAS with defaults
export const initializeJobPerformers = async () => {
  try {
    console.log('🔄 initializeJobPerformers: Starting initialization...');
    PERSONAS = await getAllJobPerformers();
    console.log('🔄 initializeJobPerformers: PERSONAS initialized:', PERSONAS);
    return PERSONAS;
  } catch (error) {
    console.error('Error initializing job performers:', error);
    PERSONAS = DEFAULT_JOB_PERFORMERS.map(convertToPersonaFormat);
    console.log('🔄 initializeJobPerformers: Using defaults:', PERSONAS);
    return PERSONAS;
  }
};

// Legacy compatibility function (async)
export const getPersonaById = async (id) => {
  return await getJobPerformerById(id);
};

// Synchronous version using in-memory PERSONAS array
export const getPersonaByIdSync = (id) => {
  console.log('🔍 getPersonaByIdSync called with id:', id);
  console.log('🔍 Current PERSONAS array:', PERSONAS);
  
  if (!PERSONAS || PERSONAS.length === 0) {
    console.log('🔍 PERSONAS array empty, returning null');
    return null;
  }
  
  const found = PERSONAS.find(persona => persona.id == id); // Use == to handle string/number comparison
  const result = found || PERSONAS[0];
  console.log('🔍 Found persona:', result);
  
  return result;
};

// Update PERSONAS array (for real-time updates)
export const updatePersonasArray = (newJobPerformers) => {
  console.log('🔄 updatePersonasArray called with:', newJobPerformers);
  PERSONAS.length = 0; // Clear the array
  PERSONAS.push(...newJobPerformers.map(convertToPersonaFormat));
  console.log('🔄 PERSONAS array updated to:', PERSONAS);
  
  // Make PERSONAS available globally for debugging
  if (typeof window !== 'undefined') {
    window.PERSONAS = PERSONAS;
  }
};

// Utility function to get style object for custom colors
export const getJobPerformerStyles = (jobPerformer) => {
  if (!jobPerformer) return {};
  
  const hexColor = jobPerformer.hexColor || jobPerformer.hex_color || jobPerformer.color;
  
  console.log('🎨 getJobPerformerStyles called with:', {
    jobPerformer: jobPerformer.name,
    hexColor,
    hasHexColor: hexColor && hexColor.startsWith('#'),
    isDefault: jobPerformer.isDefault
  });
  
  // Since we only have custom job performers now, check for valid hex colors
  if (hexColor && hexColor.startsWith('#')) {
    console.log('🎨 Returning custom styles for hex color:', hexColor);
    return {
      backgroundColor: hexColor,
      borderLeftColor: hexColor,
      borderColor: hexColor,
      color: '#ffffff' // White text for custom colors
    };
  }
  
  console.log('🎨 No valid hex color, returning empty styles');
  return {};
};