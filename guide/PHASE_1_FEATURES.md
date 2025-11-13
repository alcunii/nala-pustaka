# 🚀 Phase 1 Features - Nala Pustaka

**Status**: ✅ COMPLETED - Ready for testing  
**Tanggal**: Desember 2024

---

## 📋 Overview

Phase 1 menambahkan 4 fitur baru untuk meningkatkan pengalaman admin dan user:

1. **Author Selection Dropdown** - Pilihan pengarang dengan opsi preset
2. **Manuscript Ordering System** - Atur urutan tampilan naskah
3. **Search Functionality** - Cari naskah dengan cepat
4. **Source Link Feature** - Link ke sumber naskah original

---

## ✨ 1. Author Selection Dropdown

### Untuk Admin

Di **Admin Dashboard** (`/admin/dashboard`), saat menambah/edit naskah:

**Opsi Pengarang:**
- ✏️ **Custom** - Tulis nama pengarang sendiri (default)
- ❓ **Tidak Diketahui** - Untuk naskah tanpa pengarang jelas
- 👥 **Banyak Penulis** - Untuk karya kolaboratif/anonim kolektif

**Cara Pakai:**
1. Pilih tipe pengarang dari dropdown
2. Jika pilih "Custom", isi nama pengarang di input field
3. Jika pilih "Tidak Diketahui" atau "Banyak Penulis", otomatis terisi

**Contoh:**
```
Tipe: Custom → Isi: "Ranggawarsita"
Tipe: Tidak Diketahui → Otomatis: "Tidak Diketahui"
Tipe: Banyak Penulis → Otomatis: "Banyak Penulis"
```

### Untuk User

Di homepage, pengarang ditampilkan sesuai yang dipilih admin.

---

## 🔢 2. Manuscript Ordering System

### Untuk Admin

Di **Admin Dashboard**, setiap naskah di daftar memiliki tombol **▲ Naik** dan **▼ Turun**.

**Cara Pakai:**
1. Klik **▲** untuk naikkan naskah 1 posisi ke atas
2. Klik **▼** untuk turunkan naskah 1 posisi ke bawah
3. Urutan langsung tersimpan di database
4. Refresh halaman untuk verifikasi urutan tetap konsisten

**Fitur:**
- Tombol disable otomatis jika sudah di posisi paling atas/bawah
- Urutan tersimpan permanent di database (kolom `display_order`)
- Sorting: Display order DESC → Created date DESC (terbaru dulu)

### Database Changes

**Kolom Baru:**
- `display_order` (INTEGER) - Nomor urutan untuk sorting

**Fungsi RPC:**
- `swap_manuscript_order(id1, id2)` - Tukar urutan 2 naskah

**Migration SQL:**
Lihat file: `guide/DATABASE_SCHEMA_UPDATE.sql`

### Untuk User

Di homepage, naskah tampil sesuai urutan yang diatur admin.

---

## 🔍 3. Search Functionality

### Untuk User

Di **Homepage**, panel kiri (desktop) memiliki search bar di atas daftar naskah.

**Cara Pakai:**
1. Ketik di search bar (cari by: judul, pengarang, atau deskripsi)
2. Hasil filter real-time tanpa reload
3. Klik ✕ atau hapus text untuk reset

**Fitur:**
- Case-insensitive search
- Filter 3 field: title, author, description
- Tampil jumlah hasil pencarian
- Pesan "Tidak ada naskah yang cocok" jika hasil kosong

**Contoh:**
```
Input: "wulan" → Hasil: Serat Wulangreh
Input: "ranggawarsita" → Hasil: Semua karya Ranggawarsita
Input: "moral" → Hasil: Naskah dengan deskripsi mengandung "moral"
```

---

## 🔗 4. Source Link Feature

### Untuk Admin

Di **Admin Dashboard**, form naskah memiliki field **Sumber (Link)** (opsional).

