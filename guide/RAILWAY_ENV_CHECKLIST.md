# 🔧 RAILWAY ENVIRONMENT VARIABLES CHECKLIST

## ⚠️ CRITICAL: Variable Names Harus EXACT!

Railway environment variables **case-sensitive** dan harus EXACT match dengan config.

---

## ✅ COPY-PASTE VARIABLE NAMES (Exact!)

Di Railway Variables tab, add EXACTLY these names:

```
NODE_ENV=production
PORT=3001

PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=us-west1-gcp
PINECONE_INDEX_NAME=nala-pustaka-babad

HF_API_KEY=your_huggingface_token

GEMINI_API_KEY=your_gemini_api_key

SUPABASE_URL=https://eosclaiinbnebgrjsgsp.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

CORS_ORIGIN=https://nalapustaka.org
```

---

## 📋 Required Variables Checklist

Copy this list and check each one in Railway:

- [ ] PINECONE_API_KEY (NOT pinecone_api_key!)
- [ ] PINECONE_ENVIRONMENT (NOT pinecone_environment!)
- [ ] PINECONE_INDEX_NAME (NOT pinecone_index!)
- [ ] HF_API_KEY (NOT huggingface_api_key!)
- [ ] GEMINI_API_KEY (NOT gemini_api_key!)
- [ ] SUPABASE_URL
- [ ] SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY (optional tapi recommended)
- [ ] CORS_ORIGIN

---

## 🎯 How to Set in Railway

1. Railway Dashboard → Your Project
2. Click backend service
3. Click **Variables** tab
4. Click **+ New Variable**
5. For each variable:
   - Name: [EXACT name dari list di atas]
   - Value: [Your API key]
6. Click **Add**

**Setelah add ALL variables:**
- Railway will auto-redeploy
- Wait 2-3 minutes
- Backend should start successfully

---

## ✅ Expected Success Logs (After Setting Vars)

```
✓ npm ci
✓ npm start
✓ Server running on port 3001
✓ Vector DB initialized
✓ Connected to Pinecone index: nala-pustaka-babad
```

---

## 🔍 How to Get Each API Key

### PINECONE_API_KEY
1. https://app.pinecone.io
2. API Keys section
3. Copy your key
4. PINECONE_ENVIRONMENT: Check your index region (e.g., us-west1-gcp)
5. PINECONE_INDEX_NAME: nala-pustaka-babad

### HF_API_KEY (HuggingFace)
1. https://huggingface.co/settings/tokens
2. Create new token (Read access)
3. Copy token

### GEMINI_API_KEY
1. https://makersuite.google.com/app/apikey
2. Create API Key
3. Copy key

### SUPABASE
Already in your .env file:
- URL: https://eosclaiinbnebgrjsgsp.supabase.co
- ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

---

## ⚠️ Common Mistakes

1. ❌ Lowercase variable names (pinecone_api_key)
   ✅ Should be: PINECONE_API_KEY

2. ❌ Different variable names (PINECONE_KEY)
   ✅ Should be: PINECONE_API_KEY

3. ❌ Extra spaces in values
   ✅ Trim whitespace

4. ❌ Missing quotes for special characters
   ✅ Railway handles this automatically

---

## 🧪 After Setting Variables

Test backend:
```bash
curl https://nala-pustaka-production.up.railway.app/health
```

Expected:
```json
{
  "status": "ok",
  "message": "RAG Backend API is running"
}
```

If you get this, backend is ONLINE! ✅

---

## 🎯 Then Test RAG Search

Visit https://nalapustaka.org:
1. Click "RAG Search"
2. Search "Pangeran Mangkubumi"
3. Should see results! ✅

