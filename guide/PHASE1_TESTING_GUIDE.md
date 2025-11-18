# 🧪 Phase 1 Testing Guide - Fitur Edukatif

## ✅ Yang Sudah Dibuat (SELESAI)

### Backend:
- ✅ `educationalAI.js` - Service untuk generate konten edukatif
- ✅ `knowledgeGraph.js` - Service untuk find related manuscripts
- ✅ API Routes di `server.js`:
  - `POST /api/educational/generate` - Generate konten baru
  - `GET /api/educational/:manuscriptId` - Get cached konten
  - `POST /api/knowledge-graph` - Get related manuscripts
- ✅ SQL schema `create-educational-tables.sql`

### Frontend:
- ✅ `EducationalPanel.jsx` - 4 kartu edukatif + quiz
- ✅ `EducationalKnowledgeGraph.jsx` - Text-based relationship map
- ✅ Integrasi ke `App.jsx` - Button "🎓 Belajar"

---

## 🎯 YANG PERLU ANDA LAKUKAN SEKARANG

### **Step 1: Setup Database (5 menit)**

1. **Login Supabase Dashboard**
   - Buka: https://supabase.com/dashboard
   - Pilih project: `nala-pustaka`

2. **Execute SQL Script**
   - Klik sidebar: **SQL Editor**
   - Klik: **New Query**
   - Copy seluruh isi file: `backend/src/scripts/create-educational-tables.sql`
   - Paste ke SQL editor
   - Klik: **Run** (atau tekan F5)
   - Tunggu hingga muncul: **Success. No rows returned**

3. **Verify Tables Created**
   - Klik sidebar: **Table Editor**
   - Cari 2 tabel baru:
     - `educational_content` ✅
     - `manuscript_relationships` ✅
   - Jika ada, setup database **SELESAI** ✅

---

### **Step 2: Test di Localhost (10 menit)**

#### 2.1. Start Backend

```bash
cd backend
npm start
```

**Expected output:**
```
========================================
🚀 Nala Pustaka Backend Server
📡 Server running on port 3001
🌍 Environment: development
========================================
```

#### 2.2. Start Frontend

```bash
# Di terminal baru
npm run dev
```

**Expected output:**
```
VITE ready in xxx ms
➜  Local:   http://localhost:5173/
```

#### 2.3. Test Educational Features

1. **Buka browser:** http://localhost:5173
2. **Pilih naskah** dari sidebar (misal: Serat Wulangreh)
3. **Klik button:** "🎓 Belajar" (di kanan atas)
4. **Anda akan lihat:**
   - Panel "📚 Mode Belajar" dengan button "Generate Konten Edukatif"
   - Section "🔗 Jelajahi Hubungan Naskah" di bawahnya
5. **Klik:** "🎓 Generate Konten Edukatif"
6. **Tunggu ~10 detik** (AI sedang generate)
7. **Hasil yang harus muncul:**
   - ✅ Card "📖 Ringkasan Mudah" - klik untuk expand
   - ✅ Card "💡 Kearifan Lokal" - list nilai dengan quote & relevansi
   - ✅ Card "🎭 Tokoh & Cerita" - daftar tokoh (jika ada)
   - ✅ Card "🌟 Mengapa Penting?" - signifikansi naskah
   - ✅ Section "🎯 Quiz Pemahaman" - 5 pertanyaan multiple choice

8. **Test Quiz:**
   - Klik button "Mulai Quiz"
   - Jawab 5 pertanyaan
   - Klik "Submit Jawaban"
   - Lihat score (%) dan penjelasan jawaban

9. **Test Knowledge Graph:**
   - Scroll ke bawah
   - Lihat "📚 Naskah Terkait" dengan similarity score
   - Lihat tema serupa dan periode sejarah

10. **Test Caching:**
    - Pindah ke naskah lain
    - Kembali ke naskah pertama
    - Konten harus **langsung muncul** (tidak generate lagi) ✅

---

### **Step 3: Check Logs (Penting!)**

#### Backend Logs (Terminal backend):

**Success:**
```
[INFO] Generating educational content for: Serat Wulangreh
[INFO] Successfully generated and cached content for: wulangreh (2500 tokens)
```

**Error:**
```
[ERROR] Educational AI generation error: Gemini API error: ...
```
→ Check API key di `.env`

#### Browser Console (F12):

**Success:**
- No errors di console ✅

