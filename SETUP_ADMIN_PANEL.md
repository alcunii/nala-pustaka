# 🔐 Admin Panel Setup Guide

Panduan lengkap membuat admin panel untuk menambahkan naskah tanpa coding.

---

## 🎯 Arsitektur

```
Website (nalapustaka.org)
  ├── /              → Public (daftar naskah, chat AI)
  └── /admin         → Protected (login required)
       ├── Login     → Username & password
       └── Dashboard → Form tambah/edit/hapus naskah
           ↓
       Supabase Database (PostgreSQL)
           ↓
       Auto-sync ke website (real-time)
```

---

## 📋 Persiapan

### Yang Anda Butuhkan:
1. ✅ Akun Supabase (gratis) - https://supabase.com
2. ✅ Email untuk admin login
3. ✅ Password yang kuat
4. ⏱️ Waktu setup: ~30 menit

---

## 🚀 Step-by-Step Setup

### Step 1: Buat Akun Supabase

1. Buka https://supabase.com
2. Sign up dengan GitHub/Email
3. Verify email

**⏱️ 2 menit**

---

### Step 2: Buat Project Baru

1. Dashboard Supabase → **New Project**
2. Isi form:
   - **Name**: `nala-pustaka`
   - **Database Password**: [buat password kuat, simpan!]
   - **Region**: `Southeast Asia (Singapore)`
   - **Pricing Plan**: `Free` (cukup untuk ratusan naskah)
3. Klik **Create new project**
4. Tunggu ~2 menit (setup database)

**⏱️ 3 menit**

---

### Step 3: Setup Database

#### 3.1. Buka SQL Editor

Dashboard → **SQL Editor** → **New query**

#### 3.2. Jalankan SQL Ini:

```sql
-- Tabel untuk menyimpan naskah
CREATE TABLE manuscripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  full_text TEXT NOT NULL,
  knowledge_graph JSONB DEFAULT '{"nodes": [], "links": []}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Index untuk performa
CREATE INDEX idx_manuscripts_slug ON manuscripts(slug);
CREATE INDEX idx_manuscripts_created_at ON manuscripts(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE manuscripts ENABLE ROW LEVEL SECURITY;

-- Policy: Semua orang bisa READ
CREATE POLICY "Public read access" 
  ON manuscripts FOR SELECT 
  TO anon, authenticated 
  USING (true);

-- Policy: Hanya authenticated user bisa INSERT/UPDATE/DELETE
CREATE POLICY "Authenticated users can insert" 
  ON manuscripts FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update own" 
  ON manuscripts FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = created_by);

CREATE POLICY "Authenticated users can delete own" 
  ON manuscripts FOR DELETE 
  TO authenticated 
  USING (auth.uid() = created_by);

-- Function untuk auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk auto-update
CREATE TRIGGER update_manuscripts_updated_at 
  BEFORE UPDATE ON manuscripts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

#### 3.3. Klik **Run** (atau Ctrl+Enter)

✅ Harus muncul pesan sukses!

**⏱️ 3 menit**

---

### Step 4: Setup Authentication

#### 4.1. Enable Email Auth

Dashboard → **Authentication** → **Providers**
- ✅ Email sudah enabled by default
- Scroll ke **Email Auth** → Klik **Settings**
- **Confirm email**: `Enabled` (bisa matikan untuk testing)
- **Save**

#### 4.2. Buat Admin User Pertama

Dashboard → **Authentication** → **Users** → **Add user**
- **Email**: [email admin Anda]
- **Password**: [password kuat]
- ✅ **Auto Confirm User** (untuk skip verifikasi email)
- Klik **Create user**

✅ User admin pertama berhasil dibuat!

**⏱️ 3 menit**

---

### Step 5: Dapatkan API Credentials

Dashboard → **Settings** → **API**

Copy 2 values ini (simpan di notepad):

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ PENTING**: `anon key` boleh public, `service_role key` JANGAN dishare!

**⏱️ 1 menit**

---

### Step 6: Import Data Existing (Optional)

Kita punya 4 naskah existing. Mari import ke database.

Dashboard → **SQL Editor** → **New query**

```sql
-- Insert naskah existing
INSERT INTO manuscripts (slug, title, author, description, full_text, knowledge_graph)
VALUES 
  (
    'wulangreh',
    'Serat Wulangreh',
    'Pakubuwana IV',
    'Ajaran moral dan etika kepemimpinan Jawa.',
    'PUPUH I: DHANDHANGGULA

1. Pamedhare wasitaning ati, lumantarèna ing paSmon sinom...',
    '{"nodes": [{"id": "wulangreh", "label": "Serat Wulangreh", "type": "Karya"}], "links": []}'::jsonb
  );

