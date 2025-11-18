-- Educational Features Database Schema for Supabase
-- Phase 1: Educational Content Cache & Knowledge Graph Relationships

-- ===========================================
-- Table 1: Educational Content Cache
-- ===========================================
-- Stores AI-generated educational content for manuscripts
-- All 4 cards (summary, wisdom, characters, significance) + quiz in one JSON field

CREATE TABLE IF NOT EXISTS educational_content (
  id SERIAL PRIMARY KEY,
  manuscript_id TEXT UNIQUE NOT NULL,
  content_data JSONB NOT NULL, -- Contains: {summary, wisdom, characters, significance, quiz}
  token_count INTEGER, -- Track token usage for cost estimation
  generated_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_educational_manuscript ON educational_content(manuscript_id);
CREATE INDEX IF NOT EXISTS idx_educational_generated ON educational_content(generated_at DESC);

-- Comment
COMMENT ON TABLE educational_content IS 'Cache for AI-generated educational content (summary, wisdom, characters, significance, quiz)';
COMMENT ON COLUMN educational_content.content_data IS 'JSONB: {summary: string, wisdom: array, characters: array, significance: string, quiz: array}';
COMMENT ON COLUMN educational_content.token_count IS 'Estimated token count for generation (for cost tracking)';

-- ===========================================
-- Table 2: Manuscript Relationships (Knowledge Graph)
-- ===========================================
-- Pre-computed relationships between manuscripts for text-based knowledge graph

CREATE TABLE IF NOT EXISTS manuscript_relationships (
  id SERIAL PRIMARY KEY,
  source_manuscript_id TEXT NOT NULL,
  related_manuscript_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL, -- 'character', 'theme', 'period', 'region', 'author'
  relationship_data JSONB, -- Additional data: {shared_character: "Pangeran Mangkubumi", similarity_score: 0.85}
  strength FLOAT DEFAULT 0.5, -- 0.0 to 1.0 (relevance score)
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(source_manuscript_id, related_manuscript_id, relationship_type)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_relationships_source ON manuscript_relationships(source_manuscript_id);
CREATE INDEX IF NOT EXISTS idx_relationships_related ON manuscript_relationships(related_manuscript_id);
CREATE INDEX IF NOT EXISTS idx_relationships_type ON manuscript_relationships(relationship_type);
CREATE INDEX IF NOT EXISTS idx_relationships_strength ON manuscript_relationships(strength DESC);

-- Comment
COMMENT ON TABLE manuscript_relationships IS 'Pre-computed relationships for knowledge graph (text-based display)';
COMMENT ON COLUMN manuscript_relationships.relationship_type IS 'Type: character, theme, period, region, or author';
COMMENT ON COLUMN manuscript_relationships.strength IS 'Relationship strength/relevance (0.0-1.0)';

-- ===========================================
-- Example Data (for testing)
-- ===========================================
-- You can run this to test with sample data:

-- INSERT INTO educational_content (manuscript_id, content_data, token_count)
-- VALUES (
--   'wulangreh',
--   '{
--     "summary": "Serat Wulangreh adalah karya sastra Jawa yang berisi ajaran moral dan etika untuk kehidupan sehari-hari.",
--     "wisdom": [
--       {"nilai": "Kerendahan Hati", "quote": "Andhap asor", "relevansi": "Penting untuk tidak sombong dalam era media sosial"}
--     ],
--     "characters": [],
--     "significance": "Karya penting dalam literatur Jawa yang mengajarkan nilai-nilai luhur.",
--     "quiz": [
--       {"question": "Apa tema utama Serat Wulangreh?", "options": ["Moral", "Perang", "Cinta", "Sejarah"], "correct": 0, "explanation": "Serat Wulangreh fokus pada ajaran moral."}
--     ]
--   }'::jsonb,
--   2500
-- );

-- INSERT INTO manuscript_relationships (source_manuscript_id, related_manuscript_id, relationship_type, relationship_data, strength)
-- VALUES 
--   ('babad-tanah-jawi', 'babad-giyanti', 'character', '{"shared_character": "Pangeran Mangkubumi"}'::jsonb, 0.9),
--   ('babad-tanah-jawi', 'serat-centhini', 'period', '{"period": "Abad 18"}'::jsonb, 0.7);

-- ===========================================
-- Update Trigger for updated_at
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_educational_content_updated_at
BEFORE UPDATE ON educational_content
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- INSTRUCTIONS
-- ===========================================
-- 1. Login to Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your project: nala-pustaka
-- 3. Go to SQL Editor (left sidebar)
-- 4. Copy & paste this entire SQL script
-- 5. Click "Run" button
-- 6. Verify tables created: Go to Table Editor
-- 7. Check both tables exist: educational_content, manuscript_relationships
-- 8. Done! Backend will now cache educational content automatically