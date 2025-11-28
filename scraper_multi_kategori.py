"""
Scraper Multi-Kategori untuk Sastra.org
Scrape ribuan naskah dari berbagai kategori secara otomatis

CARA PAKAI:
1. Edit CATEGORIES di bawah - pilih sub-kategori yang mau di-scrape
2. Edit MAX_MANUSCRIPTS_PER_CATEGORY - batasi jumlah naskah per kategori (None = semua)
3. Jalankan: python scraper_multi_kategori.py
"""

import requests
from bs4 import BeautifulSoup
import time
import os
import re
import json
import urllib.parse

# ============================================================================
# KONFIGURASI - EDIT DI SINI
# ============================================================================

# Batasi jumlah naskah per kategori (None = ambil semua, angka = batasi)
# Contoh: 10 = hanya ambil 10 naskah pertama per kategori
MAX_MANUSCRIPTS_PER_CATEGORY = None  # Ganti dengan angka untuk membatasi

# Daftar kategori yang akan di-scrape
# Format: {"fc": kategori_id, "fs": subkategori_id, "name": "nama_folder"}
# Uncomment (hapus #) kategori yang mau di-scrape, comment yang tidak perlu

CATEGORIES = [
    # ========== Kisah, Cerita dan Kronikal (fc=11) ==========
    {"fc": 11, "fs": 46, "name": "Babad"},
    {"fc": 11, "fs": 43, "name": "Babad_Giyanti"},
    {"fc": 11, "fs": 42, "name": "Babad_Tanah_Jawi"},
    {"fc": 11, "fs": 47, "name": "Cerita"},
    {"fc": 11, "fs": 64, "name": "Dongeng"},
    {"fc": 11, "fs": 72, "name": "Mahabharata"},
    {"fc": 11, "fs": 73, "name": "Menak"},
    {"fc": 11, "fs": 65, "name": "Novel"},
    {"fc": 11, "fs": 25, "name": "Riwayat_dan_Perjalanan"},
    {"fc": 11, "fs": 34, "name": "Serat_Centhini"},
    
    # ========== Agama dan Kepercayaan (fc=10) ==========
    # {"fc": 10, "fs": 48, "name": "Kebatinan_dan_Mistik"},
    # {"fc": 10, "fs": 30, "name": "Kitab_Suci"},
    # {"fc": 10, "fs": 39, "name": "Suluk"},
    # {"fc": 10, "fs": 58, "name": "Wulang"},
    
    # ========== Bahasa dan Budaya (fc=12) ==========
    # {"fc": 12, "fs": 36, "name": "Adat_dan_Tradisi"},
    # {"fc": 12, "fs": 62, "name": "Bacaan_Huruf_Jawa"},
    # {"fc": 12, "fs": 59, "name": "Gending_dan_Notasi"},
    # {"fc": 12, "fs": 67, "name": "Kagunan"},
    # {"fc": 12, "fs": 41, "name": "Kamus_dan_Leksikon"},
    # {"fc": 12, "fs": 23, "name": "Karawitan"},
    # {"fc": 12, "fs": 68, "name": "Panembrama_dan_Iber"},
    # {"fc": 12, "fs": 52, "name": "Pawukon_dan_Primbon"},
    # {"fc": 12, "fs": 53, "name": "Pengetahuan_Bahasa"},
    # {"fc": 12, "fs": 63, "name": "Wayang"},
    
    # ========== Koran, Majalah dan Jurnal (fc=13) ==========
    # {"fc": 13, "fs": 45, "name": "Almanak"},
    # {"fc": 13, "fs": 54, "name": "Candrakanta"},
    # {"fc": 13, "fs": 57, "name": "Kajawen"},
    # {"fc": 13, "fs": 28, "name": "Kawi"},
    # {"fc": 13, "fs": 75, "name": "Kumandang_Teyosupi"},
    # {"fc": 13, "fs": 55, "name": "Mardi_Siwi"},
    # {"fc": 13, "fs": 56, "name": "Narpawandawa"},
    # {"fc": 13, "fs": 27, "name": "Pusaka_Jawi"},
    # {"fc": 13, "fs": 35, "name": "Sasadara"},
    # {"fc": 13, "fs": 61, "name": "Koran_Umum"},
    # {"fc": 13, "fs": 74, "name": "Wara_Susila"},
    
    # Lihat DOKUMENTASI_SCRAPING.md untuk daftar lengkap kategori
]

