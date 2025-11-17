# ✅ Kiro IDE - Pre-flight Checklist

Print this out or check off as you go!

## System Requirements

- [ ] Node.js ≥ 16 installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Kiro IDE installed and working
- [ ] Python ≥ 3.8 installed (for scraper, optional)

## Repository Setup

- [ ] Repository cloned: `d:/OneDrive/nala-pustaka/`
- [ ] Open in Kiro: File → Open Folder → nala-pustaka
- [ ] Kiro recognizes it as valid project

## Config Files Present

- [ ] `jsconfig.json` ✅ exists
- [ ] `vite.config.js` ✅ updated
- [ ] `tailwind.config.js` ✅ updated
- [ ] `eslint.config.js` ✅ updated
- [ ] `.editorconfig` ✅ exists
- [ ] `.prettierrc` ✅ exists

## IDE Configuration

- [ ] `.vscode/settings.json` ✅ created/updated
- [ ] `.vscode/extensions.json` ✅ created
- [ ] `.vscode/launch.json` ✅ created

## Extensions Installed (Kiro)

- [ ] ESLint (dbaeumer.vscode-eslint)
- [ ] Prettier (esbenp.prettier-vscode)
- [ ] Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)
- [ ] React Snippets (dsznajder.es7-react-js-snippets)
- [ ] Python (ms-python.python) - optional

## Dependencies

- [ ] `npm install` runs without error
- [ ] `node_modules/` folder exists
- [ ] `package.json` looks correct
- [ ] `requirements.txt` present for Python

## Environment Setup

- [ ] `.env` created from `.env.example`
  ```bash
  cp .env.example .env
  ```
- [ ] `VITE_GEMINI_API_KEY` filled in `.env`
- [ ] `VITE_SUPABASE_URL` filled in `.env`
- [ ] `VITE_SUPABASE_ANON_KEY` filled in `.env`

## IDE Features Working

- [ ] ESLint: Shows errors in editor
  - Ctrl+Shift+P → "ESLint: Show Output Channel"
  
- [ ] Prettier: Format on save
  - Right-click file → "Format Document"
  
- [ ] Path aliases: Green no-error squiggles for `@/...` imports
  - Restart TS server if needed
  
- [ ] Tailwind: Autocomplete in className
  - Type `className="bg-"` and see suggestions
  
- [ ] React: Component snippets work
  - Type `rfce` and see React component template

## Dev Server

- [ ] `npm run dev` starts without error
- [ ] Opens http://localhost:5173
- [ ] Shows "Nala Pustaka" page
- [ ] Hot reload works (change file → refresh)

## Documentation Read

- [ ] `QUICK_START.md` - Quick reference ✅
- [ ] `SETUP_GUIDE_KIRO.md` - Full setup guide ✅
- [ ] `KIRO_TROUBLESHOOT.md` - Troubleshooting ✅
- [ ] `KIRO_IDE_FIXED.md` - Changes summary ✅

## Python Setup (Optional, for Scraper)

- [ ] Python ≥ 3.8 installed
- [ ] Virtual environment created: `python -m venv venv`
- [ ] Virtual environment activated
  ```bash
  # Windows
  venv\Scripts\activate
  # macOS/Linux
  source venv/bin/activate
  ```
- [ ] Requirements installed: `pip install -r requirements.txt`

## Git Ready

- [ ] Repository is a valid Git repo
- [ ] `.gitignore` exists and looks correct
- [ ] Can commit changes without error

## You're All Set! 🎉

If you checked all boxes above, you're ready to start coding!

### Next Steps:

1. **Read documentation** (takes 5 min)
   - Start with `QUICK_START.md`

2. **Start dev server**
   ```bash
   npm run dev
   ```

3. **Make a change** and see hot reload work

4. **Test Prettier**
   - Make code messy
   - Save file → auto-format

5. **Test ESLint**
   - Import unused variable → see error squiggle

6. **Start building** your features!

---

### If Something's Wrong:

| What's Wrong | What to Do |
|---|---|
| Module not found error | Ctrl+Shift+P → "Reload Window" |
| ESLint not showing errors | Check `.vscode/settings.json` exists |
| Prettier not formatting | Ctrl+Shift+P → "Format Document" |
| Tailwind colors missing | Ctrl+Shift+P → "Reload Window" |
| Dev server fails | `npm install` again |
| Python errors | Check venv activated + `pip install -r requirements.txt` |
| Still stuck? | Read `/KIRO_TROUBLESHOOT.md` |

---

## Final Check

Before committing, verify:

```bash
# Lint check
npm run lint
# Should show "0 errors"

# Prettier check
npm run format
# Should run without error

# Build check
npm run build
# Should create dist/ folder
```

---

**All set!** Happy coding! 🚀

*Last Updated: Nov 17, 2025*
