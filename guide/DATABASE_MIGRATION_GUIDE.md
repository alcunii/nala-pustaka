# 🚨 PENTING: Database Migration Required

**Status Error:** ❌ `authorType column tidak ada`  
**Penyebab:** Database belum diupdate dengan kolom baru Phase 1  
**Solusi:** Jalankan SQL migration di bawah

---

## 📋 Step-by-Step: Jalankan Database Migration

### **Step 1: Buka Supabase SQL Editor**

1. Go to: https://supabase.com/dashboard
2. Login dengan email: `abinawa007@gmail.com`
3. Pilih project: **nala-pustaka** (Singapore region)
4. Klik menu **"SQL Editor"** di sidebar kiri (ikon ⚡ database)
5. Klik tombol **"+ New Query"**

---

### **Step 2: Copy-Paste SQL Migration**

Copy **SEMUA CODE** di bawah ini ke SQL Editor:

```sql
-- ============================================
-- 🗄️ Phase 1 Database Migration - Nala Pustaka
-- ============================================

-- Add display_order column for manuscript ordering
ALTER TABLE manuscripts 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Add source_url column for external source links
ALTER TABLE manuscripts
ADD COLUMN IF NOT EXISTS source_url TEXT;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_manuscripts_display_order 
ON manuscripts(display_order DESC, created_at DESC);

-- Initialize display_order for existing records
WITH ordered_manuscripts AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as row_num
  FROM manuscripts
)
UPDATE manuscripts m
SET display_order = om.row_num
FROM ordered_manuscripts om
WHERE m.id = om.id;
```

---

### **Step 3: Jalankan SQL**

1. Paste code di SQL Editor
2. Klik tombol **"Run"** (atau tekan `Ctrl + Enter`)
3. Tunggu sampai muncul pesan:

✅ **"Success. No rows returned"** atau  
✅ **"Success. 9 rows affected"** (jumlah naskah Anda)

---

### **Step 4: Verifikasi Migration Berhasil**

Jalankan query ini untuk cek kolom baru:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'manuscripts' 
AND column_name IN ('display_order', 'source_url');
```

**Expected Output:**
```
column_name     | data_type | is_nullable
----------------+-----------+-------------
display_order   | integer   | YES
source_url      | text      | YES
```

Kalau muncul 2 rows seperti di atas, **migration sukses!** ✅

---

### **Step 5: Cek Data Naskah**

```sql
SELECT id, title, display_order, source_url, created_at
FROM manuscripts 
ORDER BY display_order DESC;
```

**Expected Output:**
```
Semua naskah punya display_order (1, 2, 3, dst)
source_url = NULL (karena belum diisi)
```

---

## ✅ Setelah Migration Sukses

1. **Refresh Admin Dashboard** di browser (tekan F5)
2. **Test Edit Naskah:**
   - Klik "✏️ Edit" pada naskah mana saja
   - Error `authorType` seharusnya **HILANG**
   - Form bisa di-submit tanpa error

3. **Test Ordering:**
   - Kembali ke Daftar Naskah
   - Klik tombol ▲ atau ▼
   - Urutan naskah berubah

4. **Test Author Dropdown:**
   - Tambah naskah baru
   - Pilih dropdown Pengarang:
     - ✏️ Custom (Tulis Nama)
     - ❓ Tidak Diketahui
     - 👥 Banyak Penulis
   - Submit → Sukses tersimpan

5. **Test Source URL:**
   - Edit naskah
   - Isi field "Sumber (Link)" dengan URL
   - Submit → Lihat di homepage, tombol "🔗 Sumber" muncul

---

## 🐛 Jika Masih Error

### Error: "column display_order does not exist"
- Migration belum berhasil
- Ulangi Step 2-3
- Pastikan tidak ada typo saat copy-paste SQL

### Error: "permission denied"
- User Supabase tidak punya akses admin
- Login dengan akun owner project

### Error lainnya
- Screenshot error message
- Buka Supabase → Table Editor → manuscripts
- Cek apakah kolom `display_order` dan `source_url` muncul

---

## 📁 File Location

**SQL Migration:** `guide/PHASE1_DATABASE_MIGRATION.sql`  
**Documentation:** `guide/PHASE_1_FEATURES.md`

---

**Butuh bantuan?** Share screenshot error di chat! 🚀
