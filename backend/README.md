# Nala Pustaka Backend - RAG API

Backend API untuk sistem RAG (Retrieval-Augmented Generation) Nala Pustaka.

## Prerequisites

Sebelum memulai, pastikan sudah setup semua API keys:

1. **Pinecone** - Vector database untuk semantic search
   - 📖 Ikuti panduan: [PINECONE_SETUP.md](./PINECONE_SETUP.md)
2. **HuggingFace** - Untuk embedding generation
   - Daftar di: https://huggingface.co/
   - Buat API token: https://huggingface.co/settings/tokens
3. **Google Gemini** - LLM untuk chat
   - Daftar di: https://ai.google.dev/
   - Dapatkan API key: https://aistudio.google.com/apikey
4. **Supabase** - Database untuk metadata
   - Gunakan project yang sudah ada di Nala Pustaka frontend

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` ke `.env` dan isi semua API keys:

```bash
cp .env.example .env
# Edit .env dan isi API keys
```

### 3. Setup Pinecone (PENTING!)

Ikuti panduan lengkap di [PINECONE_SETUP.md](./PINECONE_SETUP.md)

### 4. Test All Services (PENTING!)``bash`nnpm run test-services``Script ini akan test koneksi ke HuggingFace dan Pinecone. **Harus sukses semua sebelum ingestion!**`n`n### 5. Test Server

```bash
npm start
```

Server: http://localhost:3001

Buka http://localhost:3001/health untuk test koneksi.

### 6. Run Data Ingestion (1x saja!)

**HANYA setelah server berjalan sukses!**

```bash
npm run ingest
```

⏱️ Estimasi: 20-40 menit untuk 121 naskah

## API Endpoints

- `GET /health` - Health check dan service status
- `POST /api/search` - Semantic search dalam naskah
- `POST /api/rag-chat` - RAG chat dengan context window
- `POST /api/deep-chat` - Chat mendalam dengan full manuscript context
- `POST /api/chat/multi-manuscript` - Chat dengan beberapa naskah sekaligus
- `POST /api/educational/generate` - Generate konten edukatif (summary, quiz, etc)
- `POST /api/get-full-manuscript` - Retrieve full text naskah

### Example: Search

```bash
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Sejarah Mangir",
    "topK": 5,
    "minScore": 0.7
  }'
```

## Tech Stack

- Express.js - REST API server
- Pinecone - Vector database
- HuggingFace - Embedding generation
- Google Gemini - LLM untuk chat
- Supabase - Metadata storage
- Winston - Logging

## Troubleshooting

### Server gagal start

1. ✅ Cek semua API keys di `.env` sudah benar
2. ✅ Verifikasi Pinecone index sudah dibuat (lihat PINECONE_SETUP.md)
3. ✅ Test koneksi internet

### Ingestion gagal

1. ✅ Pastikan folder `data_naskah/naskah_babad` ada dan berisi file .txt
2. ✅ Cek HuggingFace API key masih valid
3. ✅ Tunggu beberapa detik jika ada rate limit

### Search tidak menemukan hasil

1. ✅ Pastikan ingestion sudah selesai
2. ✅ Cek di Pinecone dashboard apakah ada vectors
3. ✅ Turunkan `minScore` threshold (coba 0.5)
