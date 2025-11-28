# 📁 Folder Data Naskah

File ini berisi semua data naskah kuno Jawa yang digunakan di Nala Pustaka.

## 📄 File Structure

```
data/
  manuscripts.js    ← Data utama (Edit file ini untuk tambah naskah)
  README.md         ← File ini
```

## 🚀 Quick Add Naskah

### 1. Edit `manuscripts.js`

```javascript
// Scroll ke bawah file manuscripts.js
// Uncomment template dan edit:

'tripama': {
  id: 'tripama',
  title: 'Serat Tripama',
  author: 'Ranggawarsita',
  description: 'Tiga teladan utama dalam kehidupan.',
  fullText: `
PUPUH I

[PASTE ISI NASKAH LENGKAP DI SINI]

Maksimal ~10,000 kata untuk performa optimal.
Format bebas: Pupuh, Bab, atau Paragraf biasa.
  `
},
```

### 2. Tambah Knowledge Graph (Opsional)

```javascript
// Di bagian KNOWLEDGE_GRAPH_DATA:

'tripama': {
  nodes: [
    { id: 'tripama', label: 'Serat Tripama', type: 'Karya' },
    { id: 'rw', label: 'Ranggawarsita', type: 'Tokoh' },
    // ... tambahkan node lain
  ],
  links: [
    { source: 'rw', target: 'tripama', label: 'Pengarang' },
    // ... tambahkan relasi
  ]
},
```

### 3. Save & Test

```bash
npm run dev
```

Naskah baru langsung muncul di browser!

## 📊 Format Data

### Object Naskah

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | ID unik (lowercase, no space) |
| `title` | string | ✅ | Judul lengkap naskah |
| `author` | string | ✅ | Nama pengarang |
| `description` | string | ✅ | Deskripsi 1-2 kalimat |
| `fullText` | string | ✅ | Isi lengkap naskah (max ~10k kata) |

### Knowledge Graph

| Field | Type | Description |
|-------|------|-------------|
| `nodes` | array | Daftar konsep/tokoh (id, label, type) |
| `links` | array | Relasi antar nodes (source, target, label) |

**Node Types**:
- `'Karya'` → Warna Golden brown (#B7966B)
- `'Tokoh'` → Warna Bright gold (#E6B800)
- `'Konsep'` → Warna Rich brown (#6B5744)
- `'Struktur'` → Warna Light golden (#C9A87B)

## 💡 Best Practices

### ✅ DO:
- Gunakan UTF-8 encoding
- Bersihkan teks dari header/footer scan
- Test AI response setelah menambah naskah
- Backup file .txt original di folder terpisah

### ❌ DON'T:
- Jangan upload >50,000 kata (slow)
- Jangan lupa escape backtick (`) di dalam teks
- Jangan skip ID atau title (required)

## 🔮 Future Plans

Folder ini akan di-refactor untuk:
- [ ] JSON files per naskah (scalability)
- [ ] Auto-import dengan Vite glob
- [ ] Validation schema
- [ ] TypeScript types

## 📚 Dokumentasi

- **Quick Start**: `/QUICKSTART_ADD_MANUSCRIPT.md`
- **Full Guide**: `/PANDUAN_DATASET.md`
- **Summary**: `/CARA_TAMBAH_NASKAH.md`

---

**Kontribusi?** Tambahkan naskah baru dan buat PR! 🎉
