# 🚀 MIGRATION READY - Pinecone → Supabase

## ✅ What''s Prepared

### 1. Migration Script Created ✅
- Location: `backend/src/scripts/migrate-to-supabase.js`
- Features:
  - ✅ Auto-detect all manuscripts from Pinecone (121 expected)
  - ✅ Aggregate chunks → full_text per manuscript
  - ✅ Insert/Update Supabase with complete data
  - ✅ Progress tracking & error handling
  - ✅ Summary report at end

### 2. Supabase Schema Checked ✅
- Table `manuscripts` exists
- Has `full_text` column ✅
- **Missing:** `manuscript_id` column (needed for Pinecone mapping)

### 3. SQL Schema Update Created ✅
- Location: `backend/src/scripts/alter-table.sql`
- Adds required columns:
  - `manuscript_id` (with unique constraint)
  - `chunk_count`
  - `token_count`
  - `year`

---

## 📋 EXECUTION STEPS

### Step 1: Update Supabase Schema (Manual - 2 minutes)

1. Go to Supabase Dashboard: https://app.supabase.com
2. Open your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy-paste this SQL:

```sql
-- Add manuscript_id column to manuscripts table
ALTER TABLE manuscripts 
ADD COLUMN IF NOT EXISTS manuscript_id TEXT;

ALTER TABLE manuscripts 
ADD CONSTRAINT unique_manuscript_id UNIQUE (manuscript_id);

CREATE INDEX IF NOT EXISTS idx_manuscript_id ON manuscripts(manuscript_id);

ALTER TABLE manuscripts 
ADD COLUMN IF NOT EXISTS chunk_count INTEGER DEFAULT 0;

ALTER TABLE manuscripts 
ADD COLUMN IF NOT EXISTS token_count INTEGER DEFAULT 0;

ALTER TABLE manuscripts 
ADD COLUMN IF NOT EXISTS year TEXT;
```

6. Click **Run** (or press Ctrl+Enter)
7. Should see "Success. No rows returned"

---

### Step 2: Run Migration (Automated - 5-10 minutes)

After SQL is executed, run migration:

```bash
cd backend
node src/scripts/migrate-to-supabase.js
```

**What it does:**
1. Connects to Pinecone
2. Fetches all 1,061 vectors
3. Groups by manuscriptId (121 manuscripts)
4. For each manuscript:
   - Aggregates all chunks
   - Reconstructs full_text
   - Inserts to Supabase
5. Verifies final count

**Expected output:**
```
╔════════════════════════════════════════════════════════════╗
║  🚀 MIGRATION: Pinecone → Supabase                       ║
╚════════════════════════════════════════════════════════════╝

Step 1: Initializing Pinecone connection...
✅ Pinecone connected

Step 2: Fetching all manuscript IDs from Pinecone...
✅ Found 121 manuscripts to migrate

Step 3: Migrating manuscripts...

[1/121] Processing: 1125
✅ Inserted: Babad Mangir (29 chunks)

[2/121] Processing: 1010
✅ Inserted: Babad Kartasura (15 chunks)

... (continues for all 121)

╔════════════════════════════════════════════════════════════╗
║  ✅ MIGRATION COMPLETE                                    ║
╚════════════════════════════════════════════════════════════╝

📊 Summary:
   Total manuscripts: 121
   ✅ Inserted: 121
   🔄 Updated: 0
   ⚠️  Skipped: 0
   ❌ Errors: 0
   ⏱️  Duration: 342.5s

✅ Supabase now contains 121 manuscripts

🎉 Migration successful!
```

---

## 🎯 After Migration

### Frontend Auto-Population

Your frontend will auto-load manuscripts from Supabase:

```javascript
// src/lib/supabase.js already has this:
const { data } = await supabase
  .from(''manuscripts'')
  .select(''*'')
  .order(''created_at'', { ascending: false });

// Now returns 121 manuscripts with full_text! ✨
```

### Deep Chat Enhancement

Deep Chat can now use Supabase directly (faster than Pinecone aggregation):

```javascript
// Instead of:
const manuscript = await ragApi.getFullManuscript(manuscriptId); // Slow

// Use:
const manuscript = await supabase
  .from(''manuscripts'')
  .select(''full_text, title, author'')
  .eq(''manuscript_id'', manuscriptId)
  .single(); // Fast! ✨
```

---

## 📊 Data Flow After Migration

```
User opens app
  ↓
Frontend queries Supabase manuscripts table
  ↓
Display 121 naskah in sidebar ✨
  ↓
User clicks naskah
  ↓
Load full_text from Supabase (instant!)
  ↓
User asks question
  ↓
AI answers with full context

Meanwhile, RAG Search still uses Pinecone:
  Search "Pangeran Mangkubumi"
    ↓
  Pinecone returns relevant chunks
    ↓
  Click "Chat dengan naskah ini"
    ↓
  Load full_text from Supabase (by manuscript_id)
    ↓
  Deep Chat with AI
```

---

## ✅ Benefits

1. **Single Source of Truth**: Supabase = master database
2. **Faster Queries**: No need to reconstruct from chunks
3. **Auto-populated List**: 121 naskah di sidebar
4. **Better UX**: Instant manuscript loading
5. **Easier Management**: Edit via Supabase dashboard
6. **Dual Power**:
   - Pinecone: Semantic search across chunks
   - Supabase: Full manuscript storage & retrieval

---

## 🔧 Troubleshooting

### If migration fails:

1. **Check Supabase credentials** in backend/.env
2. **Check Pinecone connection** (should already work)
3. **Check logs** for specific errors
4. **Re-run migration** (it''s idempotent - safe to retry)

### If some manuscripts are skipped:

- Check backend logs for specific manuscriptId
- Verify that manuscriptId exists in Pinecone
- Check if chunkText is empty

---

## 📁 Files Created

- `backend/src/scripts/migrate-to-supabase.js` - Migration script
- `backend/src/scripts/check-supabase-schema.js` - Schema checker
- `backend/src/scripts/alter-table.sql` - SQL for schema update
- `MIGRATION_GUIDE.md` - This documentation

---

## 🎉 Ready to Execute!

**Next:** Run the SQL in Supabase Dashboard, then come back to run migration!
