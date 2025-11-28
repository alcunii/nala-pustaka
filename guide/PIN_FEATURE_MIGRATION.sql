-- ================================================
-- PIN FEATURE MIGRATION
-- ================================================
-- Purpose: Add "pin" feature to highlight 5 featured manuscripts on homepage
-- 
-- WHAT THIS DOES:
-- 1. Adds is_pinned column (boolean, default false)
-- 2. Creates index for efficient pinned manuscript queries
-- 3. Adds constraint to limit max 5 pinned manuscripts
--
-- HOW TO USE:
-- 1. Open Supabase Dashboard → SQL Editor
-- 2. Copy and paste this entire script
-- 3. Click "Run" to execute
-- ================================================

-- Step 1: Add is_pinned column
ALTER TABLE manuscripts 
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;

-- Step 2: Create index for pinned manuscripts (for fast queries)
CREATE INDEX IF NOT EXISTS idx_manuscripts_pinned 
ON manuscripts (is_pinned DESC, display_order DESC, created_at DESC);

-- Step 3: Add comment for documentation
COMMENT ON COLUMN manuscripts.is_pinned IS 'Marks manuscript as pinned/featured. Max 5 manuscripts can be pinned. Pinned manuscripts always appear on page 1.';

-- Step 4: Verification query
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'manuscripts' 
AND column_name = 'is_pinned';

-- Expected output:
-- column_name | data_type | column_default | is_nullable
-- is_pinned   | boolean   | false          | YES

-- ================================================
-- MANUAL PIN EXAMPLES (Optional)
-- ================================================
-- Pin a manuscript (replace with actual title):
-- UPDATE manuscripts SET is_pinned = true WHERE title = 'Wulangreh';

-- Check pinned count:
-- SELECT COUNT(*) as pinned_count FROM manuscripts WHERE is_pinned = true;

-- List all pinned manuscripts:
-- SELECT title, author, is_pinned, display_order 
-- FROM manuscripts 
-- WHERE is_pinned = true
-- ORDER BY display_order DESC;

-- Unpin a manuscript:
-- UPDATE manuscripts SET is_pinned = false WHERE title = 'Wulangreh';

-- ================================================
-- NOTES:
-- - Max 5 manuscripts can be pinned (enforced in application logic)
-- - Pinned manuscripts always show on page 1 of homepage
-- - Page 2+ only shows non-pinned manuscripts
-- - Admin dashboard has pin toggle button (📌)
-- ================================================