# ============================================================================
# JANGAN EDIT DI BAWAH INI (kecuali tahu yang dilakukan)
# ============================================================================

# Headers untuk request
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.sastra.org/koleksi',
    'X-Requested-With': 'XMLHttpRequest',
}

def get_manuscript_links_ajax(fc, fs, category_name):
    """Ambil semua link naskah menggunakan AJAX endpoint"""
    print(f"\n{'='*80}")
    print(f"Kategori: {category_name} (fc={fc}, fs={fs})")
    print(f"{'='*80}")
    
    all_links = []
    offset = 0
    items_per_page = 20
    
    while True:
        param = {
            "sn": "koleksi",
            "ui": "691aa8f9f3caa",
            "us": 0,
            "koleksi": {
                "cs": "adens",
                "fc": fc,
                "fs": fs,
                "nr": items_per_page,
                "ps": offset,
                "sk": "",
                "sl": 2,
                "el": "judul"
            }
        }
        
        param_json = json.dumps(param, separators=(',', ':'))
        param_encoded = urllib.parse.quote(param_json)
        url = f"https://www.sastra.org/sastra/koleksi/koleksi.inx.php?param={param_encoded}"
        
        print(f"Mengambil offset {offset}...")
        
        try:
            response = requests.get(url, headers=HEADERS, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            page_links = []
            for link in soup.find_all('a', href=True):
                href = link['href']
                # Sesuaikan pattern URL dengan kategori
                if '/kisah-cerita-dan-kronikal/' in href or '/bahasa-dan-budaya/' in href or '/agama-dan-kepercayaan/' in href or '/arsip-dan-sejarah/' in href or '/koran-majalah-dan-jurnal/' in href:
                    full_url = href if href.startswith('http') else f"https://www.sastra.org{href}"
                    if full_url not in all_links:
                        page_links.append(full_url)
                        all_links.append(full_url)
            
            print(f"  Ditemukan {len(page_links)} naskah baru (Total: {len(all_links)})")
            
            if not page_links:
                print("Tidak ada naskah lagi")
                break
            
            offset += items_per_page
            time.sleep(1)
            
        except Exception as e:
            print(f"Error: {e}")
            break
    
    print(f"Total ditemukan {len(all_links)} naskah untuk {category_name}")
    return all_links

def clean_filename(text):
    """Bersihkan nama file dari karakter tidak valid"""
    text = re.sub(r'[<>:"/\\|?*]', '', text)
    text = text.strip()
    return text[:200]

def scrape_manuscript(url):
    """Scrape konten naskah dari URL"""
    try:
        response = requests.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        title = soup.find('h1')
        title_text = title.get_text(strip=True) if title else "Untitled"
        
        content_div = soup.find('div', class_='item-page') or soup.find('article')
        
        if content_div:
            content_text = content_div.get_text(separator='\n', strip=True)
        else:
            content_text = "Konten tidak ditemukan"
        
        return {
            'title': title_text,
            'url': url,
            'content': content_text
        }
    
    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return None

def save_manuscript(manuscript, index, output_dir):
    """Simpan naskah ke file txt"""
    if not manuscript:
        return False
    
    filename = f"{index:03d}_{clean_filename(manuscript['title'])}.txt"
    filepath = os.path.join(output_dir, filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(f"Judul: {manuscript['title']}\n")
        f.write(f"URL: {manuscript['url']}\n")
        f.write("=" * 80 + "\n\n")
        f.write(manuscript['content'])
    
    return True

def scrape_category(category, max_manuscripts=None):
    """Scrape satu kategori lengkap"""
    fc = category['fc']
    fs = category['fs']
    name = category['name']
    
    # Buat folder output
    output_dir = f"naskah_{name}"
    os.makedirs(output_dir, exist_ok=True)
    
    # Ambil semua link
    manuscript_links = get_manuscript_links_ajax(fc, fs, name)
    
    if not manuscript_links:
        print(f"Tidak ada naskah ditemukan untuk {name}")
        return 0, 0
    
    # Batasi jumlah naskah jika ada limit
    if max_manuscripts and max_manuscripts < len(manuscript_links):
        print(f"\n⚠ Dibatasi hanya {max_manuscripts} naskah dari {len(manuscript_links)} total")
        manuscript_links = manuscript_links[:max_manuscripts]
    
    print(f"\nMulai scraping {len(manuscript_links)} naskah dari {name}...")
    
    success_count = 0
    for i, link in enumerate(manuscript_links, 1):
        print(f"\n[{i}/{len(manuscript_links)}] Scraping: {link}")
        
        manuscript = scrape_manuscript(link)
        if manuscript and save_manuscript(manuscript, i, output_dir):
            success_count += 1
            print(f"✓ Tersimpan: {i:03d}_{clean_filename(manuscript['title'])}.txt")
        else:
            print(f"✗ Gagal")
        
        time.sleep(2)
    
    print(f"\n{'='*80}")
    print(f"Selesai {name}: {success_count}/{len(manuscript_links)} naskah tersimpan")
    print(f"{'='*80}")
    
    return success_count, len(manuscript_links)

def main():
    """Scrape semua kategori"""
    print("="*80)
    print("SCRAPER MULTI-KATEGORI SASTRA.ORG")
    print("="*80)
    print(f"Total kategori yang akan di-scrape: {len(CATEGORIES)}")
    
    if MAX_MANUSCRIPTS_PER_CATEGORY:
        print(f"⚠ LIMIT: Maksimal {MAX_MANUSCRIPTS_PER_CATEGORY} naskah per kategori")
    else:
        print("📚 MODE: Scrape SEMUA naskah per kategori")
    
    print("\nKategori yang akan di-scrape:")
    for idx, cat in enumerate(CATEGORIES, 1):
        print(f"  {idx}. {cat['name']} (fc={cat['fc']}, fs={cat['fs']})")
    
    print("\n" + "="*80)
    input("Tekan ENTER untuk mulai scraping atau Ctrl+C untuk batal...")
    print("="*80 + "\n")
    
    total_success = 0
    total_manuscripts = 0
    
    for idx, category in enumerate(CATEGORIES, 1):
        print(f"\n\n{'#'*80}")
        print(f"# KATEGORI {idx}/{len(CATEGORIES)}: {category['name']}")
        print(f"{'#'*80}")
        
        try:
            success, total = scrape_category(category, MAX_MANUSCRIPTS_PER_CATEGORY)
            total_success += success
            total_manuscripts += total
        except Exception as e:
            print(f"Error pada kategori {category['name']}: {e}")
            continue
        
        # Delay antar kategori
        if idx < len(CATEGORIES):
            print(f"\nMenunggu 5 detik sebelum kategori berikutnya...")
            time.sleep(5)
    
    print(f"\n\n{'='*80}")
    print(f"SCRAPING SELESAI!")
    print(f"{'='*80}")
    print(f"Total naskah berhasil: {total_success}/{total_manuscripts}")
    print(f"Total kategori: {len(CATEGORIES)}")
    if MAX_MANUSCRIPTS_PER_CATEGORY:
        print(f"Limit per kategori: {MAX_MANUSCRIPTS_PER_CATEGORY} naskah")
    print(f"{'='*80}")

if __name__ == "__main__":
    main()
