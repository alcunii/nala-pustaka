# Dokumentasi Scraping Sastra.org

## Ringkasan Teknis

Website **sastra.org** menggunakan **AJAX dinamis** untuk memuat daftar naskah. Halaman HTML statis hanya menampilkan 12-13 naskah pertama, sedangkan sisanya dimuat via JavaScript.

### Endpoint AJAX

```
https://www.sastra.org/sastra/koleksi/koleksi.inx.php?param={JSON_ENCODED}
```

### Struktur Parameter

```json
{
  "sn": "koleksi",
  "ui": "691aa8f9f3caa",
  "us": 0,
  "koleksi": {
    "cs": "adens",
    "fc": 11,      // ID Kategori
    "fs": 46,      // ID Sub-kategori
    "nr": 20,      // Jumlah item per halaman
    "ps": 0,       // Offset (0, 20, 40, 60, ...)
    "sk": "",      // Search keyword (kosong = semua)
    "sl": 2,       // Search level
    "el": "judul"  // Element
  }
}
```

## Daftar Kategori dan Sub-kategori

### 1. Agama dan Kepercayaan (fc=10)
- `fs=48` - Kebatinan dan Mistik
- `fs=30` - Kitab Suci
- `fs=39` - Suluk
- `fs=58` - Wulang

### 2. Arsip dan Sejarah (fc=9)
- `fs=76` - Editorial
- `fs=31` - Galeri
- `fs=71` - Hukum dan Pemerintahan
- `fs=51` - Kasunanan
- `fs=49` - Mangkunagaran
- `fs=33` - Mayor, J. F. T.
- `fs=37` - Radya Pustaka
- `fs=22` - Radya Pustaka, Surat-menyurat
- `fs=26` - Rănggawarsita, R. Ng.
- `fs=32` - Sasradiningrat II, K. R. A.
- `fs=44` - Surakarta
- `fs=81` - Surat-menyurat
- `fs=50` - Umum

### 3. Bahasa dan Budaya (fc=12)
- `fs=36` - Adat dan Tradisi
- `fs=62` - Bacaan Huruf Jawa
- `fs=59` - Gending dan Notasi
- `fs=67` - Kagunan
- `fs=41` - Kamus dan Leksikon
- `fs=23` - Karawitan
- `fs=68` - Panêmbrama dan Ibêr
- `fs=52` - Pawukon dan Primbon
- `fs=53` - Pengetahuan Bahasa
- `fs=63` - Wayang

### 4. Kisah, Cerita dan Kronikal (fc=11)
- `fs=46` - Babad (121 naskah) ✅
- `fs=43` - Babad Giyanti
- `fs=42` - Babad Tanah Jawi
- `fs=47` - Cerita
- `fs=64` - Dongeng
- `fs=72` - Mahabharata
- `fs=73` - Menak
- `fs=65` - Novel
- `fs=25` - Riwayat dan Perjalanan
- `fs=34` - Sêrat Cênthini

### 5. Koran, Majalah dan Jurnal (fc=13)
- `fs=45` - Almanak
- `fs=54` - Candrakanta
- `fs=57` - Kajawèn
- `fs=28` - Kawi
- `fs=75` - Kumandang Teyosupi
- `fs=55` - Mardi Siwi
- `fs=56` - Narpawandawa
- `fs=27` - Pusaka Jawi
- `fs=35` - Sasadara
- `fs=61` - Umum
- `fs=74` - Wara Susila

## Cara Menggunakan

### 1. Scraping Kategori Tertentu

Edit file `scraper_ajax.py`, ubah parameter:

```python
param = {
    "sn": "koleksi",
    "ui": "691aa8f9f3caa",
    "us": 0,
    "koleksi": {
        "cs": "adens",
        "fc": 11,  # <-- Ganti dengan ID kategori
        "fs": 46,  # <-- Ganti dengan ID sub-kategori
        "nr": 20,
        "ps": offset,
        "sk": "",
        "sl": 2,
        "el": "judul"
    }
}
```

