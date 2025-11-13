# 📌 Pin Feature Guide - Nala Pustaka

## 🎯 Tujuan Fitur
Fitur **Pin** memungkinkan admin untuk menandai **maksimal 5 naskah unggulan** yang akan selalu ditampilkan di **Halaman 1** homepage. Ini memberikan kontrol editorial untuk highlight naskah terpenting.

---

## 📊 Cara Kerja

### Homepage Pagination Logic:
1. **Halaman 1**: Menampilkan 5 naskah yang di-pin (jika ada)
2. **Halaman 2+**: Menampilkan naskah non-pinned dengan pagination normal (5 per halaman)
3. **Search**: Tetap bekerja untuk pinned dan non-pinned manuscripts

### Database Schema:
```sql
-- Kolom baru di tabel manuscripts
is_pinned BOOLEAN DEFAULT false

-- Index untuk optimasi query
idx_manuscripts_pinned (is_pinned DESC, display_order DESC, created_at DESC)
```

### Business Rules:
- ✅ Maksimal **5 naskah** dapat di-pin sekaligus
- ✅ Pin/Unpin dilakukan di **Admin Dashboard** (`/admin/dashboard`)
- ✅ Naskah pinned selalu muncul di **halaman pertama** homepage
- ✅ Urutan dalam halaman pinned ditentukan oleh `display_order` (bisa diatur dengan tombol ▲▼)

---

## 🚀 Setup (Database Migration)

### Step 1: Jalankan SQL Migration
1. Buka **Supabase Dashboard** → **SQL Editor**
2. Copy script dari `guide/PIN_FEATURE_MIGRATION.sql`
3. Klik **Run** untuk execute
4. Verifikasi dengan query:
   ```sql
   SELECT column_name, data_type, column_default
   FROM information_schema.columns 
   WHERE table_name = 'manuscripts' AND column_name = 'is_pinned';
   ```
   Expected output:
   ```
   column_name | data_type | column_default
   is_pinned   | boolean   | false
   ```

### Step 2: Verifikasi Existing Data
```sql
-- Semua naskah seharusnya is_pinned = false setelah migration
SELECT title, is_pinned FROM manuscripts;
```

---

## 💡 Cara Menggunakan (Admin)

### 1. Pin Naskah
1. Login ke **Admin Dashboard** (`/admin/dashboard`)
2. Cari naskah yang ingin di-pin
3. Klik tombol **📍 Pin**
4. Naskah akan mendapat badge **📌 Pinned** (kuning)
5. ✅ Success message: "Naskah berhasil dipin!"

### 2. Unpin Naskah
1. Cari naskah yang sudah di-pin (ada badge **📌 Pinned**)
2. Klik tombol **📌 Unpin**
3. Badge hilang, naskah kembali ke daftar non-pinned
4. ✅ Success message: "Naskah berhasil diunpin!"

### 3. Batasan 5 Pinned Manuscripts
- Jika sudah ada **5 naskah pinned**, tombol Pin akan disabled untuk naskah lainnya
- Error message: "Maksimal 5 naskah dapat di-pin. Unpin naskah lain terlebih dahulu."
- Solusi: Unpin salah satu naskah yang sudah di-pin

### 4. Mengatur Urutan Naskah Pinned
- Gunakan tombol **▲▼** di Admin Dashboard untuk mengatur urutan `display_order`
- Urutan ini juga berlaku untuk naskah pinned di halaman 1
- **Display order lebih besar** = **lebih atas** dalam daftar

---

## 🎨 Visual Indicators

### Admin Dashboard:
- **Pinned Badge**: Kuning/amber gradient dengan border, teks "📌 Pinned"
- **Pin Button**: 
  - Unpin state: `📌 Unpin` (kuning/amber background)
  - Pin state: `📍 Pin` (gray background)
- **Hover tooltip**: Menjelaskan fungsi pin/unpin

### Homepage:
- **Pinned Badge**: Icon 📌 kecil di sebelah judul naskah
- **Page Info**: 
  - Halaman 1: "Halaman 1 (Naskah Unggulan) - X dari Y pinned"
  - Halaman 2+: "Halaman X - Y naskah"

---

## 📖 User Experience Flow

