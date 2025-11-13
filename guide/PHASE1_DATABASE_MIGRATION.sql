-- ============================================
-- 🗄️ Phase 1 Database Migration - Nala Pustaka
-- ============================================
-- Features: Manuscript Ordering + Source Links
-- Execute di Supabase SQL Editor
-- Estimated time: ~2 minutes
-- ============================================

-- Step 1: Add new columns
-- --------------------------------------------

-- Add display_order column for manuscript ordering
ALTER TABLE manuscripts 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Add source_url column for external source links
ALTER TABLE manuscripts
ADD COLUMN IF NOT EXISTS source_url TEXT;

-- Step 2: Create index for performance
-- --------------------------------------------

CREATE INDEX IF NOT EXISTS idx_manuscripts_display_order 
ON manuscripts(display_order DESC, created_at DESC);

-- Step 3: Initialize display_order for existing records
-- --------------------------------------------

-- Set sequential order based on created_at (newest = highest order)
WITH ordered_manuscripts AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as row_num
  FROM manuscripts
)
UPDATE manuscripts m
SET display_order = om.row_num
FROM ordered_manuscripts om
WHERE m.id = om.id;

-- ============================================
-- ✅ Migration Complete!
-- ============================================

-- Verification queries (optional - run to check):
-- 
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns 
-- WHERE table_name = 'manuscripts' 
-- AND column_name IN ('display_order', 'source_url');
--
-- SELECT id, title, display_order, source_url, created_at
-- FROM manuscripts 
-- ORDER BY display_order DESC;
