# Kiro IDE - Troubleshooting Guide

Jika Anda mengalami masalah membuka repository ini di Kiro IDE, ikuti panduan ini.

## Problem 1: "Project Not Recognized" atau "Module Not Found"

### Solusi:

1. **Reload Kiro IDE**
   ```bash
   Ctrl+Shift+P → "Reload Window" atau "Developer: Reload Window"
   ```

2. **Pastikan jsconfig.json ada di root**
   - File `jsconfig.json` sudah dibuat otomatis
   - Jika tidak ada, buat manual dari template:
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "lib": ["ES2020", "DOM", "DOM.Iterable"],
       "module": "ESNext",
       "jsx": "react-jsx",
       "strict": false,
       "baseUrl": ".",
       "paths": {
         "@/*": ["src/*"],
         "@components/*": ["src/components/*"],
         "@pages/*": ["src/pages/*"],
         "@lib/*": ["src/lib/*"],
         "@data/*": ["src/data/*"]
       }
     }
   }
   ```

3. **Restart JavaScript Language Server**
   ```bash
   Ctrl+Shift+P → "JavaScript: Restart TS Server"
   ```

## Problem 2: "ESLint not found" atau ESLint errors

### Solusi:

1. **Pastikan node_modules sudah terinstall**
   ```bash
   npm install
   ```

2. **Reinstall ESLint**
   ```bash
   npm install --save-dev eslint eslint-plugin-react-hooks eslint-plugin-react-refresh
   ```

3. **Enable ESLint di Kiro settings**
   - Buka `.vscode/settings.json`
   - Pastikan ada:
   ```json
   "eslint.enable": true,
   "eslint.validate": ["javascript", "javascriptreact"],
   "eslint.format.enable": true
   ```

4. **Restart Kiro IDE**

## Problem 3: Tailwind CSS autocomplete tidak bekerja

### Solusi:

1. **Install extension Tailwind CSS IntelliSense**
   ```bash
   Ctrl+Shift+X → cari "Tailwind CSS IntelliSense" (bradlc.vscode-tailwindcss)
   ```

2. **Pastikan tailwind.config.js ada dan valid**
   - File sudah ada di root
   - Jika ada error, verify struktur JSON-nya

3. **Restart Kiro dan clear cache**
   ```bash
   Ctrl+Shift+P → "Tailwind CSS: Clear Cache"
   Ctrl+Shift+P → "Reload Window"
   ```

## Problem 4: Terminal Python tidak ketemu virtual environment

### Solusi:

1. **Select Python Interpreter**
   ```bash
   Ctrl+Shift+P → "Python: Select Interpreter"
   ```

2. **Buat dan activate venv manual**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate
   
   # macOS/Linux
   python -m venv venv
   source venv/bin/activate
   ```

3. **Install requirements**
   ```bash
   pip install -r requirements.txt
   ```

## Problem 5: Prettier formatting tidak bekerja

### Solusi:

1. **Install Prettier extension**
   ```bash
   Ctrl+Shift+X → cari "Prettier" (esbenp.prettier-vscode)
   ```

2. **Set Prettier sebagai default formatter**
   - File `.vscode/settings.json` sudah ada konfignya
   - Jika masih tidak bekerja, coba:
   ```bash
   Ctrl+Shift+P → "Format Document"
   ```

3. **Atau format via command line**
   ```bash
   npm run format
   ```

## Problem 6: Hot reload tidak bekerja saat `npm run dev`

### Solusi:

1. **Pastikan Vite server berjalan**
   ```bash
   npm run dev
   # Check terminal output, harus ada "Local: http://localhost:5173"
   ```

2. **Check firewall Windows**
   - Windows Firewall mungkin block port 5173
   - Allow Node.js di Windows Firewall settings

3. **Gunakan port berbeda**
   ```bash
   npm run dev -- --port 3000
   ```

## Problem 7: "Cannot find module '@/...'" errors

