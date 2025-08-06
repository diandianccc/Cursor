import { createClient } from '@supabase/supabase-js';

// Supabase configuration - Use environment variables in production, fallback to hardcoded values
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://sxfperfomejmoxmwajpc.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4ZnBlcmZvbWVqbW94bXdhanBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNDU0MTcsImV4cCI6MjA2OTkyMTQxN30.-vB_wWlhDpO_lpqmHbcrtXawlLGjMAh148SWLLcQIH4';

console.log('🔧 Supabase Config:', {
  url: supabaseUrl,
  keyPrefix: supabaseAnonKey?.substring(0, 20) + '...',
  usingEnvVars: !!process.env.REACT_APP_SUPABASE_URL
});

// Create Supabase client with anon key
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

