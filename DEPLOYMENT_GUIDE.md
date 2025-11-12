# 🚀 Deployment Guide - Nala Pustaka ke Production

Panduan lengkap deploy website ke Vercel dengan semua fitur baru (Admin Panel, Database, Auto Knowledge Graph).

---

## ✅ Pre-Deployment Checklist

### 1. **Fitur yang Akan Di-Deploy:**
- ✅ Admin Panel (`/admin` & `/admin/dashboard`)
- ✅ Supabase Database Integration
- ✅ Auto-generate Knowledge Graph (AI-powered)
- ✅ Markdown Formatting untuk AI responses
- ✅ Mobile responsive design
- ✅ Fetch naskah dari database real-time

### 2. **Environment Variables Required:**
```
VITE_GEMINI_API_KEY=AIzaSyDXBrD8jTS4zfekoaaQ5c44sJvmAsqgm_w
VITE_SUPABASE_URL=https://eosclaiinbnebgrjsgsp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 3. **Database Status:**
- ✅ Supabase project: `nala-pustaka`
- ✅ Table: `manuscripts` (dengan RLS policies)
- ✅ Admin user: `abinawa007@gmail.com`
- ✅ Data: 1 naskah (Serat Tatacara) di database

---

## 📋 Step-by-Step Deployment

### Step 1: Setup Vercel Environment Variables

1. **Buka Vercel Dashboard**
   - https://vercel.com/dashboard
   - Pilih project `nala-pustaka`

2. **Settings → Environment Variables**

3. **Tambahkan 3 variables** (untuk **Production, Preview, Development**):

   **Variable 1: VITE_GEMINI_API_KEY**
   ```
   Name: VITE_GEMINI_API_KEY
   Value: AIzaSyDXBrD8jTS4zfekoaaQ5c44sJvmAsqgm_w
   Environments: ✅ Production ✅ Preview ✅ Development
   ```

   **Variable 2: VITE_SUPABASE_URL**
   ```
   Name: VITE_SUPABASE_URL
   Value: https://eosclaiinbnebgrjsgsp.supabase.co
   Environments: ✅ Production ✅ Preview ✅ Development
   ```

   **Variable 3: VITE_SUPABASE_ANON_KEY**
   ```
   Name: VITE_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvc2NsYWlpbmJuZWJncmpzZ3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MDU0NTEsImV4cCI6MjA3ODQ4MTQ1MX0.m9GR6732A5MwgafqkdghCTgbX0Y9ddHKWbJSA1Ccqpg
   Environments: ✅ Production ✅ Preview ✅ Development
   ```

4. **Click "Save"**

⏱️ **Time: 3-5 menit**

---

### Step 2: Commit & Push to GitHub

**Di terminal, jalankan:**

```bash
# 1. Add semua file yang berubah
git add .

# 2. Commit dengan message deskriptif
git commit -m "feat: Add admin panel, Supabase integration, and auto knowledge graph

- Admin panel with authentication (/admin, /admin/dashboard)
- Supabase database integration for manuscripts
- Auto-generate knowledge graph using Gemini AI
- Markdown formatting for AI chat responses
- Mobile responsive improvements
- Real-time data fetch from database"

