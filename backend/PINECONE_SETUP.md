# Panduan Setup Pinecone untuk Nala Pustaka

## Step 1: Buat Akun Pinecone

1. Buka https://www.pinecone.io/
2. Sign up (gunakan GitHub atau email)
3. Login ke dashboard: https://app.pinecone.io/

## Step 2: Buat Index Baru

1. Di dashboard, klik **"Create Index"**
2. Isi form dengan detail berikut:

   ```
   Index Name: nala-pustaka
   Dimensions: 768
   Metric: cosine
   Pod Type: Starter (Free tier)
   Region: Pilih region terdekat (misalnya us-west-2)
   ```

3. Klik **"Create Index"**
4. Tunggu beberapa saat sampai index status = "Ready"

## Step 3: Dapatkan API Key

1. Di dashboard, klik menu **"API Keys"** di sidebar kiri
2. Copy **API Key** yang ditampilkan
3. Catat juga **Environment** (misalnya: `us-west-2-aws` atau `gcp-starter`)

## Step 4: Update File .env

Buka file `backend/.env` dan update:

```env
# Pinecone Configuration
PINECONE_API_KEY=pcsk_xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxx  # <-- Paste API key di sini
PINECONE_ENVIRONMENT=us-west-2-aws                      # <-- Sesuaikan dengan region
PINECONE_INDEX_NAME=nala-pustaka                        # <-- Nama index yang dibuat
```

## Step 5: Verifikasi Setup

Setelah update .env, test koneksi:

```bash
cd backend
npm start
```

Jika berhasil, akan muncul:
```
✅ Vector DB initialized
✅ Connected to Pinecone index: nala-pustaka
🚀 Server running on port 3001
```

## Troubleshooting

### Error: "API key was rejected"
- ✅ Pastikan API key sudah benar (copy ulang dari dashboard)
- ✅ Pastikan tidak ada spasi di awal/akhir
- ✅ Restart terminal setelah update .env

### Error: "Index not found"
- ✅ Pastikan nama index di .env sama dengan yang dibuat
- ✅ Tunggu sampai index status = "Ready" di dashboard

### Error: "Invalid dimension"
- ✅ Pastikan dimension = **768** (sesuai dengan embedding model)
- ✅ Jika salah, hapus index lama dan buat ulang

## Catatan Penting

- **Free Tier Limits**: 1 index, 100K vectors (~60-80 naskah dengan chunking)
- Jika butuh lebih, upgrade ke Starter plan ($70/month) atau gunakan alternatif (Qdrant self-hosted)
- Index tidak bisa diubah dimensionnya setelah dibuat

## Verifikasi di Dashboard

Setelah ingestion selesai, cek di Pinecone dashboard:
- **Vectors**: Harus ada ~50,000+ vectors (untuk 121 naskah)
- **Queries**: Akan meningkat setiap kali ada search