# 🚀 Quick Start: Tambah Naskah Baru (5 Menit)

## Langkah Cepat

### 1. Edit File Data
Buka `src/data/manuscripts.js`

### 2. Copy Template Ini

```javascript
// Scroll ke baris ~65 di file manuscripts.js
// Uncomment template ini dan edit:

'tripama': {  // ← Ganti dengan ID naskah Anda (lowercase, no space)
  id: 'tripama',
  title: 'Serat Tripama',  // ← Judul lengkap
  author: 'Ranggawarsita',  // ← Nama pengarang
  description: 'Tiga teladan utama dalam kehidupan.',  // ← Deskripsi singkat
  fullText: `
PUPUH I: SINOM

Sinom sekar ageng warnane,
Rinonce mijil sasmitane,
Tripama kang ginurit,
Telu prakara kang utama,
Ing kene bakal kacipta,
Ing serat puniki,
Minangka tuladha.

[PASTE ISI LENGKAP NASKAH DI SINI]
[Bisa copy dari Word, PDF, atau text file]
[Maksimal ~10,000 kata untuk performa optimal]

PUPUH II: ...
PUPUH III: ...
  `  // ← Jangan lupa backtick tutup
},
```

### 3. Save File
Ctrl+S atau File → Save

### 4. Test
```bash
npm run dev
```

Buka browser → Lihat naskah baru muncul di list!

### 5. Deploy
```bash
git add .
git commit -m "feat: Add Serat Tripama"
git push origin main
```

## ✅ Checklist

- [ ] ID unik (lowercase, no space)
- [ ] Title, author, description diisi
- [ ] fullText minimal 100 kata (supaya AI punya konteks)
- [ ] Format teks bersih (no header/footer aneh)
- [ ] Test lokal dulu sebelum push

## 💡 Tips

**Format Text**:
- Boleh ada Pupuh/Bab/Paragraf
- Bisa pakai Unicode Jawa (ꦗꦮ)
- Newline dengan `\n` atau Enter biasa

**Troubleshooting**:
- Error syntax → Check backtick (`) jangan ada yang kurang
- Naskah gak muncul → Cek console browser (F12)
- AI jawab aneh → Pastikan fullText cukup panjang & jelas

## 🎓 Contoh Nyata

```javascript
'wedhatama': {
  id: 'wedhatama',
  title: 'Serat Wedhatama',
  author: 'KGPAA Mangkunegara IV',
  description: 'Ajaran tertinggi tentang kebijaksanaan hidup.',
  fullText: `PUPUH PANGKUR

Mingkar-mingkuring angkara,
Akarana karenan mardi siwi,
Sinawung resmining kidung,
Sinuba sinukarta,
Mrih kretarta pakartining ngelmu luhung,
Kang tumrap neng tanah Jawa,
Agama ageming aji.

[... rest of text ...]
  `
},
```

---

**Butuh bantuan?** Check `PANDUAN_DATASET.md` untuk opsi advanced (JSON, Database, Upload).
