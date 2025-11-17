# Scraper Naskah Babad - Sastra.org

Script untuk scraping naskah-naskah Babad dari koleksi Kisah, Cerita, dan Kronikal di sastra.org.

## Cara Menggunakan

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Jalankan Script

```bash
python scraper.py
```

### 3. Hasil

Semua naskah akan tersimpan di folder `naskah_babad/` dengan format:
- `001_Judul_Naskah.txt`
- `002_Judul_Naskah.txt`
- dst.

Setiap file berisi:
- Judul naskah
- URL sumber
- Konten lengkap naskah

## Catatan

- Script menggunakan delay 2 detik antar request untuk menghormati server
- Jika ada error, script akan melanjutkan ke naskah berikutnya
- Nama file dibersihkan dari karakter tidak valid dan dibatasi 200 karakter

## Troubleshooting

Jika selector HTML tidak cocok (tidak ada naskah ditemukan), Anda perlu:
1. Buka halaman koleksi di browser
2. Inspect element untuk melihat struktur HTML
3. Update selector di fungsi `get_manuscript_links()` dan `scrape_manuscript()`
