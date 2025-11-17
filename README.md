# 📚 Nala Pustaka

**AI untuk Demokratisasi Kearifan Naskah Kuno Jawa**

Aplikasi web interaktif yang menggunakan AI (Google Gemini) dengan metodologi RAG (Retrieval-Augmented Generation) untuk membantu pengguna mengeksplorasi dan memahami naskah kuno Jawa. Dilengkapi dengan Admin Panel untuk manajemen naskah dan Knowledge Graph untuk visualisasi konsep.

![Nala Pustaka](https://img.shields.io/badge/React-19-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8) ![Gemini API](https://img.shields.io/badge/Gemini-2.0%20Flash-orange) ![Supabase](https://img.shields.io/badge/Supabase-Database-green)

> 🎯 **Untuk Kiro IDE**: Repository ini sudah fully compatible! Lihat [`QUICK_START.md`](QUICK_START.md) untuk setup 2 menit. Semua config files sudah ada: `jsconfig.json`, ESLint, Prettier, Tailwind intellisense, dan debug config. ✅

> 🚀 **Live Demo**: [nalapustaka.org](https://nalapustaka.org)

---

## 🎉 Update Terbaru - November 2025

### ✨ Fitur Baru (Phase 1-3)

**Phase 1 - Database & Admin:**
- ✅ Integrasi Supabase (PostgreSQL cloud database)
- ✅ Admin Panel dengan authentication
- ✅ CRUD operations untuk manajemen naskah
- ✅ Author dropdown (Custom/Tidak Diketahui/Banyak Penulis)
- ✅ Manuscript ordering system (tombol ▲▼)
- ✅ Search functionality dengan real-time filtering
- ✅ Source link feature (link ke sumber original)

**Phase 2 - Advanced AI:**
- ✅ Chat history & memory (localStorage)
- ✅ Conversational AI dengan 5-message context window
- ✅ Token optimization (97% savings untuk follow-up queries)
- ✅ Pagination (5 naskah per halaman)
- ✅ Enhanced AI formatting (Markdown dengan code blocks, tables, blockquotes)
- ✅ Loading indicators & better UX

**Phase 3 - Editorial Control:**
- ✅ Pin feature (maksimal 5 naskah unggulan di halaman 1)
- ✅ Sort & filter di admin panel (4 sort options, 2 filters)
- ✅ Result counter & page info
- ✅ Pinned badge indicators
- ✅ Improved admin dashboard UI

### 🔧 Technical Improvements
- Upgraded to React 19 & Tailwind CSS 4
- Gemini 2.0 Flash Experimental (1M token context)
- D3.js 7 untuk Knowledge Graph
- React Router DOM 7 untuk routing
- Supabase Auth untuk security
- Row Level Security (RLS) di database

### 📚 Dokumentasi
- 20+ guide files ditambahkan
- Comprehensive troubleshooting guides
- Step-by-step setup instructions
- User & admin manuals

**Lihat [LAPORAN_UPDATE_NOVEMBER_2025.txt](LAPORAN_UPDATE_NOVEMBER_2025.txt) untuk detail lengkap.**

---

## ✨ Fitur

### 1. **Pustaka Digital dengan Database**
- Koleksi naskah kuno Jawa yang terdigitalisasi
- **Integrasi Supabase**: Naskah tersimpan di database cloud
- **Pagination**: 5 naskah per halaman untuk navigasi mudah
- **Search & Filter**: Cari naskah berdasarkan judul, pengarang, atau deskripsi
- **Pin Feature**: Maksimal 5 naskah unggulan di halaman pertama
- **Source Links**: Link ke sumber naskah original (opsional)
- Interface card yang intuitif dan responsif

### 2. **Pustakawan AI (RAG Chatbot)**
- Chat interaktif dengan AI yang ahli filologi Jawa
- **Grounded AI**: Jawaban berdasarkan HANYA pada konteks naskah
- **Anti-halusinasi**: Sistem prompt yang kuat mencegah AI mengarang informasi
- **Conversational AI**: AI ingat 5 percakapan terakhir untuk pertanyaan follow-up
- **Chat History**: Riwayat percakapan tersimpan otomatis di browser
- **Enhanced Formatting**: Markdown rendering dengan code blocks, tables, blockquotes
- **Sitasi otomatis**: AI menyebutkan bagian mana dari naskah yang menjadi sumber jawaban
- Balasan dalam Bahasa Indonesia

### 3. **Knowledge Graph**
- Visualisasi hubungan antar konsep dalam naskah menggunakan D3.js
- Graph interaktif dengan drag, zoom, dan pan
- Node types: Karya, Tokoh, Konsep, Struktur
- Directed edges dengan labels
- 3 graph datasets lengkap untuk setiap naskah

### 4. **Admin Panel**
- Dashboard untuk manajemen naskah tanpa coding
- **CRUD Operations**: Tambah, edit, hapus naskah dengan mudah
- **Author Dropdown**: Pilihan pengarang (Custom, Tidak Diketahui, Banyak Penulis)
- **Manuscript Ordering**: Atur urutan tampilan dengan tombol ▲▼
- **Pin/Unpin**: Tandai naskah unggulan untuk halaman pertama
- **Sort & Filter**: 4 opsi sort, 2 filter, search real-time
- **Authentication**: Login aman dengan Supabase Auth

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

### Untuk User (Homepage)

1. **Pilih Naskah**: Klik salah satu naskah di panel kiri (atau scroll di mobile)
2. **Tab Chat**: 
   - AI akan menyapa dan siap menjawab pertanyaan
   - Ajukan pertanyaan tentang isi, makna, atau konteks naskah
   - AI dapat menjawab pertanyaan follow-up (ingat 5 percakapan terakhir)
   - Klik "📜 Riwayat" untuk melihat chat history
3. **Tab Graph**: 
   - Visualisasi konsep dan hubungan dalam naskah
   - Drag nodes, zoom, dan pan untuk eksplorasi
4. **Search**: Gunakan search bar untuk mencari naskah spesifik
5. **Pagination**: Navigasi antar halaman dengan tombol Previous/Next

### Contoh Pertanyaan
- "Apa pesan moral utama dalam Serat Wulangreh?"
- "Siapa saja tokoh yang disebutkan dalam naskah ini?"
- "Jelaskan makna dari bait pertama"
- "Apa filosofi yang terkandung dalam teks ini?"
- **Follow-up**: "Kapan beliau menulis naskah itu?" (AI ingat konteks sebelumnya)

### Untuk Admin (Admin Panel)

1. **Login**: Akses `/admin` dan login dengan credentials Supabase
2. **Tambah Naskah**: Klik "➕ Tambah Naskah Baru" dan isi form
3. **Edit Naskah**: Klik "✏️ Edit" pada naskah yang ingin diubah
4. **Hapus Naskah**: Klik "🗑️ Hapus" (dengan konfirmasi)
5. **Pin Naskah**: Klik "📍 Pin" untuk menandai naskah unggulan (max 5)
6. **Atur Urutan**: Gunakan tombol ▲▼ untuk mengatur display order

Lihat [guide/CARA_PAKAI_ADMIN_PANEL.md](guide/CARA_PAKAI_ADMIN_PANEL.md) untuk panduan lengkap.

## 🏗️ Arsitektur Teknis

### RAG Implementation

```
User Query → Retrieval (manuscript.fullText) → Augmented Prompt → Gemini API → Grounded Response
```

**1. Retrieval**: Mengambil full text naskah sebagai konteks

**2. Augmentation**: Menggabungkan konteks + user query + system instruction

**3. Generation**: Gemini 2.0 Flash menghasilkan jawaban grounded

### System Prompt
```
Anda adalah "Nala Pustaka", Pustakawan AI ahli filologi Jawa.
- Jawab HANYA berdasarkan konteks naskah
- JANGAN berhalusinasi
- Beri sitasi dari naskah
- Gunakan Bahasa Indonesia
```

### Technology Stack
- **Frontend**: React 19 + Vite (Rolldown)
- **Styling**: Tailwind CSS 4
- **Routing**: React Router DOM 7
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Model**: Google Gemini 2.0 Flash Experimental
- **Visualization**: D3.js 7
- **Markdown**: Marked.js
- **Metodologi**: RAG (Retrieval-Augmented Generation)

## 📁 Struktur Project

```
nala-pustaka/
├── src/
│   ├── pages/
│   │   ├── AdminLogin.jsx      # Halaman login admin
│   │   └── AdminDashboard.jsx  # Dashboard manajemen naskah
│   ├── lib/
│   │   └── supabase.js         # Supabase client & services
│   ├── data/
│   │   └── manuscripts.js      # Fallback data (hardcoded)
│   ├── App.jsx                 # Main app + komponen utama
│   ├── index.css               # Tailwind imports
│   └── main.jsx                # Entry point + routing
├── guide/                      # Dokumentasi lengkap
│   ├── CARA_PAKAI_ADMIN_PANEL.md
│   ├── PHASE_1_FEATURES.md
│   ├── PHASE_2_FEATURES.md
│   ├── PIN_FEATURE_GUIDE.md
│   ├── INTEGRASI_DATABASE.md
│   └── ... (20+ guide files)
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

### Gemini 2.0 Flash Experimental
```javascript
{
  model: "gemini-2.0-flash-exp",
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

### 🔜 Phase 4 - Future Enhancements
- [ ] Vector database untuk semantic search
- [ ] Auto-generate Knowledge Graph dari database
- [ ] Multi-language support (Jawa, Indonesia, English)
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
- ✅ 11 fitur baru ditambahkan (Phase 1-3)
- ✅ Database integration dengan Supabase
- ✅ Admin Panel fully functional
- ✅ Chat history & conversational AI
- ✅ Pin feature untuk naskah unggulan
- ✅ Enhanced AI formatting
- ✅ Pagination & search
- ✅ Production-ready deployment

**Total Features:**
- 🎯 4 major components (Homepage, Chat, Graph, Admin)
- 📚 Database-driven manuscript management
- 🤖 Advanced RAG with conversational AI
- 📊 Interactive D3.js visualization
- 🔐 Secure authentication & authorization
- 📱 Fully responsive design
- 📖 20+ documentation files

---

**Nala Pustaka** - *Membuka hati dan pikiran untuk belajar dari leluhur* 🙏

Made with ❤️ for preserving Javanese cultural heritage

**Version**: 3.0.0 (November 2025)  
**Status**: 🚀 Production Ready  
**Live**: [nalapustaka.org](https://nalapustaka.org)
