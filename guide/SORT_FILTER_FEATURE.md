# 🔍 Sort & Filter Feature - Admin Dashboard

**Status**: ✅ COMPLETED  
**Phase**: 1.5 (Extension of Phase 1)  
**Tanggal**: Desember 2024

---

## 📋 Overview

Fitur Sort & Filter membantu admin mengelola banyak naskah dengan lebih efisien melalui:
- 🔍 **Real-time Search** - Cari naskah berdasarkan judul, pengarang, deskripsi, atau slug
- 📊 **Multi-criteria Sorting** - Urutkan berdasarkan display order, tanggal, judul, atau pengarang
- 🎯 **Smart Filtering** - Filter berdasarkan tipe pengarang dan ketersediaan sumber

---

## ✨ Features

### 1. 🔍 **Real-time Search**

**Lokasi:** Di atas daftar naskah (Admin Dashboard)

**Cara Pakai:**
1. Ketik di search bar
2. Hasil filter otomatis (no reload)
3. Klik ✕ untuk reset

**Search Scope:**
- Judul naskah
- Nama pengarang
- Deskripsi naskah
- Slug (ID unik)

**Contoh:**
```
Input: "wulan" → Hasil: Serat Wulangreh
Input: "ranggawarsita" → Hasil: Semua karya Ranggawarsita
Input: "purwalelana" → Hasil: Cariyos Purwalelana (by slug)
```

---

### 2. 📊 **Sort Options**

**Urutkan Berdasarkan:**

| Opsi | Deskripsi | Asc | Desc |
|------|-----------|-----|------|
| 🔢 Urutan Display | Sort by display_order | Terendah → Tertinggi | Tertinggi → Terendah |
| 📅 Tanggal Dibuat | Sort by created_at | Terlama → Terbaru | Terbaru → Terlama |
| 🔤 Judul | Sort by title | A → Z | Z → A |
| ✍️ Pengarang | Sort by author | A → Z | Z → A |

**Default:** Urutan Display (Desc) - Menampilkan naskah dengan urutan tertinggi di atas

**Cara Pakai:**
1. Pilih kriteria sort dari dropdown "Urutkan Berdasarkan"
2. Pilih arah sort (Asc/Desc) dari dropdown "Urutan"
3. List otomatis terupdate

---

### 3. 🎯 **Filter Options**

#### **👤 Filter Tipe Pengarang**

| Opsi | Deskripsi |
|------|-----------|
| 📖 Semua Tipe | Tampilkan semua naskah |
| ✏️ Custom (Nama Penulis) | Hanya naskah dengan nama pengarang custom |
| ❓ Tidak Diketahui | Hanya naskah dengan pengarang "Tidak Diketahui" |
| 👥 Banyak Penulis | Hanya naskah dengan pengarang "Banyak Penulis" |

**Use Case:**
- Lihat naskah yang butuh penelitian lebih lanjut (Tidak Diketahui)
- Audit naskah kolaboratif (Banyak Penulis)
- Review naskah dengan pengarang teridentifikasi (Custom)

#### **🔗 Filter Sumber**

| Opsi | Deskripsi |
|------|-----------|
| 🌐 Semua | Tampilkan semua naskah |
| ✅ Ada Sumber | Hanya naskah yang punya source_url |
| ❌ Tanpa Sumber | Hanya naskah tanpa source_url |

**Use Case:**
- Audit naskah yang sudah punya referensi sumber
- Identifikasi naskah yang butuh penambahan sumber

---

## 🎨 UI Components

### **Search Bar**
- Full-width input dengan icon 🔍
- Clear button (✕) untuk reset
- Placeholder: "Cari naskah (judul, pengarang, deskripsi, slug)..."

### **Sort & Filter Controls**
- Grid layout 3 kolom (responsive)
- Dropdown dengan emoji icons untuk clarity
- Reset button untuk clear semua filter

### **Active Filters Summary**
- Tampil saat ada filter aktif
- Badge untuk setiap filter aktif
- Background accent-50 untuk visibility

### **Results Counter**
```
📚 Daftar Naskah (5/9)
         Filtered ↑  ↑ Total
```

### **Empty State**
- 2 kondisi:
  1. **No manuscripts:** Tampil "Tambah Naskah" button
  2. **No results:** Tampil "Reset Filter" button

---

## 🧪 Testing Checklist

### Search Testing
- [ ] Search by title works
- [ ] Search by author works
- [ ] Search by description works
- [ ] Search by slug works
- [ ] Case-insensitive search works
- [ ] Clear button (✕) resets search
- [ ] Empty search shows all manuscripts

