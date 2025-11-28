# 🗄️ Database Schema Update - Supabase SQL

Jalankan SQL ini di Supabase SQL Editor untuk menambahkan fitur baru.

## Step 1: Add New Columns

```sql
-- Add display_order column for manuscript ordering
ALTER TABLE manuscripts 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Add source_url column for external source links
ALTER TABLE manuscripts
ADD COLUMN IF NOT EXISTS source_url TEXT;

-- Add index for better sorting performance
CREATE INDEX IF NOT EXISTS idx_manuscripts_display_order 
ON manuscripts(display_order DESC, created_at DESC);

-- Update existing records with sequential order (newest first)
WITH ordered_manuscripts AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as row_num
  FROM manuscripts
)
UPDATE manuscripts m
SET display_order = om.row_num
FROM ordered_manuscripts om
WHERE m.id = om.id;
```

## Step 2: Add Function to Reorder Manuscripts

```sql
-- Function to swap order between two manuscripts
CREATE OR REPLACE FUNCTION swap_manuscript_order(
  manuscript_id_1 UUID,
  manuscript_id_2 UUID
)
RETURNS void AS $$
DECLARE
  order_1 INTEGER;
  order_2 INTEGER;
BEGIN
  -- Get current orders
  SELECT display_order INTO order_1 FROM manuscripts WHERE id = manuscript_id_1;
  SELECT display_order INTO order_2 FROM manuscripts WHERE id = manuscript_id_2;
  
  -- Swap orders
  UPDATE manuscripts SET display_order = order_2 WHERE id = manuscript_id_1;
  UPDATE manuscripts SET display_order = order_1 WHERE id = manuscript_id_2;
END;
$$ LANGUAGE plpgsql;
```

## Step 3: Update RLS Policies (if needed)

```sql
-- Ensure display_order can be updated by authenticated users
-- (Already covered by existing UPDATE policy)
```

## Verification

```sql
-- Check if columns exist
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'manuscripts'
AND column_name IN ('display_order');

-- View current manuscript order
SELECT id, title, author, display_order, created_at
FROM manuscripts
ORDER BY display_order DESC, created_at DESC;
```

---

## Notes

- `display_order`: Higher number = shown first in list
- Default: 0 for new manuscripts
- Auto-increment when new manuscript added (handled in app)
- Swap function allows easy reordering via up/down buttons

---

**Status:** Ready to execute
**Time:** ~2 minutes