### 2. Scraping Semua Sub-kategori

Buat script baru yang loop semua sub-kategori dalam satu kategori.

### 3. Output

Setiap naskah disimpan sebagai file `.txt` dengan format:
```
{nomor}_{judul_naskah}.txt
```

Contoh:
```
001_Babad_Bedhahipun_ing_Mangir_Sasrawinata_1922_930.txt
002_Babad_Demak_Dewabrata_1914_1295.txt
```

## Struktur Scraper

### File Utama
- `scraper_ajax.py` - Scraper utama menggunakan AJAX endpoint
- `scraper.py` - Scraper lama (tidak efektif, hanya dapat 12 naskah)
- `scraper_advanced.py` - Scraper lama dengan pagination (tidak efektif)

### Fungsi Penting

#### `get_manuscript_links_ajax()`
Mengambil semua link naskah dari AJAX endpoint dengan pagination otomatis.

#### `scrape_manuscript(url)`
Scrape konten dari halaman naskah individual.

#### `save_manuscript(manuscript, index)`
Simpan naskah ke file txt.

## Tips Scraping

### 1. Rate Limiting
Gunakan delay 1-2 detik antar request untuk menghormati server:
```python
time.sleep(2)
```

### 2. Error Handling
Script sudah dilengkapi try-except untuk handle error gracefully.

### 3. Progress Tracking
Script menampilkan progress real-time:
```
Mengambil offset 0...
  Ditemukan 20 naskah baru (Total: 20)
Mengambil offset 20...
  Ditemukan 20 naskah baru (Total: 40)
...
```

### 4. Resume Scraping
Jika scraping terputus, cek folder output dan mulai dari nomor terakhir.

## Contoh Workflow untuk Ribuan Naskah

### Script Multi-Kategori

```python
# Daftar kategori yang akan di-scrape
categories = [
    {"fc": 11, "fs": 46, "name": "Babad"},
    {"fc": 11, "fs": 43, "name": "Babad_Giyanti"},
    {"fc": 11, "fs": 42, "name": "Babad_Tanah_Jawi"},
    # ... tambahkan semua kategori
]

for cat in categories:
    OUTPUT_DIR = f"naskah_{cat['name']}"
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Update parameter dengan fc dan fs dari kategori
    # Jalankan scraping
    # ...
```

## Troubleshooting

### Masalah: Hanya dapat 12-13 naskah
**Solusi:** Gunakan `scraper_ajax.py`, bukan `scraper.py` atau `scraper_advanced.py`

### Masalah: Request timeout
**Solusi:** Tambah timeout dan retry logic:
```python
response = requests.get(url, headers=HEADERS, timeout=30)
```

### Masalah: Konten tidak lengkap
**Solusi:** Periksa selector HTML di fungsi `scrape_manuscript()`. Website mungkin mengubah struktur HTML.

### Masalah: Blocked by server
**Solusi:** 
- Tambah delay lebih lama (3-5 detik)
- Gunakan rotating user agents
- Scrape di jam-jam sepi

## Estimasi Waktu

Dengan delay 2 detik per naskah:
- 100 naskah = ~3-4 menit
- 1000 naskah = ~30-40 menit
- 5000 naskah = ~2.5-3 jam

## Catatan Penting

1. **Selalu hormati robots.txt** website
2. **Jangan overload server** dengan request terlalu cepat
3. **Backup data** secara berkala
4. **Verifikasi hasil** scraping secara sampling
5. **Update dokumentasi** jika ada perubahan struktur website

## Lisensi dan Etika

- Data dari sastra.org adalah milik Yayasan Sastra Lestari
- Gunakan data untuk tujuan penelitian dan pendidikan
- Cantumkan sumber: sastra.org
- Jangan republish tanpa izin

## Kontak

Website: https://www.sastra.org
Tentang: https://www.sastra.org/tentang

---

**Terakhir diupdate:** 17 November 2025
**Versi:** 1.0
**Status:** Tested & Working ✅
