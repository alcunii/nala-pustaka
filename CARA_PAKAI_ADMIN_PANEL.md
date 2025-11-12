# 📘 Cara Pakai Admin Panel - Nala Pustaka

Panduan lengkap untuk menambah, edit, dan hapus naskah **tanpa coding**.

---

## 🚀 Akses Admin Panel

### 1. Buka Browser
Kunjungi salah satu:
- **Lokal** (development): http://localhost:5173/admin
- **Production**: https://nalapustaka.org/admin

### 2. Login
- Masukkan **email** dan **password** yang sudah dibuat di Supabase
- Klik **Masuk**

✅ Jika berhasil, Anda akan masuk ke **Dashboard**

---

## ➕ Menambah Naskah Baru

### Langkah-langkah:

1. **Klik tombol "➕ Tambah Naskah Baru"** (pojok kiri atas)
   
2. **Isi form**:
   - **Judul Naskah** ⭐ (wajib)
     - Contoh: `Serat Tripama`
   
   - **Slug** (opsional, auto-generated)
     - Jika dikosongkan, otomatis dibuat dari judul
     - Contoh: `tripama`, `kalatidha`
     - Harus unique, lowercase, no space
   
   - **Pengarang** ⭐ (wajib)
     - Contoh: `Ranggawarsita`
   
   - **Deskripsi Singkat** (opsional)
     - Contoh: `Ajaran moral tentang tiga teladan utama.`
   
   - **Isi Lengkap Naskah** ⭐ (wajib)
     - Copy-paste teks lengkap naskah
     - Format: Pupuh, nomor, teks
     - Contoh:
       ```
       PUPUH I: PANGKUR
       
       1. Mingkar-mingkuring angkara...
       2. Akarana karenan mardi siwi...
       ```

3. **Klik "➕ Tambah Naskah"**

4. **Tunggu konfirmasi**:
   - ✅ Hijau: "Naskah berhasil ditambahkan!"
   - ⚠️ Merah: Error, cek pesan kesalahan

5. **Form akan tertutup otomatis** setelah sukses

---

## ✏️ Mengedit Naskah

### Langkah-langkah:

1. **Scroll ke "Daftar Naskah"** (bagian bawah dashboard)

2. **Cari naskah yang ingin diedit**

3. **Klik tombol "✏️ Edit"** di kanan naskah

4. **Form akan muncul dengan data terisi**

5. **Ubah field yang ingin diubah**
   - Bisa ubah judul, pengarang, deskripsi, atau isi lengkap

6. **Klik "💾 Update Naskah"**

7. **Tunggu konfirmasi**:
   - ✅ "Naskah berhasil diupdate!"

8. **Refresh otomatis** di daftar naskah

---

## 🗑️ Menghapus Naskah

### Langkah-langkah:

1. **Scroll ke "Daftar Naskah"**

2. **Cari naskah yang ingin dihapus**

3. **Klik tombol "🗑️ Hapus"** di kanan naskah

4. **Konfirmasi popup**:
   - Popup: "Yakin ingin menghapus '[Judul Naskah]'?"
   - Klik **OK** untuk hapus
   - Klik **Cancel** untuk batal

5. **Tunggu konfirmasi**:
   - ✅ "Naskah berhasil dihapus!"

6. **Naskah hilang dari daftar**

⚠️ **Hati-hati**: Penghapusan **tidak bisa di-undo**!

---

## 🔍 Tips & Trik

### Format Teks yang Baik

**DO ✅**:
```
PUPUH I: DHANDHANGGULA

1. Pamedhare wasitaning ati,
   cumanthaka aniru pujangga,
   dahat mudha ing batine.

2. Nanging kedah ginunggung,
   datan kena den umbar,
   ...
```

**DON'T ❌**:
- Jangan pakai font color/formatting HTML
- Jangan pakai bullet points atau numbering otomatis
- Jangan copy dari Word/PDF (format rusak)

### Slug Best Practices