**Cara Pakai:**
1. Isi URL lengkap (https://...) ke sumber naskah original
2. Bisa kosong (opsional)
3. Validasi otomatis format URL

**Contoh:**
```
Sumber: https://sastra.org/naskah/wulangreh
Sumber: https://perpustakaan.kemdikbud.go.id/...
Sumber: (kosong) → Tidak ada tombol sumber di user view
```

### Untuk User

Di **Homepage**, jika naskah punya source URL:

**Lokasi Tombol:**
- Di header panel kanan (desktop/mobile)
- Sebelah tombol "💬 Chat" dan "🔮 Graph"

**Tampilan:**
```
🔗 Sumber (tombol biru)
```

**Cara Pakai:**
1. Klik tombol "🔗 Sumber"
2. Otomatis buka tab baru ke URL sumber
3. Jika tidak ada source_url, tombol tidak tampil

### Database Changes

**Kolom Baru:**
- `source_url` (TEXT, nullable) - URL sumber naskah

---

## 🗄️ Database Migration

**File**: `guide/DATABASE_SCHEMA_UPDATE.sql`

### Langkah Eksekusi:

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project: **nala-pustaka**
3. Menu: **SQL Editor** (ikon database di sidebar)
4. Klik **+ New Query**
5. Copy-paste isi file `DATABASE_SCHEMA_UPDATE.sql`
6. Klik **Run** (atau Ctrl+Enter)

### Verifikasi:

```sql
-- Cek kolom baru ada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'manuscripts' 
AND column_name IN ('display_order', 'source_url');

-- Cek fungsi swap ada
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'swap_manuscript_order';
```

**Expected Output:**
```
column_name     | data_type
----------------+-----------
display_order   | integer
source_url      | text

routine_name
------------------------
swap_manuscript_order
```

---

## 🧪 Testing Checklist

### Admin Panel Testing

- [ ] **Author Selection**
  - [ ] Select "Custom" → Input field muncul
  - [ ] Select "Tidak Diketahui" → Show preview "Tidak Diketahui"
  - [ ] Select "Banyak Penulis" → Show preview "Banyak Penulis"
  - [ ] Edit naskah existing → Author type terdeteksi benar
  - [ ] Submit form → Author tersimpan dengan benar

- [ ] **Manuscript Ordering**
  - [ ] Tombol ▲ naik work
  - [ ] Tombol ▼ turun work
  - [ ] Tombol disable saat di ujung
  - [ ] Refresh page → Urutan tetap konsisten
  - [ ] Database: display_order update benar

- [ ] **Source URL**
  - [ ] Input URL valid → Tersimpan
  - [ ] Input kosong → Null di database
  - [ ] Edit existing → Source URL terupdate
  - [ ] Admin list → Show "🔗 Ada sumber" jika ada

### User Homepage Testing

- [ ] **Search**
  - [ ] Search by title → Filter work
  - [ ] Search by author → Filter work
  - [ ] Search by description → Filter work
  - [ ] Case insensitive work
  - [ ] Clear button (✕) reset filter
  - [ ] Empty result → Show message
  - [ ] Result count tampil

- [ ] **Source Button**
  - [ ] Naskah dengan source_url → Tombol "🔗 Sumber" muncul
  - [ ] Klik tombol → Buka tab baru
  - [ ] Naskah tanpa source_url → Tombol tidak muncul
  - [ ] Responsive di mobile

- [ ] **Manuscript Order**
  - [ ] Naskah tampil sesuai display_order
  - [ ] Sort: High display_order → Low display_order
  - [ ] Fallback: Newest created_at first

---

## 📦 Files Modified

### Backend/Database
- `guide/DATABASE_SCHEMA_UPDATE.sql` (NEW) - Migration script

### Frontend
- `src/pages/AdminDashboard.jsx`:
  - Added `authorType` field to form state
  - Added `source_url` field
  - Added author dropdown UI
  - Added source URL input field
  - Added ordering buttons (▲▼)
  - Added `handleReorder()` function
  - Updated `handleSubmit()` for author logic
  - Updated `handleEdit()` to detect author type
  - Updated `loadManuscripts()` with sorting

- `src/lib/supabase.js`:
  - Added `manuscriptService.reorder()` method

- `src/App.jsx`:
  - Added `searchQuery` state in `LeftPanel`
  - Added search input with clear button
  - Added filter logic for manuscripts
  - Added "🔗 Sumber" button in `RightPanel`
  - Added `window.open()` for source URL

---

## 🎯 Next Steps (Phase 2)

**Planned Features:**
1. **Chat History & Memory** - Save conversation to localStorage
2. **Conversational AI** - Context-aware responses with sliding window
3. **Enhanced AI Formatting** - Better Markdown rendering
4. **Pagination** - Limit 5 manuscripts per page with pagination

**Estimated Timeline:** 1-2 weeks after Phase 1 validated

---

## 🐛 Known Issues & Limitations

**Phase 1:**
- None yet - waiting for user testing

**Future Improvements:**
- Add drag-and-drop reordering (more intuitive than ▲▼ buttons)
- Add search in mobile view (currently desktop only)
- Add filter by author type (Custom/Unknown/Multiple)
- Add bulk reorder (input order numbers directly)

---

## 📞 Support

**Issues?** Check:
1. Browser console for errors
2. Supabase logs in dashboard
3. Network tab for failed API calls

**Contact:** Create issue di GitHub atau email support

---

**Last Updated:** Desember 2024  
**Version:** 1.0.0 (Phase 1 Complete)
