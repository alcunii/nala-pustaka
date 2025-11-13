# 🔑 Cara Menggunakan Gemini API di Nala Pustaka

## Mendapatkan API Key (Gratis)

1. **Kunjungi Google AI Studio**
   - Buka: https://aistudio.google.com/app/apikey
   - Login dengan akun Google Anda

2. **Buat API Key**
   - Klik tombol "Create API Key"
   - Pilih project atau buat project baru
   - Copy API Key yang dihasilkan

3. **Masukkan API Key ke Aplikasi**
   - Buka file: `src/App.jsx`
   - Cari komponen `ChatPanel`
   - Temukan baris: `const apiKey = '';`
   - Ganti dengan: `const apiKey = 'PASTE_API_KEY_ANDA_DI_SINI';`

## Contoh

```javascript
// Di dalam komponen ChatPanel (sekitar baris 141)
function ChatPanel({ manuscript }) {
  // ... state lainnya ...
  
  // Ganti ini:
  const apiKey = '';
  
  // Menjadi:
  const apiKey = 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX'; // API Key Anda
```

## Keamanan

⚠️ **PENTING**: 
- Jangan commit API Key ke repository public
- Untuk production, gunakan environment variables
- API Key ini hanya untuk development/demo

## Cara Menggunakan (Production)

Untuk production yang lebih aman, gunakan environment variables:

1. Buat file `.env` di root project:
```
VITE_GEMINI_API_KEY=your_api_key_here
```

2. Update kode di `ChatPanel`:
```javascript
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
```

3. Tambahkan `.env` ke `.gitignore`:
```
.env
.env.local
```

## Fitur RAG yang Diimplementasikan

✅ **Retrieval**: Mengambil konteks dari `manuscript.fullText`
✅ **Augmented**: Menambahkan konteks ke user query
✅ **Generation**: Gemini menghasilkan jawaban berdasarkan konteks

### System Prompt
Aplikasi menggunakan system instruction yang kuat untuk:
- Memastikan AI hanya menjawab berdasarkan konteks naskah
- Mencegah halusinasi
- Memberikan sitasi dari naskah
- Jawaban dalam Bahasa Indonesia

### Generation Config
- **Temperature**: 0.3 (rendah untuk lebih faktual)
- **TopP**: 0.8
- **TopK**: 40
- **MaxTokens**: 1024

## Troubleshooting

### Error: "API Key belum diisi"
- Pastikan Anda sudah mengisi `apiKey` di komponen ChatPanel

### Error: "API Error: 400"
- Periksa format API Key
- Pastikan API Key valid dan aktif

### Error: "API Error: 429"
- Anda mencapai quota limit
- Tunggu beberapa saat atau upgrade plan

## Model yang Digunakan

**Gemini 2.0 Flash Experimental**
- Model: `gemini-2.0-flash-exp`
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/`
- Gratis untuk penggunaan personal

## Quota Gratis

Google AI Studio memberikan:
- 15 RPM (Requests Per Minute)
- 1,500 RPD (Requests Per Day)
- 1 million TPM (Tokens Per Minute)

Cukup untuk development dan demo! 🚀
