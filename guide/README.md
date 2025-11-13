# 📚 Nala Pustaka

**AI untuk Demokratisasi Kearifan Naskah Kuno Jawa**

Aplikasi web interaktif yang menggunakan AI (Google Gemini) dengan metodologi RAG (Retrieval-Augmented Generation) untuk membantu pengguna mengeksplorasi dan memahami naskah kuno Jawa.

![Nala Pustaka](https://img.shields.io/badge/React-18-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8) ![Gemini API](https://img.shields.io/badge/Gemini-2.0%20Flash-orange)

## ✨ Fitur

### 1. **Pustaka Digital**
- Koleksi naskah kuno Jawa yang terdigitalisasi
- Naskah tersedia: Serat Wulangreh, Serat Centhini, Serat Kalatidha, Serat Wedhatama
- Interface card yang intuitif dan responsif
- **Mudah ditambahkan**: Lihat [QUICKSTART_ADD_MANUSCRIPT.md](QUICKSTART_ADD_MANUSCRIPT.md) untuk menambah naskah baru (5 menit!)

### 2. **Pustakawan AI (RAG Chatbot)**
- Chat interaktif dengan AI yang ahli filologi Jawa
- **Grounded AI**: Jawaban berdasarkan HANYA pada konteks naskah
- **Anti-halusinasi**: Sistem prompt yang kuat mencegah AI mengarang informasi
- **Sitasi otomatis**: AI menyebutkan bagian mana dari naskah yang menjadi sumber jawaban
- Balasan dalam Bahasa Indonesia

### 3. **Knowledge Graph** (Coming Soon)
- Visualisasi hubungan antar konsep dalam naskah
- Graph interaktif untuk eksplorasi lebih dalam

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm atau yarn
- Google Gemini API Key (gratis)

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

3. **Setup API Key**
   - Dapatkan API Key gratis di: https://aistudio.google.com/app/apikey
   - Copy file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
   - Edit file `.env` dan isi dengan API key Anda:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Run development server**
   ```javascript
   const apiKey = 'YOUR_API_KEY_HERE';
   ```
   - Lihat [README_API.md](./README_API.md) untuk panduan lengkap

4. **Run development server**
```bash
npm run dev
```

5. **Buka aplikasi**
   - Aplikasi akan berjalan di `http://localhost:5173`

## 🎯 Cara Menggunakan

1. **Pilih Naskah**: Klik salah satu naskah di panel kiri
2. **Baca Sambutan**: AI akan menyapa dan siap menjawab pertanyaan
3. **Ajukan Pertanyaan**: Ketik pertanyaan tentang isi, makna, atau konteks naskah
4. **Terima Jawaban**: AI akan menjawab berdasarkan konteks naskah dengan sitasi

### Contoh Pertanyaan
- "Apa pesan moral utama dalam Serat Wulangreh?"
- "Siapa saja tokoh yang disebutkan dalam naskah ini?"
- "Jelaskan makna dari bait pertama"
- "Apa filosofi yang terkandung dalam teks ini?"

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
- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **AI Model**: Google Gemini 2.0 Flash Experimental
- **Metodologi**: RAG (Retrieval-Augmented Generation)
- **API**: Google Generative AI REST API

## 📁 Struktur Project

```
nala-pustaka/
├── src/
│   ├── App.jsx          # Main app + semua komponen
│   ├── index.css        # Tailwind imports
│   └── main.jsx         # Entry point
├── public/              # Static assets
├── README.md            # Dokumentasi ini
├── README_API.md        # Panduan API Key
├── tailwind.config.js   # Tailwind configuration
└── package.json         # Dependencies
```

## 🎨 Design System

### Color Palette (Warisan Budaya)
- **Cream**: `#fdf8f0` - Warna kertas kuno
- **Stone**: `#292524` - Warna tinta tradisional
- **Amber**: `#d97706` - Aksen emas kerajaan

### Typography
- Font: System fonts (optimized for readability)
- Serif font untuk konten naskah

## 🔐 Keamanan API Key

⚠️ **PENTING untuk Production**:

1. Jangan commit API Key ke repository public
2. Gunakan environment variables:
```bash
# .env
VITE_GEMINI_API_KEY=your_key_here
```

3. Update kode:
```javascript
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
```

4. Tambahkan `.env` ke `.gitignore`

## 🌟 Fitur RAG

### Apa itu RAG?
**Retrieval-Augmented Generation** adalah teknik menggabungkan:
1. **Retrieval**: Mengambil informasi relevan dari database/dokumen
2. **Augmentation**: Menambahkan informasi tersebut ke prompt
3. **Generation**: Model AI menghasilkan jawaban berdasarkan informasi tersebut

### Keuntungan RAG di Nala Pustaka
✅ Jawaban akurat berdasarkan naskah asli
✅ Mencegah halusinasi AI
✅ Transparansi melalui sitasi
✅ Konservasi pengetahuan lokal
✅ Demokratisasi akses ke naskah kuno

## 📊 Model Configuration

```javascript
{
  temperature: 0.3,      // Rendah = lebih faktual
  topP: 0.8,            
  topK: 40,
  maxOutputTokens: 1024
}
```

## 🚧 Roadmap

- [x] Setup project dengan React + Vite
- [x] Design UI dengan Tailwind CSS
- [x] Implementasi state management
- [x] Integrasi Gemini API
- [x] Implementasi RAG methodology
- [x] Chat interface dengan auto-scroll
- [x] Error handling
- [x] Knowledge Graph visualization
- [x] Mobile responsive design
- [x] Modular data structure (easy to add manuscripts)
- [ ] Database integration (PostgreSQL/Supabase)
- [ ] Upload naskah via form
- [ ] Vector database untuk RAG lebih advanced
- [ ] Multi-language support (Jawa, Indonesia, English)
- [ ] Export chat history
- [ ] Share conversation
- [ ] Admin dashboard

## 📖 Dokumentasi Lengkap

- **[QUICKSTART_ADD_MANUSCRIPT.md](QUICKSTART_ADD_MANUSCRIPT.md)** - Cara cepat menambah naskah baru (5 menit)
- **[PANDUAN_DATASET.md](PANDUAN_DATASET.md)** - Panduan lengkap dataset & workflow (Manual, JSON, Database)
- **[TECHNICAL_DOC.md](TECHNICAL_DOC.md)** - Dokumentasi teknis arsitektur
- **[USER_GUIDE.md](USER_GUIDE.md)** - Panduan untuk pengguna akhir

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

## 📞 Support

Jika ada pertanyaan atau issue:
- Buka GitHub Issues
- Lihat [README_API.md](./README_API.md) untuk troubleshooting API

---

**Nala Pustaka** - *Membuka hati dan pikiran untuk belajar dari leluhur* 🙏

Made with ❤️ for preserving Javanese cultural heritage
