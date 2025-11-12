# 📚 Panduan Menambahkan Dataset Naskah Baru

Dokumen ini menjelaskan cara menambahkan naskah kuno Jawa baru ke Nala Pustaka.

---

## 🎯 Metode 1: Edit Manual JavaScript (Termudah - Rekomendasi untuk <20 Naskah)

### Langkah-langkah:

#### 1. Siapkan Teks Naskah
- Copy teks lengkap naskah dari sumber (PDF, Word, atau teks)
- Format bebas: bisa pupuh, bab, paragraf
- **Penting**: Teks ini akan menjadi konteks untuk AI

#### 2. Edit File `src/data/manuscripts.js`

```javascript
// Tambahkan naskah baru di object MANUSCRIPT_DATA
'nitisruti': {
  id: 'nitisruti',                    // ID unik (lowercase, no space)
  title: 'Serat Nitisruti',          // Judul lengkap
  author: 'Yasadipura I',            // Nama pengarang
  description: 'Ajaran kebijaksanaan dan tata pemerintahan yang baik.',
  fullText: `PUPUH I

Ing mangke kang jinurung aneng bumi,
Nadyan kinarya parandene tanpa wilangan,
Amung kinarya ratu utama,
Ing sabrana kang utami,
...
[COPY-PASTE ISI LENGKAP NASKAH DI SINI]
...
  `
},
```

#### 3. Update Knowledge Graph (Opsional tapi Direkomendasikan)

```javascript
// Di object KNOWLEDGE_GRAPH_DATA, tambahkan:
'nitisruti': {
  nodes: [
    { id: 'nitisruti', label: 'Serat Nitisruti', type: 'Karya' },
    { id: 'yasadipura', label: 'Yasadipura I', type: 'Tokoh' },
    { id: 'niti', label: 'Kebijaksanaan', type: 'Konsep' },
    { id: 'raja', label: 'Kepemimpinan Raja', type: 'Konsep' },
  ],
  links: [
    { source: 'yasadipura', target: 'nitisruti', label: 'Pengarang' },
    { source: 'nitisruti', target: 'niti', label: 'Mengajarkan' },
    { source: 'nitisruti', target: 'raja', label: 'Membahas' },
  ]
},
```

#### 4. Update App.jsx untuk Import Data Baru

File `src/App.jsx` perlu diubah untuk import dari file terpisah.

#### 5. Test & Deploy
```bash
npm run dev        # Test lokal
git add .
git commit -m "feat: Add Serat Nitisruti"
git push origin main
```

---

## 🗄️ Metode 2: JSON Files (Untuk 20-100 Naskah)

### Struktur Folder:
```
src/
  data/
    manuscripts/
      wulangreh.json
      centhini.json
      kalatidha.json
      nitisruti.json  ← Tambah file baru
    index.js
```

### Format File JSON:

**`src/data/manuscripts/nitisruti.json`**
```json
{
  "id": "nitisruti",
  "title": "Serat Nitisruti",
  "author": "Yasadipura I",
  "description": "Ajaran kebijaksanaan dan tata pemerintahan yang baik.",
  "fullText": "PUPUH I\n\nIng mangke kang jinurung aneng bumi...",
  "knowledgeGraph": {
    "nodes": [
      { "id": "nitisruti", "label": "Serat Nitisruti", "type": "Karya" }
    ],
    "links": []
  }
}
```

### Kode Loader:

**`src/data/index.js`**
```javascript
// Auto-import semua JSON di folder manuscripts
const manuscriptModules = import.meta.glob('./manuscripts/*.json', { eager: true });

export const manuscripts = Object.values(manuscriptModules).reduce((acc, mod) => {
  const data = mod.default;
  acc[data.id] = data;
  return acc;
}, {});
```

### Cara Menambah Naskah:
1. Buat file baru `nama-naskah.json` di `src/data/manuscripts/`
2. Copy format dari file existing
3. Paste teks naskah di field `fullText`
4. Save & reload → otomatis muncul!

---

## 🗃️ Metode 3: Database (PostgreSQL/Supabase) - Untuk >100 Naskah

### Arsitektur:
```
Frontend (Vite)  →  Supabase (PostgreSQL)  →  Vercel Functions
                      ↓
                  Tabel: manuscripts
                  - id (uuid)
                  - title (text)
                  - author (text)
                  - description (text)
                  - full_text (text)
                  - created_at (timestamp)
```

### Setup Supabase (Free Tier):

1. **Buat Akun**: https://supabase.com
2. **Buat Project**: `nala-pustaka`
3. **Buat Tabel**: Jalankan SQL di Supabase SQL Editor

```sql
CREATE TABLE manuscripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  full_text TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_manuscripts_slug ON manuscripts(slug);

-- Insert contoh
INSERT INTO manuscripts (slug, title, author, description, full_text, metadata)
VALUES 
  ('wulangreh', 'Serat Wulangreh', 'Pakubuwana IV', 
   'Ajaran moral dan etika kepemimpinan Jawa.',
   'PUPUH I: DHANDHANGGULA\n\n1. Pamedhare wasitaning ati...',
   '{"year": 1768, "language": "Jawa Kuno"}'::jsonb
  );
```

4. **Install Supabase Client**:
```bash
npm install @supabase/supabase-js
```