**Error:**
```
Failed to fetch
CORS error
```
→ Check `VITE_RAG_API_URL` di `.env`

---

### **Step 4: Review Kualitas AI Content**

Setelah generate 2-3 naskah, review:

**Ringkasan:**
- [ ] Apakah 3-5 kalimat? ✅
- [ ] Bahasa mudah dipahami? ✅
- [ ] Menarik untuk anak muda? ✅

**Kearifan Lokal:**
- [ ] Ada 3-5 nilai? ✅
- [ ] Quote relevan? ✅
- [ ] Relevansi modern masuk akal? ✅

**Tokoh & Cerita:**
- [ ] Tokoh utama teridentifikasi? ✅
- [ ] Deskripsi akurat? ✅
- [ ] Atau "tidak ada tokoh" untuk teks filosofis? ✅

**Quiz:**
- [ ] 5 pertanyaan valid? ✅
- [ ] Jawaban benar? ✅
- [ ] Penjelasan membantu? ✅

**Jika kualitas kurang bagus:**
→ Beri feedback ke saya, kita adjust prompt AI!

---

## 🐛 Troubleshooting

### Problem 1: "Failed to fetch" saat generate

**Penyebab:** Backend tidak running atau CORS issue

**Solusi:**
1. Check backend terminal - apakah ada error?
2. Check `backend/.env` - `CORS_ORIGIN` harus `http://localhost:5173` (DEV)
3. Restart backend: `Ctrl+C` lalu `npm start`

---

### Problem 2: "Gemini API key not configured"

**Penyebab:** API key tidak ada di backend

**Solusi:**
1. Check `backend/.env`
2. Pastikan ada: `GEMINI_API_KEY=AIzaSy...`
3. Restart backend

---

### Problem 3: Tabel tidak ditemukan (PGRST116)

**Penyebab:** SQL belum dijalankan di Supabase

**Solusi:**
1. Ulang **Step 1** - execute SQL script
2. Verify tabel ada di Table Editor

---

### Problem 4: Generate lambat (>30 detik)

**Penyebab:** Gemini API rate limit atau naskah terlalu panjang

**Solusi:**
1. Normal: 5-15 detik per manuscript
2. Jika >30 detik konsisten, coba naskah lain
3. Check token count di backend log

---

### Problem 5: Quiz tidak muncul

**Penyebab:** AI tidak generate quiz (rare)

**Solusi:**
1. Generate ulang konten (refresh page)
2. Check backend log - apakah ada JSON parse error?
3. Jika konsisten, beri tahu saya untuk fix prompt

---

## 📊 Expected Token Usage

**Per manuscript:**
- Input: ~1,000 tokens (prompt + excerpt)
- Output: ~1,500 tokens (4 cards + quiz)
- **Total: ~2,500 tokens**

**Cost estimate:**
- 1 naskah: Rp 60 (Gemini Flash)
- 10 naskah: Rp 600
- 121 naskah (full): ~Rp 7,000

**Caching:**
- Generate ONCE, cached FOREVER ✅
- Subsequent loads: FREE (dari database)

---

## ✅ Success Criteria

Setelah testing, Anda harus bisa:

- [x] Generate konten edukatif untuk ANY manuscript
- [x] Lihat 4 kartu (summary, wisdom, characters, significance)
- [x] Main quiz 5 pertanyaan
- [x] Lihat related manuscripts
- [x] Content ter-cache (kedua kali instant load)
- [x] Mobile responsive (test di phone/dev tools)

---

## 🚀 Next Steps (Setelah Phase 1 OK)

1. **Deploy ke Production:**
   - Copy SQL ke Supabase production
   - Deploy backend ke Railway
   - Deploy frontend ke Vercel

2. **Phase 2 Development:**
   - Learning Assistant dengan prompt templates
   - Badge system & progress tracking
   - Advanced quiz features

3. **Batch Generate:**
   - Generate konten untuk semua 121 naskah
   - Review kualitas
   - Build relationships automatically

---

## 📞 Beri Feedback

Setelah testing, kasih tahu saya:

1. **Apa yang berhasil?** ✅
2. **Apa yang error?** ❌
3. **Kualitas AI content bagaimana?** (1-10)
4. **Ada saran improvement?** 💡

Saya akan refine prompt/fitur berdasarkan feedback Anda!

---

**Happy Testing!** 🎉