-- Ulangi untuk centhini, kalatidha, wedhatama
-- (Atau skip dulu, bisa import manual via admin panel nanti)
```

**⏱️ 5 menit** (jika import semua)

---

### Step 7: Setup Environment Variables

Buat file `.env.local` (jangan commit!):

```bash
# Supabase
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Gemini (sudah ada)
VITE_GEMINI_API_KEY=your_gemini_key
```

Update `.env.example`:

```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Gemini API
VITE_GEMINI_API_KEY=your_gemini_key
```

**⏱️ 2 menit**

---

### Step 8: Install Dependencies

```bash
npm install @supabase/supabase-js react-router-dom
```

- `@supabase/supabase-js` → Client untuk database & auth
- `react-router-dom` → Routing untuk /admin

**⏱️ 2 menit**

---

## ✅ Checklist Setup

- [ ] Akun Supabase dibuat
- [ ] Project `nala-pustaka` dibuat
- [ ] Database schema (SQL) dijalankan
- [ ] Admin user pertama dibuat
- [ ] API credentials disimpan
- [ ] `.env.local` dibuat dengan credentials
- [ ] Dependencies installed

**Total waktu: ~25-30 menit**

---

## 🎨 Next: Build Admin Panel

Setelah setup selesai, kita akan build:

1. **Login Page** (`/admin`) - Form email/password
2. **Dashboard** (`/admin/dashboard`) - Protected, bisa tambah/edit/hapus naskah
3. **Form Tambah Naskah** - User-friendly untuk non-technical user

---

## 🔒 Security Features

✅ Row Level Security (RLS) - User hanya bisa edit naskah sendiri
✅ Auth token di browser (auto logout saat expire)
✅ Password di-hash oleh Supabase
✅ API key aman (environment variable)

---

## 📊 Database Schema

```
manuscripts
├── id (UUID, auto)
├── slug (TEXT, unique) → "wulangreh", "centhini"
├── title (TEXT) → "Serat Wulangreh"
├── author (TEXT) → "Pakubuwana IV"
├── description (TEXT) → Deskripsi singkat
├── full_text (TEXT) → Isi lengkap naskah
├── knowledge_graph (JSONB) → Graph data
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── created_by (UUID) → User ID yang buat
```

---

## 🚀 Deploy to Production

Setelah admin panel selesai:

1. **Tambahkan env vars di Vercel**:
   - Dashboard Vercel → Project → Settings → Environment Variables
   - Tambahkan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`

2. **Push & Deploy**:
   ```bash
   git add .
   git commit -m "feat: Add admin panel with Supabase"
   git push origin main
   ```

3. **Akses Admin**:
   - https://nalapustaka.org/admin
   - Login dengan email/password yang dibuat di Step 4.2

---

## 💡 Tips

- **Testing lokal**: Gunakan `.env.local` (tidak ter-commit)
- **Production**: Set env vars di Vercel dashboard
- **Backup database**: Supabase auto-backup, bisa download juga
- **Upgrade**: Free tier 500MB database, cukup untuk ~500 naskah

---

## 📞 Troubleshooting

**Error: Invalid API key**
→ Check `.env.local`, pastikan copy-paste benar dari Supabase

**Error: Row Level Security**
→ Pastikan SQL policy sudah dijalankan (Step 3.2)

**Login gagal**
→ Check email/password, atau buat user baru di Supabase dashboard

---

**Ready?** Lanjut ke implementasi kode! 🚀
