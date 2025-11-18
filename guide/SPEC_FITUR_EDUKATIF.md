# 🎓 Spec: Fitur Edukatif Pedagogis untuk Nala Pustaka

## 🎯 Visi
Mengubah Nala Pustaka dari platform riset menjadi **learning platform** yang engaging untuk generasi muda Indonesia memahami dan mencintai naskah kuno Jawa.

---

## 🎨 **Fitur Utama: "Jelajahi & Pelajari" Mode**

### **1. Auto-Generated Educational Cards** ⭐⭐⭐
Setiap naskah mendapat 4 kartu edukatif otomatis:

**a) 📖 Ringkasan Mudah (TL;DR)**
- AI generate: Ringkasan 3-5 kalimat untuk awam
- Bahasa Indonesia modern, tanpa istilah sulit
- Format: Card dengan icon, gamification

**b) 💡 Kearifan Lokal & Filosofi**
- Ekstrak nilai-nilai moral/etika dari naskah
- Relevansi dengan kehidupan modern
- Quote-quote inspiring dari naskah

**c) 🎭 Tokoh & Cerita Menarik**
- Identifikasi tokoh utama otomatis
- Timeline peristiwa penting
- Fun facts & trivia

**d) 🌟 Mengapa Penting?**
- Konteks historis
- Pengaruh terhadap budaya Indonesia
- Connection ke masa kini

### **2. Interactive Learning Buttons**
Setiap naskah mendapat tombol quick-action:

```
[📖 Baca Ringkasan] [💡 Pelajari Nilai] [🎭 Tokoh & Cerita] 
[🎯 Quiz Mini] [🔊 Dengar Audio] [📥 Infografik]
```

### **3. AI Learning Assistant (Pedagogical Prompts)**
Mode chat khusus untuk pembelajaran dengan prompt templates:

- "Jelaskan seperti saya usia 15 tahun"
- "Apa relevansinya dengan kehidupan saya sekarang?"
- "Apa pelajaran moral yang bisa diambil?"
- "Ceritakan yang paling menarik dari naskah ini"
- "Bandingkan dengan [naskah lain]"

### **4. Gamification & Progress Tracking**
- 🏆 Badge system: "Pembaca Pemula", "Penjelajah Naskah", "Ahli Filologi"
- 📊 Reading progress: Berapa naskah sudah dibaca
- 🎯 Mini quiz setelah baca (5 pertanyaan simple)
- ⭐ Point & leaderboard (optional, social learning)

### **5. Multi-Format Content Generation**
AI auto-generate berbagai format untuk different learning styles:

- **Visual Learners**: Infografik timeline & tokoh (AI-generated via prompt)
- **Audio Learners**: Text-to-speech untuk ringkasan
- **Interactive Learners**: Quiz & games
- **Traditional Readers**: Enhanced reading mode dengan glossary

---

## 🏗️ **Implementation Architecture**

### **Backend: AI Content Generation Service**

**File**: `backend/src/services/educationalAI.js`

Methods:
```javascript
generateSummary(manuscript)          // Ringkasan awam
extractWisdom(manuscript)            // Kearifan lokal
identifyCharacters(manuscript)       // Tokoh & timeline
explainSignificance(manuscript)      // Mengapa penting
generateQuiz(manuscript, difficulty) // Quiz 5 soal
```

### **Frontend: Educational Components**

1. **EducationalPanel.jsx** - Main panel dengan 4 cards
2. **LearningAssistant.jsx** - Chat dengan prompt templates
3. **QuizModal.jsx** - Interactive quiz
4. **ProgressTracker.jsx** - Badge & achievements
5. **InfographicViewer.jsx** - Visual content display

### **Database: Supabase Schema Extension**

```sql
-- Cache AI-generated educational content
educational_content (
  manuscript_id,
  content_type (summary/wisdom/characters/significance),
  content_data (JSON),
  generated_at,
  language
)

-- User progress tracking
user_progress (
  user_id,
  manuscript_id,
  read_status,
  quiz_score,
  badges_earned,
  last_visited
)
```

---

## 🎯 **User Journey (Pedagogical Flow)**

