# 🤖 Gemini Model Recommendations for Nala Pustaka

## 📊 Model Comparison (Free Tier)

### ⭐ CURRENT: gemini-2.0-flash-exp (RECOMMENDED)

**Specifications:**
```
Context Window: 1,048,576 tokens (~750,000 kata)
Input Limit: ~500,000 kata per request
Rate Limits (Free):
  - 10 RPM (Requests per minute)
  - 1,500 RPD (Requests per day)
  - 4,000,000 TPM (Tokens per minute)
  
Response Speed: 2-5 detik
Quality: Excellent (latest model)
Status: Beta (gratis unlimited)
```

**✅ Perfect untuk Nala Pustaka karena:**
- ✅ Support naskah 30,000+ kata dengan mudah
- ✅ Rate limit cukup tinggi untuk production
- ✅ GRATIS unlimited selama beta
- ✅ Response quality sangat bagus
- ✅ Fast inference time

---

### Alternative Models

#### 1. gemini-1.5-flash
```
Context Window: 1,000,000 tokens (~750,000 kata)
Rate Limits (Free):
  - 15 RPM
  - 1,500 RPD
  - 1,000,000 TPM
  
✅ Pros:
  - Stabil (bukan beta)
  - Slightly higher RPM
  - Production-ready
  
❌ Cons:
  - Sedikit lebih lambat
  - Quality sedikit di bawah 2.0-flash-exp
```

**Use case:** Production apps yang butuh stability

---

#### 2. gemini-1.5-pro
```
Context Window: 2,000,000 tokens (~1.5M kata)
Rate Limits (Free):
  - 2 RPM ⚠️ SANGAT RENDAH
  - 50 RPD
  - 4,000,000 TPM
  
✅ Pros:
  - Context window TERBESAR
  - Best quality
  
❌ Cons:
  - RPM terlalu rendah untuk production
  - Lambat (10-15 detik)
```

**Use case:** One-time analysis, research, bukan production

---

#### 3. gemini-2.0-flash-thinking-exp-1219
```
Context Window: 32,767 tokens (~24,000 kata) ⚠️
Rate Limits (Free):
  - 10 RPM
  - 1,500 RPD
  
✅ Pros:
  - "Thinking" capability (reasoning)
  - Good for complex logic
  
❌ Cons:
  - Context window TERLALU KECIL untuk naskah 30,000 kata
  - Tidak cocok untuk Nala Pustaka
```

**Use case:** Complex reasoning tasks, bukan document analysis

---

## 🎯 Recommendation untuk Nala Pustaka

### For 30,000+ Word Manuscripts:

**Model:** `gemini-2.0-flash-exp` ⭐

**Strategy:** Smart Chunking
```javascript
// Kirim 5,000 karakter pertama untuk knowledge graph
const textSample = fullText.substring(0, 5000);

// Untuk chat responses: kirim full text (30,000 kata)
const context = fullText; // Full text up to 750,000 kata
```

**Benefits:**
1. ✅ Knowledge graph: Akurat dari 5,000 karakter representatif
2. ✅ Chat responses: Bisa search di SELURUH naskah (30,000+ kata)
3. ✅ No chunking needed untuk chat
4. ✅ Fast & efficient

---

## 💰 Cost Analysis (Free Tier)

### Daily Limits

**gemini-2.0-flash-exp:**
```
1,500 requests/day
4,000,000 tokens/minute

Scenario untuk Nala Pustaka:
- 100 chat conversations/day (10-20 messages each): ✅ OK
- 10 naskah baru ditambahkan/day: ✅ OK
- Knowledge graph generation: 10/day: ✅ OK

Total usage: ~200-300 requests/day
Status: AMAN (jauh di bawah limit)
```

**Jika butuh lebih:**
- Upgrade ke paid tier: $0.15 per 1M input tokens
- Atau gunakan multiple API keys (rotation)

---

## 🔧 Current Implementation

### Chat AI (App.jsx)
```javascript
// Model: gemini-2.0-flash-exp
// Context: FULL manuscript text (up to 750,000 kata)
// Use case: User tanya tentang isi naskah

const combinedUserQuery = `
KONTEKS NASKAH (${manuscriptData.title}):
"""
${manuscriptText}  // FULL TEXT!
"""

