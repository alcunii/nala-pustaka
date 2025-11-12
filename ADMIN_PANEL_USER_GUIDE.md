# 🎯 Quick Guide: Menggunakan Admin Panel

## 🚀 Untuk Admin/Content Manager (Non-Technical)

### Akses Admin Panel

1. **Buka URL**:
   ```
   https://nalapustaka.org/admin
   ```

2. **Login** dengan email & password yang diberikan administrator

3. **Dashboard** akan terbuka dengan daftar naskah

---

## ➕ Menambah Naskah Baru

### Step 1: Klik "Tambah Naskah Baru"

### Step 2: Isi Form

| Field | Wajib? | Contoh | Keterangan |
|-------|--------|--------|------------|
| **Judul Naskah** | ✅ | Serat Tripama | Nama lengkap naskah |
| **Slug** | ❌ | tripama | Auto-generated dari judul (bisa dikosongkan) |
| **Pengarang** | ✅ | Ranggawarsita | Nama penulis naskah |
| **Deskripsi Singkat** | ❌ | Tiga teladan utama... | 1-2 kalimat deskripsi |
| **Isi Lengkap Naskah** | ✅ | PUPUH I: ... | Copy-paste isi lengkap dari Word/PDF |

### Step 3: Klik "Tambah Naskah"

✅ **Naskah langsung muncul di website!** (No coding, no Git, no deploy manual)

---

## ✏️ Edit Naskah

1. Scroll ke daftar naskah
2. Klik tombol **"✏️ Edit"** pada naskah yang ingin diubah
3. Form akan terbuka dengan data existing
4. Edit yang perlu
5. Klik **"💾 Update Naskah"**

---

## 🗑️ Hapus Naskah

1. Klik tombol **"🗑️ Hapus"** pada naskah yang ingin dihapus
2. Konfirmasi di pop-up
3. Naskah langsung terhapus dari website

---

## 💡 Tips

### ✅ Saat Menyalin Text:

1. **Dari PDF**:
   - Buka PDF → Select All (Ctrl+A) → Copy (Ctrl+C)
   - Paste di Notepad dulu (bersihkan formatting)
   - Copy lagi dari Notepad → Paste ke form

2. **Dari Word**:
   - Copy text dari Word
   - Paste ke Notepad (bersihkan)
   - Copy dari Notepad → Paste ke form

3. **Bersihkan**:
   - Hapus header/footer yang tidak perlu
   - Hapus nomor halaman
   - Pastikan struktur Pupuh/Bab jelas

### ✅ Panjang Text:

- **Ideal**: 1,000 - 10,000 kata
- **Maksimal**: ~20,000 kata (untuk performa optimal)
- Terlalu panjang → Chat AI jadi lambat

### ✅ Format Text:

```
PUPUH I: PANGKUR

1. Baris pertama...
2. Baris kedua...

PUPUH II: SINOM

1. ...
```

Bebas gunakan format apa saja yang jelas & terstruktur.

---

## ❓ Troubleshooting

**Q: Form error "Slug already exists"**
→ Ubah slug manual, buat unik (contoh: tripama-2, tripama-new)

**Q: Naskah tidak muncul di website**
→ Refresh browser (Ctrl+F5), tunggu 10 detik

**Q: Login gagal**
→ Check email/password, hubungi administrator

**Q: Lupa password**
→ Hubungi administrator untuk reset

---

## 🔒 Keamanan

- ✅ Hanya user yang login bisa tambah/edit/hapus
- ✅ User biasa (tidak login) hanya bisa lihat & chat
- ✅ Password di-encrypt otomatis
- ✅ Session auto-logout setelah beberapa jam

---

## 🎉 Workflow Ideal

```
Pagi:
1. Login ke admin panel
2. Tambah 2-3 naskah baru
3. Logout

Siang:
→ User di website langsung bisa lihat & chat dengan naskah baru!

Sore:
1. Login lagi
2. Cek feedback user (via email/chat)
3. Edit/perbaiki naskah jika perlu
4. Logout
```

**Total waktu per naskah: ~5-10 menit** ⏱️

---

## 📞 Butuh Bantuan?

**Untuk Admin/Developer**:
- Setup guide: `SETUP_ADMIN_PANEL.md`
- Technical docs: `TECHNICAL_DOC.md`

**Untuk Content Manager**:
- File ini cukup! 😊
- Hubungi administrator jika ada masalah

---

**Happy Publishing! 📚✨**