```
1. Landing → Feature Naskah dengan badge "Mudah Dipahami"
2. Click naskah → Lihat Educational Cards (auto-generated)
3. Baca ringkasan → Tertarik → Click "Pelajari Lebih"
4. Interactive Learning:
   - Chat dengan Learning Assistant
   - Lihat infografik
   - Main quiz mini
5. Complete → Dapat badge → Progress tracked
6. Explore related manuscripts → Continuous learning
```

---

## 🎨 **UI/UX Enhancements**

### **Homepage Redesign: Education-First**
- Hero section: "Pelajari Naskah Kuno dengan Cara Modern"
- Featured educational content carousel
- "Mulai Belajar" CTA button (bukan "Chat AI")
- Progress indicator untuk returning users

### **Manuscript View: Layered Learning**
```
Layer 1: Quick Overview (30 seconds read)
  ↓
Layer 2: Educational Cards (5 minutes)
  ↓
Layer 3: Interactive Chat (deep learning)
  ↓
Layer 4: Quiz & Assessment (knowledge check)
```

### **Visual Design: Youth-Friendly**
- Colorful badges & icons
- Smooth animations & micro-interactions
- Mobile-first responsive design
- Dark mode untuk night reading
- Emoji & modern illustrations

---

## 🤖 **AI Prompts (Pedagogical)**

### **Prompt Template untuk Ringkasan:**
```
Buat ringkasan naskah "{title}" untuk pembaca awam usia 15-25 tahun.
Gunakan bahasa Indonesia modern yang mudah dipahami.
Hindari istilah teknis. Buat menarik dan relatable.
Maksimal 5 kalimat. Format: storytelling engaging.
```

### **Prompt untuk Kearifan Lokal:**
```
Ekstrak 3-5 nilai kearifan lokal dari naskah "{title}".
Untuk setiap nilai, jelaskan:
1. Apa nilainya
2. Quote dari naskah
3. Relevansi dengan kehidupan modern anak muda
Format: Bullet points dengan emoji.
```

---

## 📊 **Technical Stack**

**New Dependencies:**
- `react-confetti` - Celebration saat dapat badge
- `framer-motion` - Smooth animations
- `chart.js` - Progress visualization
- `react-speech-kit` - Text-to-speech

**Backend Services:**
- Gemini API untuk content generation
- Caching layer untuk performance
- Rate limiting untuk fair usage

---

## ⏱️ **Implementation Phases**

### **Phase 1 (Week 1)**: Core Educational AI
- [ ] Backend: educationalAI.js service
- [ ] 4 AI endpoints (summary, wisdom, characters, significance)
- [ ] Frontend: EducationalPanel component
- [ ] Database: Cache table

### **Phase 2 (Week 2)**: Interactive Features
- [ ] LearningAssistant with prompt templates
- [ ] QuizModal with auto-generated questions
- [ ] Badge system & progress tracking
- [ ] Mobile optimization

### **Phase 3 (Week 3)**: Enhancements
- [ ] Infographic generation
- [ ] Audio reading mode
- [ ] Leaderboard (optional)
- [ ] Social sharing features

---

## 💰 **Cost Estimate**

**AI Content Generation:**
- Generate 4 cards per manuscript: ~2,000 tokens
- 121 manuscripts × 2,000 = 242,000 tokens one-time
- Cache in database → subsequent loads FREE
- Cost: ~Rp 5,000 one-time (Gemini Flash pricing)

**Ongoing:**
- Quiz generation on-demand
- Learning assistant queries
- Monthly: ~Rp 50,000 for active users

---

## 🎯 **Success Metrics**

- Time spent per manuscript: ↑ 300%
- User return rate: ↑ 500%
- Quiz completion rate: > 60%
- Mobile usage: > 70%
- User feedback: "Mudah dipahami" > 80%

---

## 🌟 **Key Differentiators**

1. **First** Javanese manuscript platform with pedagogical AI
2. **Gamified** learning experience
3. **Multi-modal** learning (text, visual, audio, interactive)
4. **Youth-focused** UX/UI design
5. **Zero barrier** - No prior knowledge needed

---

**Ready to build fitur yang akan membuat generasi muda Indonesia jatuh cinta dengan naskah kuno Jawa!** 🚀

Note: Sebelum implement, kita HARUS fix Railway backend dulu agar production site bisa gunakan RAG features.