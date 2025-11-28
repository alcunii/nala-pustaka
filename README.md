# 📚 Nala Pustaka

**AI untuk Demokratisasi Kearifan Naskah Kuno Jawa**

Aplikasi web interaktif yang menggunakan AI (Google Gemini) dengan metodologi RAG (Retrieval-Augmented Generation) untuk membantu pengguna mengeksplorasi dan memahami naskah kuno Jawa. Dilengkapi dengan Admin Panel untuk manajemen naskah, Knowledge Graph untuk visualisasi konsep, dan dukungan Multi-bahasa.

![Nala Pustaka](https://img.shields.io/badge/React-19-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8) ![Gemini API](https://img.shields.io/badge/Gemini-2.5%20Flash%20Lite-orange) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue) ![Pinecone](https://img.shields.io/badge/Pinecone-Vector_DB-purple)

> 🎯 **Untuk Kiro IDE**: Repository ini sudah fully compatible! Lihat [`QUICK_START.md`](QUICK_START.md) untuk setup 2 menit. Semua config files sudah ada: `jsconfig.json`, ESLint, Prettier, Tailwind intellisense, dan debug config. ✅

> 🚀 **Live Demo**: [nalapustaka.org](https://nalapustaka.org)

---

## 🎉 Update Terbaru - November 2025

### 🌍 Phase 7: Global Reach & Intelligence (Current)

- ✅ **Multi-Language Support (i18n)**: Dukungan penuh Bahasa Indonesia (ID) dan English (EN) di seluruh aplikasi.
- ✅ **Gemini 2.5 Flash Lite**: Upgrade model AI ke versi terbaru yang lebih cepat, hemat biaya, dan akurat.
- ✅ **Advanced Catalog**: Filter canggih dengan Multi-select Tags, Kategori (10+ jenis), dan Sorting (A-Z, Z-A, Terbaru, Terlama).
- ✅ **Articles Section**: Halaman wawasan mendalam tentang teknologi dan filologi ("Digital Silence", "Philology Revolution").

### 🚀 Phase 4: Massive Data Pipeline

- ✅ **Massive Scraper**: Otomatis scrape 4,500+ naskah dari sastra.org
- ✅ **Intelligent Clustering**: Mengelompokkan 2,200+ naskah menjadi ~500 cluster bermakna
- ✅ **Auto-Description**: LLM membuat deskripsi otomatis untuk setiap cluster naskah
- ✅ **Vector Ingestion**: Pipeline otomatis ke Pinecone & Supabase

### ⚡ Phase 5: Optimization & Cost Control

- ✅ **Deep Chat Optimization**: 77% hemat token dengan semantic chunking & caching
- ✅ **Multi-Chat Optimization**: 40% hemat context window
- ✅ **Usage Tracking**: Monitor penggunaan token & biaya per user
- ✅ **Rate Limiting**: Proteksi API dengan tiered limits (Free/Premium)
- ✅ **Performance**: Response time lebih cepat dengan caching

### 🔄 Phase 6: PostgreSQL Migration

- ✅ **Migrasi dari Supabase ke PostgreSQL**: Hemat biaya, full control!
- ✅ **Self-hosted Database**: PostgreSQL lokal atau Docker
- ✅ **Educational Content Table**: Store AI-generated educational content
- ✅ **Manuscript Relationships**: Store knowledge graph relationships
- ✅ **Zero Cloud Costs**: Tidak perlu bayar Supabase Pro lagi!

**📖 Migration Guide**: Lihat [`POSTGRESQL_SETUP.md`](POSTGRESQL_SETUP.md) untuk setup dan [`MIGRATION_SUMMARY.md`](MIGRATION_SUMMARY.md) untuk detail migrasi.

---

## ✨ Fitur Utama

### 1. **Multi-Mode Exploration**

Nala Pustaka menyediakan 5 mode eksplorasi canggih untuk kebutuhan berbeda:

#### 💬 **Chat Naskah (Single Chat)**

- Diskusi mendalam dengan satu naskah spesifik.
- **Context-Aware**: AI memahami konteks penuh naskah yang sedang dibuka.
- **History**: Menyimpan riwayat percakapan per naskah.

#### 🔍 **Chat Semua Naskah (Global RAG)**

- Tanyakan apa saja dan AI akan mencari jawaban dari **seluruh database naskah**.
- Cocok untuk mencari tema umum, pola sejarah, atau konsep yang tersebar di banyak karya.
- Menampilkan **sumber referensi** dengan tingkat relevansi.

#### ⚖️ **Studi Banding (Multi-Chat)**

- Pilih **2-3 naskah** sekaligus untuk dianalisis bersamaan.
- Bandingkan versi cerita, gaya bahasa, atau perspektif antar naskah.
- Mode seleksi intuitif di sidebar kiri.

#### 🎓 **Mode Edukasi Interaktif**

- **Auto-Summary**: Ringkasan isi naskah yang mudah dipahami.
- **Kearifan Lokal**: Ekstraksi nilai-nilai moral dan relevansinya dengan masa kini.
- **Analisis Tokoh**: Daftar tokoh dan peran mereka dalam cerita.
- **Signifikansi**: Penjelasan mengapa naskah ini penting.
- **Kuis Interaktif**: Uji pemahaman Anda dengan kuis pilihan ganda yang digenerate AI.

#### 🔮 **Knowledge Graph**

- Visualisasi interaktif hubungan antar konsep (Tokoh, Karya, Konsep, Struktur).
- Menggunakan D3.js untuk visualisasi yang dinamis (drag, zoom, pan).

---

### 2. **Pustaka Digital Cerdas**

- **Smart Search**: Pencarian real-time judul dan pengarang.
- **Advanced Filtering**: Filter berdasarkan Kategori (Sejarah, Sastra, Agama, dll) dan Tags.
- **Quality Filter**: Filter naskah berdasarkan kelengkapan konten (Lengkap 🟢, Cukup 🟡, Pendek 🟠).
- **Pinning System**: Menandai naskah unggulan agar selalu muncul di atas.
- **Pagination & Sorting**: Navigasi mudah untuk ribuan koleksi.
- **Source Links**: Tautan langsung ke sumber asli naskah digital.

### 3. **Wawasan & Artikel**

- Bagian khusus yang membahas interseksi antara teknologi AI dan pelestarian budaya.
- Artikel mendalam seperti "Mengatasi Kebisuan Digital" dan "Revolusi Filologi".

### 4. **Admin Panel & Data Management**

- **CRUD Operations**: Manajemen naskah visual tanpa coding.
- **Massive Ingestion**: Pipeline otomatis untuk scraping dan clustering ribuan naskah.
- **Vector Database**: Integrasi Pinecone untuk pencarian semantik yang akurat.
- **Supabase Integration**: Database PostgreSQL yang aman dan scalable.

### 5. **Optimasi & Keamanan**

- **Token Optimization**: Hemat 77% token dengan semantic chunking & caching.
- **Rate Limiting**: Proteksi API berjenjang (Free/Premium).
- **Usage Tracking**: Monitoring penggunaan token dan biaya per user.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm atau yarn
- Google Gemini API Key (gratis)
- Supabase Account (gratis)

### Instalasi

1. **Clone repository**

```bash
git clone <repository-url>
cd nala-pustaka
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup Environment Variables**
   - Copy file `.env.example` menjadi `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

   - Edit file `.env.local` dan isi dengan credentials Anda:

   ```env
   # Google Gemini API Key
   # Dapatkan di: https://aistudio.google.com/app/apikey
   VITE_GEMINI_API_KEY=your_gemini_api_key_here

   # Supabase Credentials
   # Dapatkan di: https://supabase.com → Project Settings → API
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

4. **Setup Database** (Opsional - untuk Admin Panel)
   - Buat project baru di [Supabase](https://supabase.com)
   - Jalankan migration SQL dari `guide/PHASE1_DATABASE_MIGRATION.sql`
   - Jalankan migration SQL dari `guide/PIN_FEATURE_MIGRATION.sql`
   - Lihat [guide/SETUP_ADMIN_PANEL.md](guide/SETUP_ADMIN_PANEL.md) untuk panduan lengkap

5. **Run development server**

```bash
npm run dev
```

6. **Buka aplikasi**
   - Homepage: `http://localhost:5173`
   - Admin Panel: `http://localhost:5173/admin`

## 🎯 Cara Menggunakan

### 1. Eksplorasi Naskah (Homepage)

- **Pilih Naskah**: Klik naskah di sidebar kiri.
- **Filter & Sort**: Gunakan dropdown kategori, tags, dan sorting di halaman Katalog.
- **Mode Chat**: Klik tombol "💬 Chat" di panel kanan untuk diskusi mendalam.
- **Mode Belajar**: Klik tombol "🎓 Belajar" untuk ringkasan, analisis nilai, dan kuis.
- **Mode Graph**: Klik tombol "🔮 Graph" untuk visualisasi relasi.

### 2. Chat Semua Naskah

- Klik tombol **"🔍 Chat Semua Naskah"** di bagian atas sidebar kiri.
- Ajukan pertanyaan umum seperti _"Bagaimana konsep kepemimpinan dalam naskah Jawa?"_.
- AI akan mencari jawaban dari seluruh koleksi dan menyertakan sumbernya.

### 3. Studi Banding (Multi-Chat)

1. Klik tombol **"💬 Pilih untuk Chat"** di sidebar kiri.
2. Centang **2 sampai 3 naskah** yang ingin dibandingkan.
3. Klik tombol hijau **"💬 Chat dengan X Naskah"** yang muncul.
4. Ajukan pertanyaan perbandingan, misal: _"Apa perbedaan gaya bahasa kedua naskah ini?"_.

### Contoh Pertanyaan

- **Single Chat**: "Apa pesan moral utama dalam Serat Wulangreh?"
- **Global Chat**: "Siapa tokoh Panji yang muncul di berbagai naskah?"
- **Multi Chat**: "Bandingkan watak tokoh utama di kedua cerita ini."
- **Edu Mode**: "Buatkan kuis untuk menguji pemahaman saya tentang naskah ini."

## 🏗️ Arsitektur Teknis

### RAG Implementation

```
User Query → Retrieval (manuscript.fullText) → Augmented Prompt → Gemini API → Grounded Response
```

**1. Retrieval**: Mengambil full text naskah sebagai konteks

**2. Augmentation**: Menggabungkan konteks + user query + system instruction

**3. Generation**: Gemini 2.5 Flash Lite menghasilkan jawaban grounded

### System Prompt

```
Anda adalah "Nala Pustaka", Pustakawan AI ahli filologi Jawa.
- Jawab HANYA berdasarkan konteks naskah
- JANGAN berhalusinasi
- Beri sitasi dari naskah
- Gunakan Bahasa Indonesia (atau Inggris sesuai preferensi user)
```

### Data Pipeline

```
Scraping (Python) → Raw Text → Clustering (Node.js) → LLM Analysis → Supabase & Pinecone
```

1. **Scraping**: Mengambil 4,500+ naskah dari sastra.org
2. **Clustering**: Menggunakan K-Means & Embeddings untuk mengelompokkan varian
3. **Ingestion**: Upload metadata ke Supabase dan vectors ke Pinecone

### Technology Stack

- **Frontend**: React 19 + Vite (Rolldown)
- **Styling**: Tailwind CSS 4
- **Routing**: React Router DOM 7
- **Database**: PostgreSQL 16 (self-hosted atau Docker)
- **Vector DB**: Pinecone
- **Authentication**: Supabase Auth (optional) atau custom auth
- **AI Model**: Google Gemini 2.5 Flash Lite
- **Visualization**: D3.js 7
- **Internationalization**: i18next
- **Markdown**: Marked.js
- **Metodologi**: RAG (Retrieval-Augmented Generation)
- **Backend Scripts**: Python (Scraping) & Node.js (Clustering)

## 📁 Struktur Project

```
nala-pustaka/
├── src/
│   ├── pages/
│   │   ├── AdminLogin.jsx      # Halaman login admin
│   │   ├── AdminDashboard.jsx  # Dashboard manajemen naskah
│   │   ├── CatalogPage.jsx     # Halaman katalog dengan filter canggih
│   │   └── articles/           # Halaman artikel/blog
│   ├── lib/
│   │   └── supabase.js         # Supabase client & services
│   ├── i18n/                   # Konfigurasi multi-bahasa
│   ├── data/
│   │   └── manuscripts.js      # Fallback data (hardcoded)
│   ├── App.jsx                 # Main app + komponen utama
│   ├── index.css               # Tailwind imports
│   └── main.jsx                # Entry point + routing
├── backend/                    # Backend services & scripts
│   ├── src/
│   │   ├── services/           # Deep Chat, Multi Chat, RAG
│   │   ├── middleware/         # Usage Tracker, Rate Limiter
│   │   └── scripts/            # Clustering & Ingestion pipelines
├── guide/                      # Dokumentasi lengkap
│   ├── CARA_PAKAI_ADMIN_PANEL.md
│   ├── MASSIVE_SCRAPING_GUIDE.md
│   ├── PANDUAN_CLUSTERING_FULL.md
│   └── ... (30+ guide files)
├── scraper_multi_kategori_all.py # Main scraping script
├── analyze_scraping_results.py   # Scraping analysis tool
├── public/                     # Static assets
├── .env.example                # Template environment variables
├── README.md                   # Dokumentasi ini
├── tailwind.config.js          # Tailwind configuration
├── vite.config.js              # Vite configuration
└── package.json                # Dependencies
```

## 🎨 Design System

### Color Palette (Warisan Budaya)

- **Cream**: `#fdf8f0` - Warna kertas kuno
- **Stone**: `#292524` - Warna tinta tradisional
- **Amber**: `#d97706` - Aksen emas kerajaan

### Typography

- Font: System fonts (optimized for readability)
- Serif font untuk konten naskah

## 🔐 Keamanan

⚠️ **PENTING untuk Production**:

### Environment Variables

1. **Jangan commit** `.env.local` ke repository (sudah ada di `.gitignore`)
2. Gunakan environment variables untuk semua credentials:
   ```env
   VITE_GEMINI_API_KEY=...
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
3. Untuk deployment (Vercel/Netlify), set env vars di dashboard

### Database Security

- **Row Level Security (RLS)**: Aktif di Supabase untuk proteksi data
- **Authentication**: Supabase Auth dengan email/password
- **API Keys**: Anon key aman untuk client-side (public access terbatas)
- **Admin Access**: Hanya authenticated users dapat CRUD naskah

## 🌟 Fitur RAG & AI

### Apa itu RAG?

**Retrieval-Augmented Generation** adalah teknik menggabungkan:

1. **Retrieval**: Mengambil informasi relevan dari database/dokumen
2. **Augmentation**: Menambahkan informasi tersebut ke prompt
3. **Generation**: Model AI menghasilkan jawaban berdasarkan informasi tersebut

### Keuntungan RAG di Nala Pustaka

✅ Jawaban akurat berdasarkan naskah asli dari database
✅ Mencegah halusinasi AI dengan strict system prompt
✅ Transparansi melalui sitasi otomatis
✅ Konservasi pengetahuan lokal
✅ Demokratisasi akses ke naskah kuno

### Conversational AI

- **Context Window**: AI ingat 5 percakapan terakhir
- **Follow-up Questions**: Dapat menjawab pertanyaan lanjutan dengan referensi ke jawaban sebelumnya
- **Token Optimization**: Manuscript text hanya dikirim di query pertama
- **Chat History**: Riwayat tersimpan otomatis di localStorage browser

### Enhanced Formatting

- **Markdown Rendering**: Code blocks, tables, blockquotes, lists
- **Syntax Highlighting**: Dark theme untuk code blocks
- **Typography**: Spacing dan font optimized untuk readability
- **Loading Indicator**: Animated dots saat AI berpikir

## 📊 Model Configuration

### Gemini 2.5 Flash Lite

```javascript
{
  model: "gemini-2.5-flash-lite",
  temperature: 0.3,      // Rendah = lebih faktual
  topP: 0.8,
  topK: 40,
  maxOutputTokens: 1024
}
```

### Context Window & Token Optimization

- **First Query**: ~35,000 tokens (full manuscript text)
- **Follow-up Queries**: ~500-1,000 tokens (5 message context only)
- **Savings**: 97% token reduction per follow-up
- **Context Window**: 1 Million tokens (support naskah 30K+ kata)
- **Rate Limits**: 10 requests/minute, 1500 requests/day (gratis)

## 🚧 Roadmap

### ✅ Phase 1 - Core Features (COMPLETED)

- [x] Setup project dengan React + Vite
- [x] Design UI dengan Tailwind CSS
- [x] Implementasi state management
- [x] Integrasi Gemini API
- [x] Implementasi RAG methodology
- [x] Chat interface dengan auto-scroll
- [x] Error handling
- [x] Knowledge Graph visualization (D3.js)
- [x] Mobile responsive design

### ✅ Phase 2 - Database & Admin (COMPLETED)

- [x] Database integration (Supabase)
- [x] Admin Panel dengan authentication
- [x] CRUD operations untuk naskah
- [x] Author dropdown (Custom/Tidak Diketahui/Banyak Penulis)
- [x] Manuscript ordering system (▲▼)
- [x] Search functionality
- [x] Source link feature

### ✅ Phase 3 - Advanced Features (COMPLETED)

- [x] Chat history & memory (localStorage)
- [x] Conversational AI dengan context window
- [x] Pagination (5 naskah per halaman)
- [x] Enhanced AI formatting (Markdown)
- [x] Pin feature (5 naskah unggulan)
- [x] Sort & filter di admin panel

### ✅ Phase 4 - Massive Scale (COMPLETED)

- [x] Scraper otomatis untuk 4,500+ naskah
- [x] Clustering engine untuk pengelompokan varian
- [x] Auto-description dengan LLM
- [x] Vector ingestion pipeline

### ✅ Phase 5 - Optimization (COMPLETED)

- [x] Deep Chat optimization (77% savings)
- [x] Multi-Chat optimization (40% savings)
- [x] Usage tracking & cost monitoring
- [x] Rate limiting & API protection

### ✅ Phase 6 - Educational & Multi-Mode (COMPLETED)

- [x] Global RAG Chat (Chat Semua Naskah)
- [x] Multi-Manuscript Chat (Studi Banding 2-3 Naskah)
- [x] Educational Mode (Ringkasan, Nilai, Tokoh, Kuis)
- [x] Quality Filters (Lengkap/Cukup/Pendek)
- [x] Deep Chat dengan Full Context Loading

### ✅ Phase 7 - Global Reach & Intelligence (COMPLETED)

- [x] Multi-language support (Jawa, Indonesia, English)
- [x] Upgrade to Gemini 2.5 Flash Lite
- [x] Advanced Catalog Filtering (Tags, Categories)
- [x] Articles & Insights Section

### 🔜 Future Enhancements

- [ ] Auto-generate Knowledge Graph dari database
- [ ] Export chat history (PDF/TXT)
- [ ] Share conversation via URL
- [ ] Audio narration (TTS)
- [ ] Mobile app (React Native)
- [ ] Collaborative features
- [ ] Advanced analytics dashboard

## 📖 Dokumentasi Lengkap

### Quick Start

- **[QUICK_START.md](QUICK_START.md)** - Setup 2 menit untuk development
- **[CHECKLIST.md](CHECKLIST.md)** - Pre-flight checklist sebelum coding

### User Guides

- **[guide/USER_GUIDE.md](guide/USER_GUIDE.md)** - Panduan untuk pengguna akhir
- **[guide/CARA_PAKAI_ADMIN_PANEL.md](guide/CARA_PAKAI_ADMIN_PANEL.md)** - Panduan admin panel (non-technical)

### Setup & Configuration

- **[guide/SETUP_ADMIN_PANEL.md](guide/SETUP_ADMIN_PANEL.md)** - Setup admin panel & database
- **[guide/INTEGRASI_DATABASE.md](guide/INTEGRASI_DATABASE.md)** - Integrasi Supabase
- **[SETUP_GUIDE_KIRO.md](SETUP_GUIDE_KIRO.md)** - Setup untuk Kiro IDE

### Features Documentation

- **[guide/PHASE_1_FEATURES.md](guide/PHASE_1_FEATURES.md)** - Author dropdown, ordering, search, source link
- **[guide/PHASE_2_FEATURES.md](guide/PHASE_2_FEATURES.md)** - Chat history, conversational AI, pagination
- **[guide/PIN_FEATURE_GUIDE.md](guide/PIN_FEATURE_GUIDE.md)** - Pin naskah unggulan
- **[guide/SORT_FILTER_FEATURE.md](guide/SORT_FILTER_FEATURE.md)** - Sort & filter di admin

### Technical Documentation

- **[guide/TECHNICAL_DOC.md](guide/TECHNICAL_DOC.md)** - Dokumentasi teknis arsitektur
- **[guide/PANDUAN_DATASET.md](guide/PANDUAN_DATASET.md)** - Panduan dataset & workflow
- **[guide/GEMINI_MODEL_RECOMMENDATIONS.md](guide/GEMINI_MODEL_RECOMMENDATIONS.md)** - AI model specs

### Troubleshooting

- **[KIRO_TROUBLESHOOT.md](KIRO_TROUBLESHOOT.md)** - 10 masalah umum & solusi
- **[guide/README_API.md](guide/README_API.md)** - Troubleshooting API

### Project Info

- **[guide/PROJECT_SUMMARY.md](guide/PROJECT_SUMMARY.md)** - Ringkasan project lengkap
- **[guide/CHANGELOG.md](guide/CHANGELOG.md)** - Riwayat perubahan
- **[CHANGES_SUMMARY.md](CHANGES_SUMMARY.md)** - Summary of Kiro IDE fixes
- **[LAPORAN_UPDATE_NOVEMBER_2025.txt](LAPORAN_UPDATE_NOVEMBER_2025.txt)** - Laporan update terbaru

### Advanced Guides

- **[README_MASSIVE_SCRAPER.md](README_MASSIVE_SCRAPER.md)** - Panduan scraping masif
- **[PANDUAN_CLUSTERING_FULL.md](PANDUAN_CLUSTERING_FULL.md)** - Panduan clustering pipeline
- **[URGENT_OPTIMIZATIONS_IMPLEMENTED.md](URGENT_OPTIMIZATIONS_IMPLEMENTED.md)** - Detail optimasi token & biaya

## 🤝 Contributing

Kontribusi sangat diterima! Silakan:

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📝 License

Project ini dibuat untuk tujuan edukasi dan konservasi budaya.

## 🙏 Credits

- **Naskah**: Terinspirasi dari koleksi sastra.org
- **AI Model**: Google Gemini
- **Konsep**: Demokratisasi dan konservasi naskah kuno Jawa

## 🎨 Screenshots & Demo

### Homepage

- **Desktop**: Daftar naskah di kiri, chat/graph di kanan
- **Mobile**: Responsive dengan scroll horizontal untuk naskah
- **Search**: Real-time filtering dengan result counter
- **Pagination**: 5 naskah per halaman dengan page navigation

### Admin Panel

- **Dashboard**: CRUD operations dengan sort, filter, search
- **Pin Feature**: Badge untuk naskah unggulan
- **Ordering**: Tombol ▲▼ untuk mengatur urutan
- **Author Dropdown**: Custom, Tidak Diketahui, Banyak Penulis

### Chat AI

- **Conversational**: Follow-up questions dengan context
- **History Modal**: Lihat semua percakapan sebelumnya
- **Enhanced Formatting**: Markdown dengan code blocks, tables
- **Loading State**: Animated indicator

### Knowledge Graph

- **D3.js Visualization**: Force-directed graph
- **Interactive**: Drag, zoom, pan
- **Color-coded**: 4 node types dengan legend
- **Directed Edges**: Arrows dengan labels

## 🚀 Deployment

### Vercel (Recommended)

1. **Push ke GitHub**

   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import di Vercel**
   - Buka [vercel.com](https://vercel.com)
   - Import repository dari GitHub
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Set Environment Variables**

   ```
   VITE_GEMINI_API_KEY=your_key
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   ```

4. **Deploy**
   - Klik Deploy
   - Website live di `your-project.vercel.app`

### Netlify

1. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

2. **Environment Variables**
   - Sama seperti Vercel (di Site settings → Environment variables)

3. **Deploy**
   - Drag & drop folder `dist` atau connect GitHub

## 🔧 Development

### Available Scripts

```bash
# Development server (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code with Prettier
npm run format
```

### Project Structure Best Practices

- **Components**: Semua komponen utama di `src/App.jsx`
- **Pages**: Admin pages di `src/pages/`
- **Services**: Supabase client & services di `src/lib/`
- **Data**: Fallback data di `src/data/`
- **Guides**: Dokumentasi lengkap di `guide/`

### Adding New Manuscripts

**Via Admin Panel** (Recommended):

1. Login ke `/admin`
2. Klik "➕ Tambah Naskah Baru"
3. Isi form dan submit
4. Naskah langsung muncul di homepage

**Via Database** (Advanced):

1. Buka Supabase Dashboard → Table Editor
2. Insert row baru di table `manuscripts`
3. Isi: slug, title, author, description, full_text
4. Refresh homepage

Lihat [guide/CARA_PAKAI_ADMIN_PANEL.md](guide/CARA_PAKAI_ADMIN_PANEL.md) untuk detail.

## 📈 Performance

### Metrics

- **Lighthouse Score**: 90+ (Performance, Accessibility, Best Practices, SEO)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Bundle Size**: ~500KB (gzipped)

### Optimizations

- **Code Splitting**: React Router lazy loading
- **Tree Shaking**: Vite automatic optimization
- **Image Optimization**: SVG icons (no raster images)
- **CSS Purging**: Tailwind removes unused styles
- **Database Indexing**: Supabase indexes untuk fast queries
- **Token Optimization**: 97% reduction untuk follow-up queries

## 🧪 Testing

### Manual Testing Checklist

**Homepage:**

- [ ] Naskah load dari database
- [ ] Search filtering works
- [ ] Pagination navigation works
- [ ] Pin badge muncul untuk naskah pinned
- [ ] Source button muncul jika ada source_url
- [ ] Mobile responsive

**Chat AI:**

- [ ] Welcome message muncul
- [ ] First query: AI jawab based on manuscript
- [ ] Follow-up query: AI reference jawaban sebelumnya
- [ ] Chat history tersimpan di localStorage
- [ ] History modal menampilkan semua pesan
- [ ] Clear history works
- [ ] Markdown formatting render dengan benar

**Knowledge Graph:**

- [ ] Graph render dengan D3.js
- [ ] Drag nodes works
- [ ] Zoom in/out works
- [ ] Pan canvas works
- [ ] Legend menampilkan node types
- [ ] Responsive di mobile

**Admin Panel:**

- [ ] Login dengan Supabase Auth
- [ ] Tambah naskah baru
- [ ] Edit naskah existing
- [ ] Hapus naskah (dengan konfirmasi)
- [ ] Pin/unpin naskah (max 5)
- [ ] Reorder dengan tombol ▲▼
- [ ] Sort & filter works
- [ ] Search real-time works

## 📞 Support & Contact

### Dokumentasi

- **Quick Start**: [QUICK_START.md](QUICK_START.md)
- **User Guide**: [guide/USER_GUIDE.md](guide/USER_GUIDE.md)
- **Admin Guide**: [guide/CARA_PAKAI_ADMIN_PANEL.md](guide/CARA_PAKAI_ADMIN_PANEL.md)
- **Troubleshooting**: [KIRO_TROUBLESHOOT.md](KIRO_TROUBLESHOOT.md)

### Issues & Bugs

- Buka [GitHub Issues](https://github.com/Alcunii/nala-pustaka/issues)
- Sertakan: Browser, OS, error message, steps to reproduce

### Feature Requests

- Diskusi di GitHub Discussions
- Atau buat issue dengan label `enhancement`

### Community

- **Website**: [nalapustaka.org](https://nalapustaka.org)
- **GitHub**: [github.com/Alcunii/nala-pustaka](https://github.com/Alcunii/nala-pustaka)

---

## 🏆 Achievements

**November 2025 Update:**

- ✅ **Phase 1-3**: Core Features, Database, Admin Panel
- ✅ **Phase 4**: Massive Data Pipeline (4,500+ naskah)
- ✅ **Phase 5**: Optimization (77% cost reduction)
- ✅ **Phase 6**: Multi-Mode Exploration (Global Chat, Multi-Chat, Edu Mode)
- ✅ **Phase 7**: Global Reach (i18n, Gemini 2.5, Advanced Catalog)
- ✅ **Total**: 25+ fitur baru ditambahkan dalam satu bulan!

**Total Features:**

- 🎯 **5 Mode Eksplorasi**: Single Chat, Global Chat, Multi-Chat, Edu Mode, Graph
- 📚 **Database**: 4,500+ naskah terindeks dengan vector search
- 🤖 **Advanced AI**: Gemini 2.5 Flash Lite dengan Deep Context & RAG
- 📊 **Visualisasi**: Knowledge Graph interaktif dengan D3.js
- 🔐 **Keamanan**: Rate limiting, RLS, & Authentication
- 📱 **Responsive**: Mobile-first design dengan horizontal scroll
- 🕷️ **Pipeline**: Automated scraping & clustering
- 💰 **Efisien**: Caching & semantic chunking
- 📖 **Lengkap**: 30+ file dokumentasi teknis & user guide
- 🌍 **Global**: Dukungan Bahasa Indonesia & Inggris

---

**Nala Pustaka** - _Membuka hati dan pikiran untuk belajar dari leluhur_ 🙏

Made with ❤️ for preserving Javanese cultural heritage

**Version**: 3.1.0 (November 2025)
**Status**: 🚀 Production Ready
**Live**: [nalapustaka.org](https://nalapustaka.org)
