# 🎯 Summary: Cara Menambahkan Naskah Baru

## ✅ Apa yang Sudah Dibuat?

### 1. **Struktur Data Modular**
```
src/
  data/
    manuscripts.js  ← EDIT FILE INI untuk tambah naskah
  App.jsx           ← Auto-import dari manuscripts.js
```

### 2. **Dokumentasi Lengkap**
- ✅ `QUICKSTART_ADD_MANUSCRIPT.md` - Panduan 5 menit
- ✅ `PANDUAN_DATASET.md` - Panduan lengkap (Manual, JSON, Database, Upload)
- ✅ `README.md` - Updated dengan link dokumentasi

### 3. **Demo Naskah Baru**
- ✅ Serat Wedhatama ditambahkan sebagai contoh nyata
- ✅ Knowledge Graph untuk Wedhatama
- ✅ Total 4 naskah sekarang (Wulangreh, Centhini, Kalatidha, Wedhatama)

---

## 🚀 Cara Menambah Naskah (Quick Method)

### Step 1: Buka File
```bash
code src/data/manuscripts.js
```

### Step 2: Scroll ke Bawah, Copy Template
Di baris ~130, ada template:
```javascript
'nama-naskah': {
  id: 'nama-naskah',
  title: 'Judul Lengkap',
  author: 'Nama Pengarang',
  description: 'Deskripsi singkat...',
  fullText: `
[PASTE ISI NASKAH DI SINI]
  `
},
```

### Step 3: Edit & Paste Teks
- Ganti `'nama-naskah'` dengan ID unik (lowercase)
- Isi title, author, description
- Copy-paste teks lengkap naskah di `fullText`

### Step 4: Test & Deploy
```bash
npm run dev          # Test lokal
git add .
git commit -m "feat: Add [Nama Naskah]"
git push origin main # Auto deploy!
```

**Total waktu: ~5-10 menit** ⏱️

---

## 📚 Opsi Advanced (Future)

### Metode 2: JSON Files (20-100 Naskah)
```
src/data/manuscripts/
  wulangreh.json
  centhini.json
  naskah-baru.json  ← Buat file baru
```
Auto-load dengan Vite glob import.

### Metode 3: Database (>100 Naskah)
```
Supabase PostgreSQL
↓
Table: manuscripts
  - id, title, author, full_text
↓
Frontend fetch via API
```

### Metode 4: Upload Form
```
Admin Panel
↓
Upload .txt/.pdf
↓
Parse & save to DB
```

Semua workflow sudah didokumentasikan di `PANDUAN_DATASET.md`!

---

## 🎓 Contoh Nyata yang Sudah Ada

Lihat `src/data/manuscripts.js` baris 66-128 untuk contoh **Serat Wedhatama**:
- ID: `wedhatama`
- Pupuh Pangkur, Gambuh, Kinanthi
- Knowledge Graph sudah diset
- Langsung bisa dichat dengan AI! 🤖

---

## 💡 Tips untuk Dataset Berkualitas

### ✅ DO:
1. **Bersihkan teks** - Hapus header/footer scan
2. **Format konsisten** - Gunakan Pupuh/Bab yang jelas
3. **Encoding UTF-8** - Biar Unicode Jawa (ꦗꦮ) bisa tampil
4. **Test dulu** - Tanya AI soal isi naskah setelah upload
5. **Backup** - Simpan file .txt original

### ❌ DON'T:
1. Jangan upload teks >50,000 kata (slow API)
2. Jangan lupa escape backtick (`) kalau ada di teks
3. Jangan copy-paste dengan formatting aneh
4. Jangan skip knowledge graph (UX lebih baik kalau ada)

---

## 🔮 Workflow Harian (Rekomendasi)

### Untuk 1-20 Naskah (Saat Ini):
1. Download PDF naskah dari perpusnas/sastra.org
2. OCR jika perlu (Google Docs works)
3. Copy text → Edit `manuscripts.js`
4. Test lokal → Push → Deploy ✅

### Untuk 20+ Naskah (Future):
1. Setup Supabase (gratis)
2. Buat table `manuscripts`
3. Bulk import via SQL/CSV
4. Update frontend fetch dari DB

### Untuk Kolaborasi Team:
1. Buat branch baru per naskah
2. PR ke main setelah review
3. CI/CD auto-test & deploy

---

## 📞 Butuh Bantuan?

**Quick Start**: `QUICKSTART_ADD_MANUSCRIPT.md`
**Full Guide**: `PANDUAN_DATASET.md`
**Technical**: `TECHNICAL_DOC.md`

---

## 🎉 What's Next?

Coba tambahkan naskah favorit Anda sekarang!
Beberapa saran:
- Serat Tripama (Ranggawarsita)
- Serat Nitisruti (Yasadipura I)
- Babad Tanah Jawi
- Serat Rama
- Serat Yusup

**Setiap naskah yang ditambahkan = Pelestarian budaya Jawa! 🇮🇩**

---

Last updated: November 2025
Deployed at: https://nalapustaka.org
