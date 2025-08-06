-- Add step_comments column to journey_maps table for storing comments as JSONB
-- This stores comments in the format: { "stepId": [comment1, comment2, ...] }

-- Add the step_comments column if it doesn't exist
ALTER TABLE public.journey_maps 
ADD COLUMN IF NOT EXISTS step_comments JSONB DEFAULT '{}';

-- Create an index for better performance on comment queries
CREATE INDEX IF NOT EXISTS idx_journey_maps_step_comments 
ON public.journey_maps USING GIN (step_comments);

-- Grant necessary permissions to anon role
GRANT SELECT, UPDATE ON public.journey_maps TO anon;

-- Enable RLS policy for step comments (if not already enabled)
ALTER TABLE public.journey_maps ENABLE ROW LEVEL SECURITY;

-- Create or replace policy for reading journey maps with comments
CREATE OR REPLACE POLICY "Enable read access for all users" 
ON public.journey_maps FOR SELECT 
USING (true);

-- Create or replace policy for updating journey maps with comments
CREATE OR REPLACE POLICY "Enable update access for all users" 
ON public.journey_maps FOR UPDATE 
USING (true);

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'journey_maps' 
AND column_name = 'step_comments';