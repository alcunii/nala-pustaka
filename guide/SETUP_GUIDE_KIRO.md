# Setup Guide - Nala Pustaka

Panduan lengkap untuk setup dan menjalankan proyek Nala Pustaka.

## Prasyarat

- **Node.js** ≥ 16 (https://nodejs.org/)
- **npm** atau **pnpm**
- **Python** ≥ 3.8 (untuk scraper, opsional)

## 1. Clone Repository

```bash
git clone https://github.com/Alcunii/nala-pustaka.git
cd nala-pustaka
```

## 2. Setup Frontend (React + Vite)

### 2.1 Install Dependencies

```bash
npm install
# atau jika menggunakan pnpm:
pnpm install
```

### 2.2 Setup Environment Variables

Copy `.env.example` ke `.env` dan isi dengan credentials Anda:

```bash
cp .env.example .env
```

Edit `.env` dan tambahkan:

```env
# Google Gemini API Key
# Dapatkan di: https://aistudio.google.com/app/apikey
VITE_GEMINI_API_KEY=your_api_key_here

# Supabase (untuk Admin Panel & Database)
# Dapatkan di: https://supabase.com → Project Settings → API
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 2.3 Run Development Server

```bash
npm run dev
```

Server akan jalan di `http://localhost:5173`

### 2.4 Build untuk Production

```bash
npm run build
npm run preview
```

## 3. Setup Backend (Python Scraper, Opsional)

### 3.1 Create Virtual Environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 3.2 Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 3.3 Run Scraper

```bash
# Basic scraper
python scraper.py

# Advanced scraper dengan headless browser
python scraper_advanced.py

# Scraper untuk AJAX-loaded content
python scraper_ajax.py

# Scraper untuk multiple kategori
python scraper_multi_kategori.py
```

## 4. IDE Setup (Kiro IDE / VS Code)

### 4.1 VS Code Extensions Rekomendasi

- **ES7+ React/Redux/React-Native snippets** (dsznajder.es7-react-js-snippets)
- **Prettier - Code formatter** (esbenp.prettier-vscode)
- **ESLint** (dbaeumer.vscode-eslint)
- **Tailwind CSS IntelliSense** (bradlc.vscode-tailwindcss)
- **Python** (ms-python.python) - untuk scraper

### 4.2 Kiro IDE Setup

1. Open folder repository di Kiro IDE
2. Kiro akan otomatis detect `jsconfig.json` dan `eslint.config.js`
3. Install extensions yang diperlukan
4. Config akan auto-apply dari file:
   - `jsconfig.json` - untuk path resolution
   - `.editorconfig` - untuk formatting standard
   - `tailwind.config.js` - untuk Tailwind completions
   - `eslint.config.js` - untuk linting

### 4.3 Format Code

```bash
# Format dengan Prettier
npm run format

# Check linting
npm run lint
```

## 5. Project Structure

```
nala-pustaka/
├── src/
│   ├── App.jsx                 # Main app component
│   ├── main.jsx               # Entry point
│   ├── index.css              # Global styles
│   ├── pages/
│   │   ├── AdminLogin.jsx     # Admin login page
│   │   └── AdminDashboard.jsx # Admin dashboard
│   ├── lib/
│   │   └── supabase.js        # Supabase config & services
│   ├── data/
│   │   └── manuscripts.js     # Hardcoded manuscript data
│   └── assets/                # Static assets
├── public/                     # Public assets
├── index.html                 # HTML entry
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── jsconfig.json              # JS path aliases
├── eslint.config.js           # ESLint rules
├── postcss.config.js          # PostCSS configuration
├── package.json               # Dependencies & scripts
├── requirements.txt           # Python dependencies
└── .env.example              # Environment template
```

## 6. Features

### Frontend (React)

- ✅ Responsive design dengan Tailwind CSS
- ✅ AI Chat dengan Gemini API (RAG)
- ✅ Knowledge Graph visualization dengan D3.js
- ✅ Admin panel untuk manage naskah
- ✅ Pin feature untuk highlight naskah
- ✅ Search & filter naskah
- ✅ Chat history dengan localStorage

### Backend (Python)

- ✅ Web scraping dengan BeautifulSoup & Selenium
- ✅ AJAX-rendered content support
- ✅ Multiple category scraping
- ✅ Auto-save ke file .txt

### Database (Supabase)

- ✅ Real-time manuscript storage
- ✅ User authentication
- ✅ Role-based access control (RBAC)
- ✅ Knowledge graph storage

## 7. Environment Setup Checklist

- [ ] Node.js dan npm terinstall
- [ ] Repository di-clone
- [ ] Dependencies di-install (`npm install`)
- [ ] `.env` file dibuat dan diisi
- [ ] Gemini API key disiapkan
- [ ] Supabase project dibuat
- [ ] Dev server bisa dijalankan (`npm run dev`)
- [ ] ESLint & Prettier berjalan
- [ ] Tailwind CSS colors muncul di IDE

## 8. Troubleshooting

### Module not found errors

Jika ada error `Cannot find module`:
1. Jalankan `npm install` ulang
2. Hapus `node_modules` dan reinstall: `rm -rf node_modules && npm install`
3. Check `.env` sudah benar

### Tailwind colors tidak muncul

1. Restart IDE/dev server
2. Check `tailwind.config.js` sudah update dengan color definitions
3. CSS import di `main.jsx` sudah ada:
   ```jsx
   import './index.css'
   ```

### API errors (Gemini/Supabase)

1. Check `.env` sudah diisi dengan benar
2. Verify API keys bukan fake/placeholder
3. Check network connection
4. Lihat browser console untuk error details

### Python script errors

1. Ensure virtual environment activated
2. Install requirements: `pip install -r requirements.txt`
3. Check Python version ≥ 3.8

## 9. Development Tips

### Hot Reload

Dev server support hot reload. Any changes ke `.jsx` files akan auto-refresh browser.

### Debug dengan Browser DevTools

```javascript
// Di console, cek state atau test API calls
// Contoh: test Supabase connection
import { supabase } from './lib/supabase'
const data = await supabase.from('manuscripts').select('*')
console.log(data)
```

### Database Testing

Gunakan Supabase dashboard di https://supabase.com untuk testing queries.

## 10. Deployment

### Vercel (Recommended)

1. Push ke GitHub
2. Connect GitHub ke Vercel
3. Add environment variables di Vercel settings
4. Deploy akan auto-run `npm run build`

### Manual Deploy

```bash
npm run build
# Upload `dist/` folder ke hosting (Firebase, Netlify, etc)
```

## 11. Support & Documentation

- **Main README**: `/README.md`
- **API Docs**: `/guide/README_API.md`
- **Database Schema**: `/guide/DATABASE_SCHEMA_UPDATE.sql`
- **Technical Docs**: `/guide/TECHNICAL_DOC.md`

---

**Last Updated**: November 2025
**Version**: 1.0.0