### Skenario 1: User Membuka Homepage
```
User → Homepage (nalapustaka.org)
↓
Halaman 1 ditampilkan
↓
Melihat 5 naskah unggulan (pinned)
↓
Klik "Next ▶" untuk lihat naskah lainnya
↓
Halaman 2 → Naskah non-pinned mulai muncul
```

### Skenario 2: Admin Pin Naskah Baru
```
Admin → Login → Admin Dashboard
↓
Lihat daftar naskah
↓
Klik "📍 Pin" pada naskah yang diinginkan
↓
✅ Success: "Naskah berhasil dipin!"
↓
Naskah mendapat badge "📌 Pinned"
↓
User di homepage → Refresh → Naskah muncul di halaman 1
```

### Skenario 3: Admin Sudah Pin 5 Naskah (Max Limit)
```
Admin → Klik "📍 Pin" pada naskah ke-6
↓
❌ Error: "Maksimal 5 naskah dapat di-pin..."
↓
Admin → Unpin salah satu naskah lama
↓
Admin → Pin naskah baru
↓
✅ Success
```

---

## 🔧 Technical Implementation

### File Changes:
1. **`guide/PIN_FEATURE_MIGRATION.sql`**: Database migration script
2. **`src/lib/supabase.js`**: 
   - `togglePin(manuscriptId)`: Toggle pin status with validation
   - `getPinnedCount()`: Get current pinned manuscripts count
3. **`src/pages/AdminDashboard.jsx`**:
   - `handleTogglePin()`: Pin/unpin handler
   - Pin button UI dengan conditional styling
   - Pinned badge indicator
4. **`src/App.jsx`** (LeftPanel component):
   - Separate `pinnedManuscripts` and `nonPinnedManuscripts`
   - Page 1 logic: Show pinned only
   - Page 2+ logic: Show non-pinned with pagination
   - Updated page info display

### API Methods (Supabase):

```javascript
// Toggle pin status
await manuscriptService.togglePin(manuscriptId);

// Get pinned count
const count = await manuscriptService.getPinnedCount();

// Example usage in admin dashboard
const handleTogglePin = async (id, currentPinStatus, title) => {
  try {
    await manuscriptService.togglePin(id);
    const action = currentPinStatus ? 'diunpin' : 'dipin';
    setFormSuccess(`✅ "${title}" berhasil ${action}!`);
    await loadManuscripts();
  } catch (error) {
    setFormError(error.message);
  }
};
```

### Frontend Logic (Homepage):

```javascript
// Separate pinned and non-pinned
const pinnedManuscripts = manuscripts.filter(m => m.is_pinned === true);
const nonPinnedManuscripts = manuscripts.filter(m => m.is_pinned !== true);

// Page 1: Show pinned (max 5)
if (currentPage === 1) {
  displayManuscripts = pinnedManuscripts.slice(0, 5);
}

// Page 2+: Show non-pinned with pagination
else {
  const nonPinnedPage = currentPage - 1;
  const startIndex = (nonPinnedPage - 1) * itemsPerPage;
  displayManuscripts = nonPinnedManuscripts.slice(startIndex, startIndex + itemsPerPage);
}
```

---

## ✅ Testing Checklist

### Database Testing:
- [ ] Run migration SQL successfully
- [ ] Verify `is_pinned` column exists with default `false`
- [ ] Verify index `idx_manuscripts_pinned` created
- [ ] Check all existing manuscripts have `is_pinned = false`

### Admin Dashboard Testing:
- [ ] Pin 1 naskah → Badge muncul ✅
- [ ] Pin 5 naskah total → Semua berhasil ✅
- [ ] Coba pin naskah ke-6 → Error message muncul ❌
- [ ] Unpin 1 naskah → Badge hilang ✅
- [ ] Pin naskah lagi setelah unpin → Berhasil ✅
- [ ] Refresh page → Status pin tetap tersimpan ✅

### Homepage Testing:
- [ ] Halaman 1 → Tampilkan naskah pinned (max 5) ✅
- [ ] Halaman 1 tanpa pinned → Message "Belum ada naskah unggulan" ✅
- [ ] Halaman 2+ → Tampilkan naskah non-pinned ✅
- [ ] Badge 📌 muncul di naskah pinned ✅
- [ ] Search → Bekerja untuk pinned dan non-pinned ✅
- [ ] Pagination → Reset ke halaman 1 saat search ✅

