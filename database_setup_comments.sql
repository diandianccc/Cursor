-- SQL to create the step_comments table in Supabase
-- Run this in the Supabase SQL editor

CREATE TABLE step_comments (
  id SERIAL PRIMARY KEY,
  step_id VARCHAR(255) NOT NULL,
  author_name VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on step_id for faster queries
CREATE INDEX idx_step_comments_step_id ON step_comments(step_id);

-- Enable Row Level Security (optional - for future security)
ALTER TABLE step_comments ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all users to read and insert comments (public access)
CREATE POLICY "Allow public access to step_comments" ON step_comments
FOR ALL USING (true);