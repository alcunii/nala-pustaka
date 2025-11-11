# 🎯 User Guide - Nala Pustaka

## Selamat Datang! 

Nala Pustaka adalah aplikasi web interaktif untuk mengeksplorasi naskah kuno Jawa menggunakan AI modern.

## 📖 Cara Menggunakan

### 1. **Halaman Utama (Welcome Screen)**

Saat pertama kali membuka aplikasi, Anda akan melihat:
- **Welcome message** dengan penjelasan tentang Nala Pustaka
- **Fitur Cards**: 
  - 💬 Pustakawan AI - Chat dengan AI tentang naskah
  - 🔮 Peta Pengetahuan - Visualisasi Knowledge Graph
- **Call to Action**: Petunjuk untuk memilih naskah dari panel kiri
- **Tech Badges**: Teknologi yang digunakan (Gemini, RAG, D3.js)

### 2. **Memilih Naskah**

**Panel Kiri - Pustaka Digital:**
- Terdapat 3 naskah klasik Jawa:
  1. **Serat Wulangreh** - Pakubuwana IV (Ajaran moral dan etika kepemimpinan)
  2. **Serat Centhini** - Tim Penulis Istana (Ensiklopedia kebudayaan Jawa)
  3. **Serat Kalatidha** - Ranggawarsita (Refleksi atas zaman ketidakpastian)

**Cara Memilih:**
- Klik salah satu card naskah
- Card akan highlight dengan border amber
- Panel kanan akan otomatis menampilkan mode Chat

### 3. **Mode Chat (Pustakawan AI)** 💬

**Header Chat:**
- Judul: "Pustakawan AI: Bertanya tentang [Nama Naskah]"
- Deskripsi fitur

**Fitur:**
- **Pesan Sambutan**: AI akan menyapa saat pertama kali naskah dipilih
- **Input Chat**: Ketik pertanyaan di input field
- **Kirim Pesan**: Tekan tombol "Kirim" atau Enter
- **Loading State**: Animasi bouncing dots saat AI "berpikir"
- **Balasan AI**: Jawaban grounded berdasarkan isi naskah
- **Auto-scroll**: Otomatis scroll ke pesan terbaru

**Contoh Pertanyaan:**
```
- "Apa pesan moral utama dalam naskah ini?"
- "Siapa saja tokoh yang disebutkan?"
- "Jelaskan makna dari bait pertama"
- "Apa filosofi yang terkandung dalam teks ini?"
- "Bagaimana ajaran tentang kepemimpinan?"
```

**Catatan Penting:**
⚠️ **API Key Required**: Untuk menggunakan fitur chat, Anda harus:
1. Mendapatkan API Key dari https://aistudio.google.com/app/apikey
2. Buka file `src/App.jsx`
3. Cari komponen `ChatPanel`
4. Isi variabel `const apiKey = 'YOUR_API_KEY_HERE';`

Lihat [README_API.md](./README_API.md) untuk panduan lengkap.

### 4. **Mode Knowledge Graph (Peta Pengetahuan)** 🔮

**Toggle ke Mode Graph:**
- Klik tombol "🔮 Graph" di header panel kanan
- Tombol akan highlight dengan background amber

**Fitur Visualisasi:**
- **Nodes (Titik)**: Mewakili entitas dalam naskah
  - 🟠 Amber: Karya/Naskah
  - 🔵 Blue: Tokoh
  - 🟢 Green: Konsep
  - 🟣 Purple: Struktur (Pupuh, dll)
  
- **Links (Garis)**: Hubungan antar entitas
  - Memiliki label (Pengarang, Berisi, Membahas, dll)
  - Directed arrows menunjukkan arah relasi

**Interaksi:**
- **Drag Node**: Klik dan drag titik untuk mengatur posisi
- **Zoom**: Scroll mouse untuk zoom in/out (0.5x - 3x)
- **Pan**: Drag background untuk geser canvas
- **Hover**: Hover di atas node untuk efek zoom

**Legend:**
- Di atas canvas terdapat legend warna untuk membantu identifikasi

**Tips:**
💡 Displayed di bagian bawah canvas

### 5. **Toggle Antara Mode**

**Tab Buttons:**
- Tersedia di header panel kanan (saat naskah dipilih)
- **💬 Chat**: Switch ke mode Pustakawan AI
- **🔮 Graph**: Switch ke mode Knowledge Graph
- Button yang aktif akan highlight dengan background amber

**Auto-Reset:**
- Saat memilih naskah baru, otomatis kembali ke mode Chat
- History chat akan di-reset (pesan sambutan baru)
- Knowledge Graph akan update sesuai naskah yang dipilih

## 🎨 UI/UX Features