### Edge Cases:
- [ ] Pin 5 naskah, lalu unpin semua → Halaman 1 kosong dengan message ✅
- [ ] Search naskah pinned → Muncul di hasil pencarian ✅
- [ ] Search dengan 0 hasil → Message "Tidak ada naskah yang cocok" ✅
- [ ] Urutan naskah pinned sesuai `display_order` ✅

---

## 🐛 Troubleshooting

### Error: "Could not find the 'is_pinned' column"
**Cause**: Migration belum dijalankan
**Solution**: 
1. Buka Supabase SQL Editor
2. Run `PIN_FEATURE_MIGRATION.sql`
3. Refresh aplikasi

### Error: "Maksimal 5 naskah dapat di-pin"
**Cause**: Sudah ada 5 naskah pinned
**Solution**: 
1. Unpin salah satu naskah lama
2. Pin naskah baru

### Naskah Pinned Tidak Muncul di Halaman 1
**Cause**: Cache atau data tidak ter-refresh
**Solution**: 
1. Hard refresh browser (Ctrl+Shift+R)
2. Check di Admin Dashboard apakah badge "📌 Pinned" ada
3. Verifikasi di database:
   ```sql
   SELECT title, is_pinned FROM manuscripts WHERE is_pinned = true;
   ```

### Urutan Naskah Pinned Tidak Sesuai
**Cause**: `display_order` belum diatur
**Solution**: 
1. Gunakan tombol ▲▼ di Admin Dashboard
2. Set `display_order` manual via SQL:
   ```sql
   UPDATE manuscripts SET display_order = 100 WHERE title = 'Naskah Utama';
   UPDATE manuscripts SET display_order = 90 WHERE title = 'Naskah Kedua';
   ```

---

## 📈 Performance Considerations

### Database Optimization:
- **Index**: `idx_manuscripts_pinned` mempercepat query untuk pinned manuscripts
- **Query Efficiency**: Filter `is_pinned = true` di database, bukan di frontend
- **Cache**: Supabase client cache query results

### Frontend Optimization:
- **Pagination**: Hanya load 5 items per page (tidak semua manuscripts)
- **Conditional Rendering**: Badge pinned hanya render jika `is_pinned = true`
- **State Management**: Minimize re-renders dengan proper state update

### Expected Performance:
- **Database query**: < 50ms (with index)
- **Pin toggle**: < 200ms (1 update query)
- **Homepage load**: < 300ms (fetch + render)

---

## 🔮 Future Enhancements

### Possible Features:
1. **Pin Order Control**: Drag-and-drop untuk mengatur urutan naskah pinned
2. **Pin Expiry**: Auto-unpin setelah X hari (untuk konten seasonal)
3. **Pin Analytics**: Track berapa kali naskah pinned diklik
4. **Bulk Pin**: Pin multiple naskah sekaligus (dengan validation)
5. **Pin Categories**: Pin berdasarkan kategori (misalnya: "Naskah Populer", "Naskah Terbaru")

### API Extensions:
```javascript
// Bulk pin (future)
await manuscriptService.bulkPin([id1, id2, id3]);

// Get pinned manuscripts ordered by display_order (future)
await manuscriptService.getPinned();

// Analytics (future)
await manuscriptService.getPinAnalytics(manuscriptId);
```

---

## 📚 Related Documentation
- **Database Migration**: `guide/PIN_FEATURE_MIGRATION.sql`
- **Phase 1 Features**: `guide/PHASE_1_FEATURES.md`
- **Admin Panel Guide**: `guide/CARA_PAKAI_ADMIN_PANEL.md`
- **Supabase Integration**: `guide/INTEGRASI_DATABASE.md`

---

## 🎯 Summary

Fitur Pin memberikan kontrol editorial untuk:
- ✅ Highlight 5 naskah unggulan di halaman pertama
- ✅ Meningkatkan discovery untuk naskah terpenting
- ✅ Memberikan pengalaman kurasi konten yang profesional
- ✅ Memisahkan konten featured vs regular content

**Admin dapat dengan mudah mengelola naskah unggulan tanpa coding!** 🚀
