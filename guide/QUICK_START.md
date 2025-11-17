# ⚡ Quick Reference - Kiro IDE Setup

```
┌────────────────────────────────────────────────┐
│         NALA PUSTAKA - KIRO IDE READY          │
└────────────────────────────────────────────────┘
```

## 1️⃣ Open Repository

```bash
# In Kiro IDE:
File → Open Folder → d:/OneDrive/nala-pustaka
```

## 2️⃣ Install Extensions

Press `Ctrl+Shift+X`, then install:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- React Snippets
- Python

Or Kiro will prompt you automatically.

## 3️⃣ Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env and fill:
# - VITE_GEMINI_API_KEY (get from https://aistudio.google.com/app/apikey)
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY

# Install dependencies
npm install
```

## 4️⃣ Run Development

```bash
npm run dev
# Browser opens → http://localhost:5173
```

## 🎯 Common Commands

```bash
# Format code
npm run format

# Check for errors
npm run lint

# Build for production
npm run build

# Preview build
npm run preview

# Python scraper (if needed)
python scraper.py
```

## 🆘 If Something Breaks

1. **Module not found?**
   - Reload: `Ctrl+Shift+P` → "Reload Window"
   - Restart TS server: `Ctrl+Shift+P` → "JavaScript: Restart TS Server"

2. **ESLint errors?**
   - Check: `.vscode/settings.json` exists
   - Run: `npm install` again

3. **Prettier not working?**
   - Format file: `Ctrl+Shift+P` → "Format Document"
   - Or: `npm run format`

4. **Tailwind colors missing?**
   - Restart: `Ctrl+Shift+P` → "Reload Window"
   - Clear cache: `Ctrl+Shift+P` → "Tailwind CSS: Clear Cache"

5. **Still broken?**
   - Read: `/KIRO_TROUBLESHOOT.md`
   - Read: `/SETUP_GUIDE_KIRO.md`

## 📁 Important Files

- `jsconfig.json` - Path aliases (@lib, @data, etc)
- `vite.config.js` - Build config
- `.vscode/settings.json` - IDE settings
- `.env` - API keys (create from .env.example)

## 🚀 You're Ready!

Start coding and let Kiro autocomplete, lint, and format for you!

**Questions?** Check docs in `/guide/` folder

---
*Last Updated: Nov 17, 2025*
