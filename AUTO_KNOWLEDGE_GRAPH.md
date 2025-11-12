# 🔮 Auto-Generate Knowledge Graph

Knowledge graph sekarang **otomatis dibuat** saat Anda menambahkan naskah baru via admin panel!

---

## ✨ Fitur Baru

### 🤖 AI-Powered Knowledge Graph Generation
Saat Anda tambah naskah baru, sistem akan:
1. ✅ Analisis teks naskah menggunakan **Gemini AI**
2. ✅ Extract tokoh, konsep, dan struktur penting
3. ✅ Generate nodes dan links secara otomatis
4. ✅ Simpan ke database dalam format JSON

---

## 🎯 Cara Kerja

### Workflow Otomatis:

```
Admin Panel → Tambah Naskah
       ↓
Isi form (title, author, full_text)
       ↓
Klik "Tambah Naskah"
       ↓
[Auto-Process]
  1. Generate slug dari title
  2. Call Gemini API
  3. AI analisis 500 karakter pertama
  4. Extract nodes (max 10)
  5. Create links antar nodes
       ↓
Save ke Supabase (dengan knowledge_graph)
       ↓
Homepage → Knowledge Graph muncul otomatis!
```

---

## 📊 Contoh Output AI

### Input:
```
Title: Serat Tripama
Author: Pakubuwana IV
Full Text: "Pupuh I mengajarkan tentang tiga tokoh teladan..."
```

### Output AI (JSON):
```json
{
  "nodes": [
    {"id": "tripama", "label": "Serat Tripama", "type": "Karya"},
    {"id": "pakubuwana-iv", "label": "Pakubuwana IV", "type": "Tokoh"},
    {"id": "tiga-teladan", "label": "Tiga Teladan", "type": "Konsep"},
    {"id": "kepemimpinan", "label": "Kepemimpinan", "type": "Konsep"}
  ],
  "links": [
    {"source": "pakubuwana-iv", "target": "tripama", "label": "Menulis"},
    {"source": "tripama", "target": "tiga-teladan", "label": "Membahas"},
    {"source": "tiga-teladan", "target": "kepemimpinan", "label": "Mengajarkan"}
  ]
}
```

### Visualisasi:
```
Pakubuwana IV → (Menulis) → Serat Tripama
                                  ↓ (Membahas)
                            Tiga Teladan
                                  ↓ (Mengajarkan)
                            Kepemimpinan
```

---

## 🧪 Testing

### Test 1: Tambah Naskah Baru dengan Auto-Graph

1. **Login ke Admin Panel**
   - http://localhost:5173/admin

2. **Klik "➕ Tambah Naskah Baru"**

3. **Isi Form**:
   ```
   Judul: Serat Tripama
   Pengarang: Pakubuwana IV
   Deskripsi: Ajaran kepemimpinan
   Isi Lengkap: [paste teks lengkap]
   ```

4. **Klik "➕ Tambah Naskah"**

5. **Tunggu Loading**:
   ```
   🔄 Generating knowledge graph...
   ⏳ Menyimpan...
   ✅ Naskah berhasil ditambahkan dengan knowledge graph!
   ```

6. **Refresh Homepage** → Klik naskah baru

7. **Klik "🔮 Graph"**

8. ✅ **Knowledge graph muncul otomatis!**
   - Nodes: Karya, Tokoh, Konsep
   - Links: Relasi antar nodes
   - Warna berbeda per kategori

---

## 🎨 Kategori Nodes

### 1. **Karya** (Golden Brown - #B7966B)
- Judul naskah itu sendiri
- Contoh: "Serat Wulangreh", "Serat Tripama"

### 2. **Tokoh** (Bright Gold - #E6B800)
- Pengarang, tokoh dalam cerita
- Contoh: "Pakubuwana IV", "Ranggawarsita"

### 3. **Konsep** (Rich Brown - #6B5744)
- Tema, ajaran, nilai filosofis
- Contoh: "Ajaran Moral", "Kepemimpinan"

### 4. **Struktur** (Light Golden - #C9A87B)
- Pupuh, bagian struktural
- Contoh: "Pupuh Dhandhanggula", "Pupuh Sinom"

---

## 🔧 Technical Details

### File yang Dimodifikasi:

#### 1. `src/pages/AdminDashboard.jsx`
```javascript
// Fungsi baru: generateKnowledgeGraph()
const generateKnowledgeGraph = async (title, author, fullText) => {
  // Call Gemini API
  // Extract nodes dan links
  // Return JSON
};

// Update handleSubmit()
const handleSubmit = async (e) => {
  // Auto-generate graph untuk naskah baru
  const knowledgeGraph = await generateKnowledgeGraph(...);
  
  // Save dengan knowledge_graph field
  await manuscriptService.create({
    ...formData,
    knowledge_graph: knowledgeGraph
  });
};
```