### Solusi:

1. **Check jsconfig.json path aliases**
   - Pastikan paths sesuai dengan folder actual:
   ```json
   "paths": {
     "@/*": ["src/*"],
     "@components/*": ["src/components/*"],
     "@pages/*": ["src/pages/*"],
     "@lib/*": ["src/lib/*"],
     "@data/*": ["src/data/*"]
   }
   ```

2. **Verify folder structure**
   ```bash
   ls src/
   # Output harus ada: lib/, pages/, data/, App.jsx, main.jsx
   ```

3. **Rebuild JavaScript Index**
   ```bash
   Ctrl+Shift+P → "Go to Symbol in Workspace..."
   Ctrl+Shift+P → "Reload Window"
   ```

## Problem 8: Kiro menolak buka folder (Wrong format)

### Solusi:

1. **Buka folder yang benar**
   - Jangan buka subdirectory (src/, guide/, dll)
   - Selalu buka root folder: `d:/OneDrive/nala-pustaka/`

2. **Jika masih error, clean dan rebuild**
   ```bash
   rm -rf .vscode/.ropeproject
   rm -rf node_modules
   npm install
   ```

3. **Atau gunakan workspace file**
   ```bash
   # Di Kiro, File → Open Workspace from File
   # Pilih: nala-pustaka.code-workspace
   ```

## Problem 9: "VITE_GEMINI_API_KEY not set" error

### Solusi:

1. **Buat .env file dari .env.example**
   ```bash
   cp .env.example .env
   ```

2. **Isi dengan API keys Anda**
   ```env
   VITE_GEMINI_API_KEY=your_key_here
   VITE_SUPABASE_URL=your_url_here
   VITE_SUPABASE_ANON_KEY=your_key_here
   ```

3. **Restart dev server**
   ```bash
   Ctrl+C (stop server)
   npm run dev
   ```

## Problem 10: Git status menunjukkan semua files modified

### Solusi:

1. **Check line ending settings**
   - Windows mungkin convert CRLF ↔ LF
   - Pastikan `.gitattributes` ada (or create):
   ```
   * text=auto
   *.js text eol=lf
   *.jsx text eol=lf
   *.json text eol=lf
   *.py text eol=lf
   ```

2. **Fix line endings**
   ```bash
   git config core.autocrlf true
   git add -A
   git commit -m "Fix line endings"
   ```

## General Kiro Setup Checklist

- [ ] Buka root folder (bukan subfolder)
- [ ] `.vscode/settings.json` ada
- [ ] `jsconfig.json` ada
- [ ] `node_modules` sudah terinstall (`npm install`)
- [ ] `.env` file sudah dibuat dan diisi
- [ ] Extensions yang direkomendasikan sudah diinstall
- [ ] ESLint tidak ada error (check bottom status bar)
- [ ] Prettier formatting berjalan
- [ ] Dev server bisa dijalankan (`npm run dev`)
- [ ] Browser dev tools bisa inspect React components

## Debugging Tips

### Check Kiro Status

```bash
Ctrl+Shift+P → "Show Debug Console"
# Lihat messages dari language servers
```

### Check Error Logs

```bash
Ctrl+Shift+P → "Help: Toggle Developer Tools"
# Tab "Console" untuk JavaScript errors
# Tab "Output" untuk language server logs
```

### Manual npm check

```bash
npm list --depth=0
# Verify semua dependencies installed

npm outdated
# Check ada update package
```

### Python debugging

```bash
# Pilih interpreter
Ctrl+Shift+P → "Python: Select Interpreter"

# Run file dengan debug
F5 (atau Ctrl+F5)
```

---

**Jika masalah persist**, silakan:
1. Check GitHub issues: https://github.com/Alcunii/nala-pustaka/issues
2. Include error log dari browser console (F12) atau VS Code output
3. Mention Kiro IDE version dan OS yang digunakan

**Last Updated**: November 2025
