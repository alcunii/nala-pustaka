# 🚀 Deployment Guide - Nala Pustaka

## 🔍 Situasi Saat Ini

**Frontend (nalapustaka.org)**: ONLINE tapi versi lama (tanpa RAG)
**Backend (localhost:3001)**: Hanya running di komputer lokal Anda

**Solusi**: Deploy backend ke internet + update frontend

---

## ⚡ Quick Start - Railway.app (15 menit)

### Step 1: Deploy Backend

1. **Signup Railway**: https://railway.app
2. **New Project** → "Deploy from GitHub repo"
3. **Select**: `alcunii/nala-pustaka`
4. **Settings** → Root Directory: `backend`
5. **Variables** → Add all API keys (lihat backend/.env.example)
6. **Deploy!**

### Step 2: Update Frontend

1. Copy backend URL dari Railway (e.g., `https://xxx.up.railway.app`)
2. Vercel Dashboard → Settings → Environment Variables
3. Add: `VITE_RAG_API_URL=https://your-backend-url`
4. Deployments → Redeploy

### Step 3: Verify

Visit https://nalapustaka.org → Should see "RAG Search" button! ✅

---

## 📋 Detailed Guide

### Railway Backend Deployment

#### 1. Signup & Connect GitHub
- Go to railway.app
- Click "Start New Project"
- Login with GitHub
- Authorize Railway

#### 2. Create Project
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose: `alcunii/nala-pustaka`

#### 3. Configure Service
- Click on service
- Settings → Root Directory: `backend`
- Settings → Start Command: `npm start`

#### 4. Environment Variables

Add these in Variables tab:

```bash
NODE_ENV=production
PORT=3001

# Pinecone
PINECONE_API_KEY=your_key_here
PINECONE_ENVIRONMENT=us-west1-gcp
PINECONE_INDEX_NAME=nala-pustaka-babad

# HuggingFace
HF_API_KEY=your_key_here

# Gemini
GEMINI_API_KEY=your_key_here

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_key_here
SUPABASE_SERVICE_ROLE_KEY=your_key_here

# CORS
CORS_ORIGIN=https://nalapustaka.org
```

**Get API Keys:**
- Pinecone: https://app.pinecone.io
- HuggingFace: https://huggingface.co/settings/tokens
- Gemini: https://makersuite.google.com/app/apikey
- Supabase: Your project dashboard

#### 5. Deploy
- Click Deploy
- Wait 3-5 minutes
- Get backend URL from Railway dashboard

#### 6. Test Backend
```bash
curl https://your-backend-url/health
```

Should return: `{"status":"ok"}`

---

### Vercel Frontend Update

#### 1. Add Environment Variable
- Vercel Dashboard: https://vercel.com
- Select project: `nala-pustaka`
- Settings → Environment Variables
- Add new variable:
  - Name: `VITE_RAG_API_URL`
  - Value: `https://your-railway-backend-url`
  - Environment: Production

#### 2. Redeploy
Option A - Dashboard:
- Deployments tab
- Click latest deployment
- Redeploy

Option B - CLI:
```bash
cd D:\OneDrive\002_Proyek\Vibe Coding\nala-pustaka
vercel --prod
```

#### 3. Verify
- Visit https://nalapustaka.org
- Hard refresh (Ctrl+Shift+R)
- Should see "RAG Search" button in header

---

## 🧪 Testing Checklist

- [ ] Backend health check working
- [ ] Frontend shows RAG Search button
- [ ] Search modal opens
- [ ] Search returns results
- [ ] Deep Chat opens
- [ ] AI responds with answers

---

## 🔧 Troubleshooting

### Backend Won't Deploy

**Problem**: Railway build fails

**Solution**:
1. Check Railway logs
2. Verify `backend/package.json` scripts:
```json
"scripts": {
  "start": "node src/server.js"
}
```

### CORS Errors

**Problem**: Frontend can't connect to backend

**Solution**:
1. Check Railway CORS_ORIGIN matches frontend domain
2. Should be: `CORS_ORIGIN=https://nalapustaka.org`

### RAG Button Not Appearing

**Problem**: Frontend still shows old version

**Solution**:
1. Verify VITE_RAG_API_URL is set in Vercel
2. Redeploy frontend (no cache)
3. Hard refresh browser

---

## 💰 Cost

**Railway Free Tier**:
- 500 hours/month execution
- $5 credit/month
- Perfect for development

**Vercel Free Tier**:
- Unlimited bandwidth
- 100 GB-hours/month

**Total**: $0/month (within free tiers) 🎉

---

## 🎯 Expected Result

After deployment, visiting https://nalapustaka.org:

1. See "RAG Search" button (top right)
2. Click → Modal opens
3. Search "Pangeran Mangkubumi"
4. See 5 results with scores
5. Click "💬 Chat dengan naskah ini"
6. Deep Chat modal opens
7. AI answers questions with citations

---

## 🔗 Links

- Railway: https://railway.app/dashboard
- Vercel: https://vercel.com/dashboard
- GitHub: https://github.com/alcunii/nala-pustaka
- Production: https://nalapustaka.org
