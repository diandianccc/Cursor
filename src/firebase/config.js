import { createClient } from '@supabase/supabase-js';

// Supabase configuration - Collaborator's project
const supabaseUrl = 'https://sxfperfomejmoxmwajpc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4ZnBlcmZvbWVqbW94bXdhanBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNDU0MTcsImV4cCI6MjA2OTkyMTQxN30.-vB_wWlhDpO_lpqmHbcrtXawlLGjMAh148SWLLcQIH4';

// Create Supabase client with anon key
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

