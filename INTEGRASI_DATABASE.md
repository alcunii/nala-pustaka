# 🔄 Integrasi Database ke Halaman Utama

## 📝 Yang Sudah Saya Lakukan

Saya telah **mengintegrasikan Supabase database** dengan halaman utama website. Sekarang naskah yang Anda tambahkan via admin panel **otomatis muncul** di homepage!

---

## ✨ Cara Kerjanya

### 1. **Fetch Data dari Supabase**
Saat halaman utama dibuka, website akan:
```javascript
// src/App.jsx
useEffect(() => {
  loadManuscripts(); // Fetch dari Supabase
}, []);
```

### 2. **Fallback ke Hardcoded Data**
Jika Supabase gagal/kosong, website tetap berfungsi dengan data hardcoded:
- ✅ Serat Wulangreh
- ✅ Serat Centhini
- ✅ Kalatidha
- ✅ Wedhatama

### 3. **Real-time Update**
Setiap kali Anda:
- ➕ Tambah naskah baru di admin panel
- ✏️ Edit naskah existing
- 🗑️ Hapus naskah

Maka:
1. **Refresh halaman utama** → Naskah baru langsung muncul!
2. User bisa **chat dengan naskah baru** via AI

---

## 🎯 Testing

### Test 1: Tambah Naskah Baru
1. Buka http://localhost:5173/admin
2. Login dengan email admin Anda
3. Klik "➕ Tambah Naskah Baru"
4. Isi form:
   - **Judul**: Serat Tripama
   - **Pengarang**: Pakubuwana IV
   - **Deskripsi**: Ajaran kepemimpinan melalui 3 tokoh teladan
   - **Isi Lengkap**: [Copy-paste teks Tripama]
5. Klik "➕ Tambah Naskah"
6. **Refresh homepage** (http://localhost:5173)
7. ✅ Tripama muncul di daftar naskah!

### Test 2: Chat dengan Naskah Baru
1. Klik naskah "Serat Tripama" di homepage
2. Ketik pertanyaan: "Siapa saja tiga tokoh teladan dalam Tripama?"
3. ✅ AI akan menjawab berdasarkan isi naskah Tripama dari database!

---

## 🔄 Workflow Lengkap

```
Admin Panel (/admin/dashboard)
         ↓
    [Tambah Naskah]
         ↓
  Supabase Database (manuscripts table)
         ↓
    [Auto-fetch]
         ↓
Homepage (/) - Daftar Naskah Update
         ↓
  User pilih naskah → Chat AI
         ↓
AI baca full_text dari database → Jawab pertanyaan
```

---

## 📊 Data Flow

### Di Admin Panel:
```javascript
// src/pages/AdminDashboard.jsx
manuscriptService.create({
  slug: 'tripama',
  title: 'Serat Tripama',
  author: 'Pakubuwana IV',
  description: 'Ajaran kepemimpinan...',
  full_text: 'PUPUH I: SINOM...'
});
// ✅ Data tersimpan di Supabase
```

### Di Homepage:
```javascript
// src/App.jsx
const manuscripts = await manuscriptService.getAll();
// ✅ Fetch semua naskah dari Supabase
// ✅ Display di daftar naskah (kiri & mobile scroll)
```

### Di Chat AI:
```javascript
// src/App.jsx - ChatPanel
const context = `
Naskah: ${manuscript.title}
Pengarang: ${manuscript.author}
Isi lengkap:
${manuscript.full_text}
`;
// ✅ AI gunakan full_text dari database untuk menjawab
```

---

## 🛡️ Keamanan `.env.local`

### ✅ Sudah Aman!
File `.env.local` **TIDAK AKAN** ter-push ke GitHub karena sudah ada di `.gitignore`:

```gitignore
# .gitignore
.env
.env.local
.env.production
```

### Penjelasan:
- **`.env.local`** → Hanya di komputer Anda (development)
- **Vercel Environment Variables** → Untuk production (set manual di dashboard)
- **`.gitignore`** → Cegah file sensitive ter-push ke GitHub

### Cara Verifikasi:
```bash
git status
# ✅ .env.local TIDAK muncul di "Changes to be committed"
```

---

## 🚀 Deploy ke Production

Saat Anda push ke GitHub, `.env.local` **tidak ikut**. 

Untuk production (nalapustaka.org):

### 1. Tambahkan Environment Variables di Vercel:
1. Buka https://vercel.com → Project `nala-pustaka`
2. Settings → Environment Variables
3. Tambahkan 2 variables:
   ```
   VITE_SUPABASE_URL = https://eosclaiinbnebgrjsgsp.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGci...
   ```
4. Pilih **Production, Preview, Development** (all environments)
5. Save

### 2. Push ke GitHub:
```bash
git add .
git commit -m "feat: Integrate Supabase with homepage"
git push origin main
```

### 3. Vercel Auto-Deploy:
- ✅ Vercel deteksi push → build → deploy
- ✅ Environment variables dari dashboard ter-inject
- ✅ Website live dengan database integration!

---

## 🔍 Troubleshooting

### ❌ "Naskah baru tidak muncul di homepage"
**Penyebab**:
- Lupa refresh browser
- Database belum tersimpan (cek Supabase dashboard)

**Solusi**:
1. Refresh browser (Ctrl+R / Cmd+R)
2. Cek Supabase → Table Editor → manuscripts
3. Pastikan naskah ada di database

---

### ❌ "AI tidak bisa jawab tentang naskah baru"
**Penyebab**:
- `full_text` kosong atau terlalu pendek
- AI tidak dipilih naskahnya dulu

**Solusi**:
1. Pastikan `full_text` terisi lengkap (min. 500 kata)
2. **Klik naskah** di homepage dulu sebelum chat
3. Tunggu view berubah ke "💬 Chat"

---

### ❌ "Loading naskah lama terus"
**Penyebab**:
- Supabase credentials salah
- Network error

**Solusi**:
1. Cek console browser (F12) → lihat error
2. Cek `.env.local` → pastikan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` benar
3. Restart dev server: `npm run dev`

---

## 📈 Next Steps

### Fitur yang Bisa Ditambahkan:
1. **Search naskah** - Cari by judul/pengarang
2. **Filter by kategori** - Piwulang, Babad, Suluk, dll.
3. **Auto-refresh** - Realtime update tanpa refresh manual (Supabase Realtime)
4. **Knowledge Graph dari DB** - Generate graph otomatis dari database

### Untuk Saat Ini:
✅ **Integrasi sudah jalan** - Tambah naskah via admin → muncul di homepage
✅ **Aman** - `.env.local` tidak ter-push ke GitHub
✅ **Fallback** - Kalau Supabase error, website tetap jalan dengan data hardcoded

---

## 🎉 Summary

**Cara Menambahkan Naskah Baru:**
1. Login admin panel (/admin)
2. Tambah naskah baru
3. **Refresh homepage** (/)
4. ✅ Naskah muncul di daftar
5. ✅ User bisa chat dengan AI tentang naskah tersebut

**Keamanan:**
- ✅ `.env.local` sudah di `.gitignore`
- ✅ Tidak akan ter-push ke GitHub
- ✅ Aman untuk development lokal

**Deploy:**
- Saat push ke GitHub, set env vars di Vercel dashboard
- Website production akan fetch dari Supabase yang sama

---

**Silakan test sekarang! Refresh homepage dan lihat naskah "Serat Tatacara" yang baru Anda tambahkan! 🚀**