5. **Buat File Config**:

**`src/lib/supabase.js`**
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

**`.env`**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

6. **Update App.jsx untuk Fetch dari Database**:

```javascript
import { supabase } from './lib/supabase';

function App() {
  const [manuscripts, setManuscripts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchManuscripts() {
      const { data, error } = await supabase
        .from('manuscripts')
        .select('*')
        .order('title');
      
      if (error) {
        console.error('Error:', error);
      } else {
        // Transform data ke format yang dibutuhkan
        const transformed = data.reduce((acc, item) => {
          acc[item.slug] = {
            id: item.slug,
            title: item.title,
            author: item.author,
            description: item.description,
            fullText: item.full_text
          };
          return acc;
        }, {});
        setManuscripts(transformed);
      }
      setLoading(false);
    }
    
    fetchManuscripts();
  }, []);

  // ... rest of code
}
```

### Cara Menambah Naskah via Database:

**Opsi A: Via Supabase Dashboard**
1. Login ke Supabase
2. Pilih project `nala-pustaka`
3. Table Editor → `manuscripts` → Insert row
4. Fill form → Save

**Opsi B: Via SQL**
```sql
INSERT INTO manuscripts (slug, title, author, description, full_text)
VALUES (
  'nitisruti',
  'Serat Nitisruti',
  'Yasadipura I',
  'Ajaran kebijaksanaan dan tata pemerintahan yang baik.',
  'PUPUH I\n\nIng mangke kang jinurung aneng bumi...'
);
```

**Opsi C: Via Admin Panel (Build Custom)**
Buat halaman admin di `/admin` dengan form upload.

---

## 📄 Metode 4: Upload File (TXT/PDF) - User Friendly

### Fitur Upload Naskah:

1. **Install Dependencies**:
```bash
npm install react-dropzone pdf-parse
```

2. **Buat Komponen Upload**:

**`src/components/ManuscriptUpload.jsx`**
```javascript
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export function ManuscriptUpload({ onUpload }) {
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    
    if (file.type === 'text/plain') {
      const text = await file.text();
      onUpload({
        title: file.name.replace('.txt', ''),
        fullText: text
      });
    } else if (file.type === 'application/pdf') {
      // Parse PDF (butuh server-side processing)
      // Atau gunakan PDF.js
    }
  }, [onUpload]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf']
    }
  });

  return (
    <div {...getRootProps()} className="border-2 border-dashed p-8 rounded-xl">
      <input {...getInputProps()} />
      <p>Drag & drop file naskah (.txt atau .pdf)</p>
    </div>
  );
}
```

---

## ✅ Rekomendasi Workflow Berdasarkan Skala

| Jumlah Naskah | Metode | Alasan |
|---------------|--------|--------|
| 1-10 | Manual JS | Paling cepat, no setup |
| 10-50 | JSON Files | Terstruktur, mudah manage |
| 50-500 | Supabase DB | Scalable, searchable |
| 500+ | Full Backend + Vector DB | RAG advanced, semantic search |

---

## 🎓 Workflow Harian (Metode Manual - Paling Mudah)

### Step-by-step Menambah 1 Naskah:

1. **Cari Teks Naskah**
   - Download dari sastra.org, perpusnas.go.id, dll
   - Atau scan → OCR

2. **Copy Teks**
   - Ctrl+A, Ctrl+C dari PDF/Word

3. **Edit `src/data/manuscripts.js`**
   - Scroll ke bawah
   - Uncomment template
   - Paste teks di `fullText`
   - Isi title, author, description

4. **Test Lokal**
   ```bash
   npm run dev
   # Buka localhost:5173
   # Cek naskah baru muncul
   ```

5. **Deploy**
   ```bash
   git add .
   git commit -m "feat: Add [Nama Naskah]"
   git push
   # Auto deploy ke nalapustaka.org
   ```

**Total waktu: ~10 menit per naskah**

---

## 💡 Tips & Best Practices

### ✅ DO:
- **Bersihkan teks**: Hapus header/footer dari scan
- **Konsisten formatting**: Pakai struktur Pupuh/Bab yang jelas
- **Test AI response**: Setelah upload, tanya AI soal isi naskah
- **Backup**: Simpan file TXT original di folder `/manuscripts-source/`

### ❌ DON'T:
- Jangan copy teks dengan encoding aneh (bisa error AI)
- Jangan upload naskah >50,000 kata (slow, cost API tinggi)
- Jangan lupa update knowledge graph (UX lebih baik)

---

## 🔮 Future: Vector Database + Semantic Search

Untuk **ratusan naskah**, pertimbangkan:

```
Naskah → Split chunks → Embedding (OpenAI/Gemini) → 
Pinecone/Weaviate → Semantic Search → RAG
```

**Keuntungan**:
- AI bisa jawab lintas naskah
- Search semantik ("cari naskah tentang cinta")
- Lebih scalable

**Stack**:
- Pinecone (Vector DB)
- LangChain (Orchestration)
- Gemini Embeddings

---

## 📞 Support

Butuh bantuan? Check:
- **README.md** - Setup project
- **TECHNICAL_DOC.md** - Arsitektur
- **GitHub Issues** - Report bugs

---

**Last Updated**: November 2025