# 3. Push ke GitHub
git push origin main
```

⏱️ **Time: 1-2 menit**

---

### Step 3: Vercel Auto-Deploy

**Setelah push, Vercel akan otomatis:**

1. ✅ Detect push ke `main` branch
2. ✅ Pull latest code
3. ✅ Install dependencies (`npm install`)
4. ✅ Inject environment variables
5. ✅ Build production (`npm run build`)
6. ✅ Deploy ke https://nalapustaka.org

**Monitor di:**
- Vercel Dashboard → Deployments
- Lihat build logs real-time

**Build time:** ~2-3 menit

---

### Step 4: Verify Deployment

**Setelah deploy selesai (✅ "Ready"), test:**

#### 1. **Homepage**
```
URL: https://nalapustaka.org
Test:
- ✅ Daftar naskah muncul (fetch dari Supabase)
- ✅ Pilih naskah → Chat AI berfungsi
- ✅ Markdown formatting terlihat bagus
- ✅ Knowledge graph muncul
```

#### 2. **Admin Login**
```
URL: https://nalapustaka.org/admin
Test:
- ✅ Halaman login muncul
- ✅ Login dengan: abinawa007@gmail.com
- ✅ Redirect ke dashboard
```

#### 3. **Admin Dashboard**
```
URL: https://nalapustaka.org/admin/dashboard
Test:
- ✅ Daftar naskah muncul (1 naskah: Serat Tatacara)
- ✅ Tombol "Tambah Naskah Baru" berfungsi
- ✅ Form tambah naskah lengkap
- ✅ Edit & Delete berfungsi
```

#### 4. **Auto Knowledge Graph**
```
Test:
- ✅ Tambah naskah baru via admin panel
- ✅ Lihat loading "🔄 Generating knowledge graph..."
- ✅ Sukses: "✅ Naskah berhasil ditambahkan dengan knowledge graph!"
- ✅ Refresh homepage → Graph muncul
```

---

## 🔍 Troubleshooting

### ❌ "Supabase URL is required"
**Penyebab:** Environment variables tidak ter-inject

**Solusi:**
1. Cek Vercel → Settings → Environment Variables
2. Pastikan 3 variables ada dengan nilai benar
3. **Redeploy**: Deployments → Latest → ⋯ → Redeploy

---

### ❌ "Login gagal" di /admin
**Penyebab:** Supabase credentials salah atau admin user belum dibuat

**Solusi:**
1. Cek Supabase dashboard → Authentication → Users
2. Pastikan user `abinawa007@gmail.com` ada
3. Coba login dengan password yang benar
4. Jika lupa password, reset di Supabase dashboard

---

### ❌ Knowledge graph tidak muncul
**Penyebab:** Naskah belum punya `knowledge_graph` field

**Solusi:**
- Naskah lama (sebelum fitur auto-generate) tidak punya graph
- Hapus & tambah ulang via admin panel
- Atau edit manual di Supabase → Table Editor → `knowledge_graph` field

---

### ❌ Build failed di Vercel
**Penyebab:** Dependency error atau syntax error

**Solusi:**
1. Lihat build logs di Vercel
2. Cek error message
3. Fix di local: `npm run build`
4. Commit & push lagi

---

## 📊 Post-Deployment Tasks

### 1. **Update Serat Tatacara dengan Knowledge Graph**

**Opsi A: Hapus & Re-add** (Recommended)
```
1. Login ke https://nalapustaka.org/admin/dashboard
2. Hapus "Serat Tatacara"
3. Klik "Tambah Naskah Baru"
4. Copy-paste data yang sama
5. Submit → AI auto-generate graph
6. ✅ Done!
```

**Opsi B: Edit Manual di Supabase**
```
1. Buka Supabase → Table Editor → manuscripts
2. Pilih "Serat Tatacara"
3. Edit field `knowledge_graph` (JSONB)
4. Paste JSON graph (contoh di AUTO_KNOWLEDGE_GRAPH.md)
5. Save
```

---

### 2. **Tambahkan Naskah Hardcoded ke Database**

Saat ini, 4 naskah hardcoded tidak di database:
- Serat Wulangreh
- Serat Centhini
- Kalatidha
- Wedhatama

**Cara Migrate:**
```
1. Login admin panel production
2. Tambah satu per satu via form
3. Copy text dari src/data/manuscripts.js
4. AI auto-generate knowledge graph
5. ✅ Semua naskah di database!
```

⏱️ **Time per naskah:** ~5 menit (total ~20 menit)

---

### 3. **Dokumentasi untuk User**

**File yang sudah tersedia:**
- ✅ `CARA_PAKAI_ADMIN_PANEL.md` → User guide non-technical
- ✅ `SETUP_ADMIN_PANEL.md` → Technical setup guide
- ✅ `AUTO_KNOWLEDGE_GRAPH.md` → Knowledge graph guide
- ✅ `INTEGRASI_DATABASE.md` → Integration overview

**Share ke tim:**
- Kirim link ke `CARA_PAKAI_ADMIN_PANEL.md` untuk content manager
- Dokumentasi sudah ada di GitHub repo

---

## 🎉 Success Criteria

### Production Ready When:
- ✅ https://nalapustaka.org loads without errors
- ✅ Admin panel accessible at /admin
- ✅ Login berfungsi dengan Supabase auth
- ✅ Naskah fetch dari database
- ✅ Chat AI dengan Markdown formatting
- ✅ Knowledge graph auto-generate untuk naskah baru
- ✅ Mobile responsive
- ✅ No console errors di browser

---

## 📈 Next Steps (Future Enhancements)

1. **Analytics**: Track usage dengan Vercel Analytics
2. **SEO**: Meta tags untuk better Google indexing
3. **Sitemap**: Auto-generate sitemap.xml
4. **PWA**: Make it installable as mobile app
5. **Backup**: Auto-backup Supabase database
6. **Admin**: Invite more admins via Supabase

---

## 🔐 Security Checklist

- ✅ `.env.local` di `.gitignore` (tidak ter-commit)
- ✅ Supabase RLS policies active
- ✅ Admin authentication required
- ✅ API keys di environment variables (tidak hardcoded)
- ✅ HTTPS enabled (Vercel default)
- ✅ Password hashed by Supabase

---

## 📞 Support

**Jika ada masalah:**
1. Cek browser console (F12) untuk error
2. Cek Vercel build logs
3. Cek Supabase logs
4. Review dokumentasi di repo
5. Contact developer via GitHub Issues

---

**Ready to deploy? Follow Step 1-4 di atas! 🚀**

---

## TL;DR - Quick Deploy

```bash
# 1. Setup Vercel env vars (Gemini + Supabase)
# 2. Commit & push
git add .
git commit -m "feat: Add admin panel and database integration"
git push origin main

# 3. Wait for Vercel auto-deploy (~3 min)
# 4. Verify at https://nalapustaka.org
# 5. Done! 🎉
```