### Sort Testing
- [ ] Sort by Display Order (Desc) - default
- [ ] Sort by Display Order (Asc)
- [ ] Sort by Created Date (Newest first)
- [ ] Sort by Created Date (Oldest first)
- [ ] Sort by Title (A-Z)
- [ ] Sort by Title (Z-A)
- [ ] Sort by Author (A-Z)
- [ ] Sort by Author (Z-A)

### Filter Testing
- [ ] Filter: Semua Tipe → Shows all
- [ ] Filter: Custom → Only custom authors
- [ ] Filter: Tidak Diketahui → Only unknown authors
- [ ] Filter: Banyak Penulis → Only multiple authors
- [ ] Filter: Semua (Source) → Shows all
- [ ] Filter: Ada Sumber → Only with source_url
- [ ] Filter: Tanpa Sumber → Only without source_url

### Combined Testing
- [ ] Search + Sort works together
- [ ] Search + Filter works together
- [ ] Sort + Filter works together
- [ ] Search + Sort + Filter works together
- [ ] Reset button clears all filters
- [ ] Result counter accurate (X/Y format)
- [ ] Active filters summary displays correct badges

### Ordering with Filters
- [ ] ▲▼ buttons work with filtered results
- [ ] Ordering preserves after filter change
- [ ] Ordering buttons disabled correctly at boundaries

---

## 💻 Technical Implementation

### State Management
```javascript
const [sortBy, setSortBy] = useState('display_order');
const [sortOrder, setSortOrder] = useState('desc');
const [filterAuthorType, setFilterAuthorType] = useState('all');
const [filterSource, setFilterSource] = useState('all');
const [searchQuery, setSearchQuery] = useState('');
```

### Filter & Sort Logic
```javascript
const getFilteredAndSortedManuscripts = () => {
  let filtered = [...manuscripts];
  
  // 1. Apply Search
  // 2. Apply Author Type Filter
  // 3. Apply Source Filter
  // 4. Apply Sorting
  
  return filtered;
};

const filteredManuscripts = getFilteredAndSortedManuscripts();
```

### Reorder with Filtered List
```javascript
const handleReorder = async (index, direction) => {
  // Use filteredManuscripts[index] instead of manuscripts[index]
  const currentManuscript = filteredManuscripts[index];
  const targetManuscript = filteredManuscripts[targetIndex];
  
  await manuscriptService.reorder(currentManuscript.id, targetManuscript.id);
};
```

---

## 🗄️ Database Requirements

**No additional SQL needed!** Sort & Filter menggunakan kolom yang sudah ada:
- `display_order` (dari Phase 1 migration)
- `source_url` (dari Phase 1 migration)
- `title`, `author`, `description` (existing)
- `created_at` (existing)

**Pastikan sudah run:** `guide/PHASE1_DATABASE_MIGRATION.sql`

---

## 📦 Files Modified

- `src/pages/AdminDashboard.jsx`:
  - Added 5 new state variables for sort/filter
  - Added `getFilteredAndSortedManuscripts()` function
  - Updated `handleReorder()` to work with filtered list
  - Added Sort & Filter UI controls
  - Added Active Filters summary
  - Updated result counter to show filtered/total

---

## 🎯 Future Enhancements

**Possible improvements:**
1. **Bulk Actions** - Select multiple manuscripts for batch operations
2. **Advanced Filters** - Date range, character count range
3. **Save Filter Presets** - Quick access to common filter combinations
4. **Export Filtered List** - Download CSV/Excel of filtered results
5. **Filter by Knowledge Graph** - Filter manuscripts with/without auto-generated graphs

---

## 🐛 Known Issues & Limitations

**Current limitations:**
- Search is client-side (all data loaded, then filtered)
  - Fine for <100 manuscripts
  - For 1000+ manuscripts, consider server-side pagination
  
- Ordering buttons work within filtered view
  - Can only swap with adjacent items in filtered list
  - For full reorder, reset filters first

**No blocking issues** ✅

---

## 📞 Support

**Common Issues:**

**Q: Sort tidak work setelah reorder?**  
A: Refresh page (F5) untuk reload data dari database

**Q: Filter menghilangkan naskah yang baru ditambah?**  
A: Click "Reset Filter" untuk lihat semua naskah

**Q: Search tidak menemukan naskah?**  
A: Pastikan typo-free, search is case-insensitive tapi exact match

---

**Last Updated:** Desember 2024  
**Version:** 1.5 (Phase 1 Extension)