PERTANYAAN PENGGUNA:
"""
${userQuery}
"""
`;
```

### Knowledge Graph Generation (AdminDashboard.jsx)
```javascript
// Model: gemini-2.0-flash-exp
// Context: First 5,000 characters (smart sample)
// Use case: Extract entities untuk graph

const textSample = fullText.length > 5000 
  ? fullText.substring(0, 5000) + '\n\n[... naskah dilanjutkan ...]'
  : fullText;
```

**Why 5,000 characters?**
- ✅ Representative sample dari naskah
- ✅ Fast generation (~3-5 detik)
- ✅ Akurat untuk extract tokoh, konsep, tema utama
- ✅ Hemat tokens

---

## 📈 Performance Benchmarks

### Real-world Test (Serat Tatacara: 102,844 karakter)

**Chat Response:**
```
Input: Full text (102,844 karakter = ~30,000 kata)
Model: gemini-2.0-flash-exp
Time: ~4 detik
Quality: Excellent (bisa jawab detail spesifik dari seluruh naskah)
```

**Knowledge Graph:**
```
Input: 5,000 karakter pertama
Model: gemini-2.0-flash-exp
Time: ~3 detik
Output: 10-12 nodes dengan relasi akurat
Quality: Very good (capture elemen penting)
```

---

## 🚀 Future Scaling

### Jika traffic meningkat:

**Option 1: API Key Rotation**
```javascript
const apiKeys = [
  'key1_for_chat',
  'key2_for_knowledge_graph',
  'key3_for_backup'
];

// Rotate based on usage
const currentKey = apiKeys[requestCount % apiKeys.length];
```

**Option 2: Upgrade to Paid**
```
gemini-2.0-flash-exp (Paid):
- Rate Limit: 1,000 RPM
- $0.15 per 1M input tokens
- $0.60 per 1M output tokens

Estimasi cost untuk 1,000 requests/day:
- Input: 30,000 kata x 1,000 = 30M kata = ~40M tokens
- Cost: 40 x $0.15 = $6/day = ~$180/month
```

**Option 3: Hybrid Model**
```javascript
// Chat: gemini-2.0-flash-exp (high volume)
// Knowledge Graph: gemini-1.5-pro (better quality, low volume)
```

---

## ⚠️ Common Pitfalls

### ❌ DON'T: Use thinking model for long text
```javascript
// BAD: Context window too small
model: "gemini-2.0-flash-thinking-exp-1219"
input: 30,000 kata naskah
result: ERROR - exceed context limit
```

### ❌ DON'T: Send full text for knowledge graph
```javascript
// BAD: Waste tokens, slow generation
const textSample = fullText; // 100,000+ karakter
result: 10-15 detik, over-kompleks graph
```

### ✅ DO: Smart chunking based on use case
```javascript
// GOOD: Optimal for each task
// Chat: Full text (comprehensive answers)
// Knowledge Graph: 5,000 char sample (fast + accurate)
```

---

## 📊 Summary Table

| Model | Context Window | Free RPM | Free RPD | Best For |
|-------|---------------|----------|----------|----------|
| **gemini-2.0-flash-exp** ⭐ | 1M tokens | 10 | 1,500 | **Nala Pustaka (30K+ words)** |
| gemini-1.5-flash | 1M tokens | 15 | 1,500 | Production stability |
| gemini-1.5-pro | 2M tokens | 2 | 50 | One-time analysis |
| gemini-2.0-flash-thinking | 32K tokens | 10 | 1,500 | Complex reasoning (NOT for long text) |

---

## 🎯 Final Recommendation

**Untuk Nala Pustaka dengan naskah 30,000+ kata:**

✅ **USE: `gemini-2.0-flash-exp`**

**Alasan:**
1. Context window cukup besar (1M tokens = 750,000 kata)
2. Rate limit cukup untuk production (10 RPM)
3. GRATIS unlimited (beta)
4. Fast response (2-5 detik)
5. Best quality

**Configuration:**
- Chat AI: Full text
- Knowledge Graph: 5,000 char sample
- Temperature: 0.3 (factual)
- Max tokens: 1024 (output)

**Status:** ✅ IMPLEMENTED & DEPLOYED

---

**Updated:** November 13, 2025
**Model Version:** gemini-2.0-flash-exp (latest)
