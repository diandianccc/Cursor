import { createClient } from '@supabase/supabase-js';

// Supabase configuration - Your actual project details
const supabaseUrl = 'https://vusptjrlenppbqcynowj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1c3B0anJsZW5wcGJxY3lub3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MDE1NjgsImV4cCI6MjA2ODI3NzU2OH0.iv4-SpA69gVv1B7nM03rW1ne8WmBqxCpH9_dOuYXNs8';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase; 