// This file now imports from the dynamic job performer service
// The PERSONAS array is dynamically managed and updated from the database

import { PERSONAS, getPersonaByIdSync } from '../services/jobPerformerService';

// Re-export for compatibility
export { PERSONAS };

// Legacy compatibility function - now uses the dynamic service
export const getPersonaById = getPersonaByIdSync; 