#### 2. `src/App.jsx`
```javascript
// Update KnowledgeGraphPanel
const getKnowledgeGraphData = (manuscriptObj) => {
  // Priority: database > hardcoded
  if (manuscriptObj.knowledge_graph) {
    return manuscriptObj.knowledge_graph;
  }
  // Fallback ke KNOWLEDGE_GRAPH_DATA
};
```

---

## ⚠️ Fallback Mechanism

### Jika AI Gagal Generate:
Sistem akan create **minimal graph** dengan:
- 1 Node: Judul naskah (Karya)
- 1 Node: Pengarang (Tokoh)
- 1 Link: Pengarang → Menulis → Naskah

### Jika Gemini API Key Kosong:
- Warning di console
- Graph tetap dibuat dengan fallback minimal
- Naskah tetap tersimpan

---

## 📈 Batasan AI

### Yang AI Extract:
- ✅ 500 karakter pertama dari full_text
- ✅ Maksimal 8-10 nodes
- ✅ Nodes dikategorikan otomatis
- ✅ Links dengan label relasi

### Yang TIDAK Di-Extract:
- ❌ Seluruh teks (terlalu panjang untuk prompt)
- ❌ Detail pupuh per pupuh (butuh manual)
- ❌ Relasi kompleks multi-layer

### Solusi untuk Graph Kompleks:
- Gunakan AI untuk draft awal
- Edit manual via Supabase dashboard (Table Editor)
- Update field `knowledge_graph` (JSONB)

---

## 🛠️ Cara Edit Knowledge Graph Manual

### Via Supabase Dashboard:

1. **Buka Supabase** → Table Editor → `manuscripts`

2. **Pilih naskah** yang ingin diedit

3. **Klik field `knowledge_graph`**

4. **Edit JSON**:
   ```json
   {
     "nodes": [
       {"id": "new-node", "label": "Node Baru", "type": "Konsep"}
     ],
     "links": [
       {"source": "node-a", "target": "new-node", "label": "Relasi Baru"}
     ]
   }
   ```

5. **Save** → Refresh homepage → Graph updated!

---

## 🔍 Troubleshooting

### ❌ "Knowledge graph kosong"
**Penyebab**:
- Gemini API error
- Teks terlalu pendek (< 100 karakter)
- AI tidak menemukan entitas

**Solusi**:
- Cek console browser (F12) untuk error
- Pastikan `full_text` minimal 200 kata
- Edit manual via Supabase

---

### ❌ "Generating knowledge graph... stuck"
**Penyebab**:
- Gemini API slow/timeout
- Network error

**Solusi**:
- Tunggu 10-15 detik
- Jika timeout, naskah tetap tersimpan dengan minimal graph
- Refresh dan cek di homepage

---

### ❌ Graph tidak muncul di homepage
**Penyebab**:
- Browser cache
- Data belum refresh

**Solusi**:
- Hard refresh (Ctrl+Shift+R)
- Cek Supabase dashboard → pastikan `knowledge_graph` ada
- Re-generate dengan edit naskah

---

## 📝 Format JSON Knowledge Graph

### Structure:
```typescript
{
  nodes: [
    {
      id: string,        // Unique ID (lowercase, no space)
      label: string,     // Display name
      type: "Karya" | "Tokoh" | "Konsep" | "Struktur"
    }
  ],
  links: [
    {
      source: string,    // ID node sumber
      target: string,    // ID node tujuan
      label: string      // Label relasi
    }
  ]
}
```

### Validation Rules:
- `id` harus unique per node
- `source` dan `target` harus match dengan `id` di `nodes`
- `type` harus salah satu dari 4 kategori
- Minimal 1 node, links bisa kosong

---

## 🚀 Next Steps

### Fitur yang Bisa Ditambahkan:

1. **Re-generate Graph Button**
   - Tombol di admin panel untuk generate ulang
   - Berguna jika graph AI kurang bagus

2. **Visual Graph Editor**
   - Drag-and-drop nodes di UI
   - Add/edit/delete nodes via admin panel

3. **Multi-Layer Graph**
   - Analisis per pupuh
   - Nested relationships

4. **Export Graph**
   - Download JSON
   - Export sebagai image (PNG/SVG)

---

## 🎉 Summary

**Langkah Anda:**
1. ✅ Tambah naskah baru via admin panel
2. ✅ Fill form seperti biasa
3. ✅ Klik "Tambah Naskah"
4. ✅ **AI auto-generate knowledge graph** (10-15 detik)
5. ✅ Refresh homepage → Graph muncul otomatis!

**Tidak perlu:**
- ❌ Manual bikin nodes/links
- ❌ Edit JSON di code
- ❌ Push ke GitHub dulu

**Semuanya otomatis! 🎊**

---

**Silakan test sekarang dengan tambah naskah baru! Knowledge graph akan auto-generate! 🚀**