### Color Scheme (Warisan Budaya)
- **Cream** (#fdf8f0): Warna kertas kuno
- **Stone** (#292524): Warna tinta tradisional  
- **Amber** (#d97706): Aksen emas kerajaan

### Responsive Design
- **Desktop**: Layout 2 kolom (1/3 kiri, 2/3 kanan)
- **Mobile**: Stack vertikal (panel kiri di atas)

### Animations & Transitions
- Smooth tab switching
- Loading indicators
- Hover effects
- Force simulation di Knowledge Graph
- Auto-scroll di chat

## 🔧 Advanced Features

### RAG (Retrieval-Augmented Generation)
- AI hanya menjawab berdasarkan **konteks naskah**
- Mencegah **halusinasi**
- Memberikan **sitasi** dari naskah
- Temperature rendah (0.3) untuk jawaban faktual

### Force-Directed Graph
- Physics simulation untuk layout otomatis
- Interactive & dynamic positioning
- Collision detection mencegah overlap

## 🐛 Troubleshooting

### Chat tidak berfungsi
- Pastikan API Key sudah diisi
- Check console browser untuk error message
- Verifikasi koneksi internet

### Knowledge Graph tidak muncul
- Refresh browser
- Clear cache
- Check console untuk D3.js errors

### Naskah tidak bisa dipilih
- Refresh aplikasi
- Check network tab di DevTools

## 📱 Keyboard Shortcuts

- **Enter**: Kirim pesan di chat (saat input focused)
- **Scroll**: Zoom di Knowledge Graph
- **Click + Drag**: Pan/move di Knowledge Graph

## 🎓 Learning Path

**Untuk Pengguna Baru:**
1. Mulai dengan **Serat Wulangreh** (paling populer)
2. Gunakan mode **Chat** untuk bertanya tentang isi naskah
3. Eksplorasi mode **Graph** untuk melihat struktur pengetahuan
4. Coba naskah lain untuk perbandingan

**Untuk Advanced Users:**
1. Bandingkan jawaban AI untuk pertanyaan yang sama di naskah berbeda
2. Eksplorasi Knowledge Graph untuk menemukan pola
3. Gunakan drag-drop di graph untuk analisis visual
4. Export/screenshot hasil untuk dokumentasi

## 📚 Naskah yang Tersedia

### 1. Serat Wulangreh
- **Pengarang**: Pakubuwana IV
- **Tema**: Ajaran moral dan etika kepemimpinan Jawa
- **Pupuh**: Dhandhanggula
- **Konsep Kunci**: Moral, Kepemimpinan, Kebijaksanaan

### 2. Serat Centhini  
- **Pengarang**: Tim Penulis Istana
- **Tema**: Ensiklopedia kebudayaan Jawa komprehensif
- **Tokoh**: Sèh Amongraga, Sèh Amongrasa, Nyi Tembangraras
- **Konsep Kunci**: Perjalanan, Ilmu Pengetahuan, Kebudayaan

### 3. Serat Kalatidha
- **Pengarang**: Ranggawarsita
- **Tema**: Refleksi atas zaman yang penuh ketidakpastian
- **Pupuh**: Sinom
- **Konsep Kunci**: Jaman Edan, Kalabendu, Refleksi

## 🌟 Best Practices

### Untuk Pertanyaan Chat
✅ **DO:**
- Tanya tentang isi spesifik naskah
- Minta penjelasan konsep yang disebutkan
- Tanya tentang konteks historis dalam naskah
- Minta sitasi dari bait tertentu

❌ **DON'T:**
- Tanya hal di luar konteks naskah
- Minta AI membuat puisi baru
- Tanya tentang naskah lain yang tidak dipilih

### Untuk Knowledge Graph
✅ **DO:**
- Eksplorasi hubungan antar konsep
- Drag node untuk clarity
- Zoom untuk detail
- Screenshot untuk referensi

❌ **DON'T:**
- Over-zoom (bisa kehilangan konteks)
- Drag terlalu cepat (simulation perlu stabilize)

## 🎯 Goals & Impact

**Demokratisasi:**
- Akses mudah ke naskah kuno
- Tidak perlu expertise filologi untuk memahami
- Interface modern untuk generasi muda

**Konservasi:**
- Preservasi digital warisan budaya
- Knowledge Graph untuk dokumentasi struktur
- AI untuk interpretasi berkelanjutan

**Edukasi:**
- Learning tool untuk pelajar
- Research tool untuk akademisi
- Cultural awareness untuk masyarakat umum

---

**Selamat Menjelajah Kearifan Leluhur! 🙏**

*Nala Pustaka - Membuka hati dan pikiran untuk belajar dari kebijaksanaan Jawa*