- ✅ **Good**: `tripama`, `wulangreh`, `kalatidha`
- ❌ **Bad**: `Tripama`, `Wulan Greh`, `kala-tidha-2024`

Slug digunakan untuk URL dan ID unik. Harus:
- Lowercase
- No space (pakai `-` jika perlu)
- No special character (kecuali `-`)
- Unique (tidak boleh sama dengan naskah lain)

### Auto-Save Tidak Ada

Form **tidak auto-save**. Pastikan:
- Klik "➕ Tambah" / "💾 Update" untuk simpan
- Jangan refresh browser sebelum submit
- Copy teks panjang ke notepad dulu (backup)

### Panjang Teks Maksimal

- **Recommended**: 5,000 - 10,000 kata per naskah
- **Maximum**: ~50,000 kata (database limit)
- Jika terlalu panjang, split jadi 2 naskah (Part 1, Part 2)

---

## 🚪 Logout

1. Klik tombol **"🚪 Logout"** (pojok kanan atas)
2. Anda akan kembali ke halaman login
3. Session habis, tidak bisa akses dashboard lagi sampai login ulang

---

## ❓ Troubleshooting

### ❌ "Login gagal"
**Penyebab**:
- Email/password salah
- User belum dibuat di Supabase
- Supabase credentials salah di `.env`

**Solusi**:
- Cek email/password (case-sensitive!)
- Buat user baru di Supabase dashboard (Authentication → Users)
- Cek `.env.local` atau Vercel env vars

---

### ❌ "Gagal menyimpan naskah"
**Penyebab**:
- Slug sudah dipakai
- Field wajib kosong (title, author, full_text)
- Koneksi database error

**Solusi**:
- Ganti slug ke yang unique
- Isi semua field bertanda ⭐
- Cek console browser (F12) untuk detail error

---

### ❌ Form tidak muncul setelah klik "Tambah"
**Penyebab**: JavaScript error

**Solusi**:
- Refresh browser (Ctrl+R / Cmd+R)
- Clear cache (Ctrl+Shift+Delete)
- Cek console browser (F12) → lihat error merah

---

### ❌ "Daftar Naskah" kosong padahal sudah tambah
**Penyebab**:
- Database belum ter-refresh
- RLS policy block access

**Solusi**:
- Refresh browser
- Cek Supabase dashboard → Table Editor → manuscripts
- Pastikan RLS policy sudah benar (Step 3.2 di SETUP_ADMIN_PANEL.md)

---

## 📊 Informasi Daftar Naskah

Setiap naskah menampilkan:
- **Judul** (bold, besar)
- **Pengarang** (warna primary)
- **Deskripsi** (jika ada)
- **Metadata**:
  - `ID: slug` → Slug/ID unik
  - `Tanggal` → Kapan naskah dibuat
  - `Karakter` → Panjang teks (char count)

---

## 🔒 Keamanan

✅ **Aman**:
- Password di-hash oleh Supabase (tidak plain text)
- Session token di browser (auto logout setelah expire)
- Row Level Security (RLS) → User hanya bisa edit naskah sendiri
- HTTPS di production

⚠️ **Jangan**:
- Share password ke orang lain
- Login di komputer publik tanpa logout
- Expose `.env.local` file (ada di `.gitignore`)

---

## 🎯 Next Steps

Setelah mahir menggunakan admin panel:
1. **Tambahkan semua naskah** yang Anda punya
2. **Test chatbot** di homepage dengan naskah baru
3. **Lihat knowledge graph** (otomatis update)
4. **Invite admin lain** (buat user baru di Supabase)

---

## 📞 Bantuan

Jika masih kesulitan:
1. **Cek SETUP_ADMIN_PANEL.md** → Panduan teknis lengkap
2. **Lihat browser console** (F12) → Error details
3. **Cek Supabase dashboard** → Table Editor, Authentication
4. **Contact developer** → [GitHub Issues](https://github.com/Alcunii/nala-pustaka/issues)

---

**Selamat mengelola naskah! 🎉**
