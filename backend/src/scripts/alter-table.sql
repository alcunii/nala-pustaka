-- Add manuscript_id column to manuscripts table
-- This column will store the manuscriptId from Pinecone for mapping

ALTER TABLE manuscripts 
ADD COLUMN IF NOT EXISTS manuscript_id TEXT;

-- Add unique constraint
ALTER TABLE manuscripts 
ADD CONSTRAINT unique_manuscript_id UNIQUE (manuscript_id);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_manuscript_id ON manuscripts(manuscript_id);

-- Add chunk_count and token_count if missing
ALTER TABLE manuscripts 
ADD COLUMN IF NOT EXISTS chunk_count INTEGER DEFAULT 0;

ALTER TABLE manuscripts 
ADD COLUMN IF NOT EXISTS token_count INTEGER DEFAULT 0;

-- Add year column if missing
ALTER TABLE manuscripts 
ADD COLUMN IF NOT EXISTS year TEXT;
