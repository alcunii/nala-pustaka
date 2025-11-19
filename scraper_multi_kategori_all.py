import requests
from bs4 import BeautifulSoup
import time
import os
import re
import json
import urllib.parse
from datetime import datetime
import csv

# ==================== KONFIGURASI ====================

# Headers untuk request
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.sastra.org/koleksi',
    'X-Requested-With': 'XMLHttpRequest',
}

# Rate limiting (dalam detik)
DELAY_BETWEEN_REQUESTS = 2  # Delay antar request naskah
DELAY_BETWEEN_CATEGORIES = 5  # Delay antar kategori
DELAY_BETWEEN_PAGES = 1  # Delay antar pagination

# Output configuration
BASE_OUTPUT_DIR = "data_naskah_sastra_org"
LOG_FILE = "scraping_log.csv"
PROGRESS_FILE = "scraping_progress.json"

# ==================== DATABASE KATEGORI ====================

CATEGORIES = {
    "Agama dan Kepercayaan": {
        "fc": 10,
        "subcategories": [
            {"fs": 48, "name": "Kebatinan dan Mistik"},
            {"fs": 30, "name": "Kitab Suci"},
            {"fs": 39, "name": "Suluk"},
            {"fs": 58, "name": "Wulang"},
        ]
    },
    "Arsip dan Sejarah": {
        "fc": 9,
        "subcategories": [
            {"fs": 76, "name": "Editorial"},
            {"fs": 31, "name": "Galeri"},
            {"fs": 71, "name": "Hukum dan Pemerintahan"},
            {"fs": 51, "name": "Kasunanan"},
            {"fs": 49, "name": "Mangkunagaran"},
            {"fs": 33, "name": "Mayor J F T"},
            {"fs": 37, "name": "Radya Pustaka"},
            {"fs": 22, "name": "Radya Pustaka Surat-menyurat"},
            {"fs": 26, "name": "Ranggawarsita R Ng"},
            {"fs": 32, "name": "Sasradiningrat II K R A"},
            {"fs": 44, "name": "Surakarta"},
            {"fs": 81, "name": "Surat-menyurat"},
            {"fs": 50, "name": "Umum"},
        ]
    },
    "Bahasa dan Budaya": {
        "fc": 12,
        "subcategories": [
            {"fs": 36, "name": "Adat dan Tradisi"},
            {"fs": 62, "name": "Bacaan Huruf Jawa"},
            {"fs": 59, "name": "Gending dan Notasi"},
            {"fs": 67, "name": "Kagunan"},
            {"fs": 41, "name": "Kamus dan Leksikon"},
            {"fs": 23, "name": "Karawitan"},
            {"fs": 68, "name": "Panembrama dan Iber"},
            {"fs": 52, "name": "Pawukon dan Primbon"},
            {"fs": 53, "name": "Pengetahuan Bahasa"},
            {"fs": 63, "name": "Wayang"},
        ]
    },
    "Kisah Cerita dan Kronikal": {
        "fc": 11,
        "subcategories": [
            {"fs": 46, "name": "Babad"},
            {"fs": 43, "name": "Babad Giyanti"},
            {"fs": 42, "name": "Babad Tanah Jawi"},
            {"fs": 47, "name": "Cerita"},
            {"fs": 64, "name": "Dongeng"},
            {"fs": 72, "name": "Mahabharata"},
            {"fs": 73, "name": "Menak"},
            {"fs": 65, "name": "Novel"},
            {"fs": 25, "name": "Riwayat dan Perjalanan"},
            {"fs": 34, "name": "Serat Centhini"},
        ]
    },
    "Koran Majalah dan Jurnal": {
        "fc": 13,
        "subcategories": [
            {"fs": 45, "name": "Almanak"},
            {"fs": 54, "name": "Candrakanta"},
            {"fs": 57, "name": "Kajawen"},
            {"fs": 28, "name": "Kawi"},
            {"fs": 75, "name": "Kumandang Teyosupi"},
            {"fs": 55, "name": "Mardi Siwi"},
            {"fs": 56, "name": "Narpawandawa"},
            {"fs": 27, "name": "Pusaka Jawi"},
            {"fs": 35, "name": "Sasadara"},
            {"fs": 61, "name": "Umum"},
            {"fs": 74, "name": "Wara Susila"},
        ]
    }
}

# ==================== HELPER FUNCTIONS ====================

def clean_filename(text):
    """Bersihkan nama file dari karakter tidak valid"""
    text = re.sub(r'[<>:"/\\|?*]', '', text)
    text = text.strip()
    return text[:200]

def clean_folder_name(text):
    """Bersihkan nama folder dari karakter tidak valid"""
    text = re.sub(r'[<>:"/\\|?*]', '', text)
    text = text.replace(' ', '_')
    text = text.strip()
    return text

def load_progress():
    """Load progress dari file JSON"""
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"completed_categories": [], "completed_subcategories": []}

def save_progress(progress):
    """Save progress ke file JSON"""
    with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
        json.dump(progress, f, indent=2, ensure_ascii=False)

def log_to_csv(category, subcategory, manuscripts_count, status, error_msg=''):
    """Log hasil scraping ke CSV"""
    file_exists = os.path.exists(LOG_FILE)
    
    with open(LOG_FILE, 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(['Timestamp', 'Category', 'Subcategory', 'Manuscripts', 'Status', 'Error'])
        
        writer.writerow([
            datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            category,
            subcategory,
            manuscripts_count,
            status,
            error_msg
        ])

# ==================== SCRAPING FUNCTIONS ====================

def get_manuscript_links_ajax(fc, fs, category_name, subcategory_name):
    """Ambil semua link naskah menggunakan AJAX endpoint"""
    print(f"\n{'='*80}")
    print(f"📂 Kategori: {category_name}")
    print(f"📁 Sub-kategori: {subcategory_name}")
    print(f"🔍 Mengambil daftar naskah (fc={fc}, fs={fs})...")
    print(f"{'='*80}\n")
    
    all_links = []
    offset = 0
    items_per_page = 20
    
    while True:
        # Parameter untuk AJAX request
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
        
        # Encode parameter
        param_json = json.dumps(param, separators=(',', ':'))
        param_encoded = urllib.parse.quote(param_json)
        
        url = f"https://www.sastra.org/sastra/koleksi/koleksi.inx.php?param={param_encoded}"
        
        print(f"  Offset {offset}...", end=' ')
        
        try:
            response = requests.get(url, headers=HEADERS, timeout=30)
            response.raise_for_status()
            
            # Parse HTML response
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Cari semua link naskah dari tabel
            page_links = []
            for link in soup.find_all('a', class_='ysl-lnk', href=True):
                href = link['href']
                full_url = href if href.startswith('http') else f"https://www.sastra.org{href}"
                
                # Hanya ambil URL unik yang belum ada
                if full_url not in all_links:
                    page_links.append(full_url)
                    all_links.append(full_url)
            
            print(f"✅ +{len(page_links)} naskah (Total: {len(all_links)})")
            
            # Jika tidak ada link baru, berarti sudah habis
            if not page_links:
                print(f"\n✅ Selesai! Total: {len(all_links)} naskah\n")
                break
            
            offset += items_per_page
            time.sleep(DELAY_BETWEEN_PAGES)
            
        except Exception as e:
            print(f"❌ Error: {e}")
            break
    
    return all_links

def scrape_manuscript(url):
    """Scrape konten naskah dari URL"""
    try:
        response = requests.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Ambil judul naskah
        title = soup.find('h1')
        title_text = title.get_text(strip=True) if title else "Untitled"
        
        # Ambil konten utama
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
        print(f"  ❌ Error scraping {url}: {e}")
        return None

def save_manuscript(manuscript, index, output_dir):
    """Simpan naskah ke file txt"""
    if not manuscript:
        return False
    
    filename = f"{index:04d}_{clean_filename(manuscript['title'])}.txt"
    filepath = os.path.join(output_dir, filename)
    
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(f"Judul: {manuscript['title']}\n")
            f.write(f"URL: {manuscript['url']}\n")
            f.write("=" * 80 + "\n\n")
            f.write(manuscript['content'])
        
        return True
    except Exception as e:
        print(f"  ❌ Error saving {filename}: {e}")
        return False

# ==================== MAIN SCRAPING LOGIC ====================

def scrape_subcategory(category_name, fc, subcategory):
    """Scrape satu sub-kategori"""
    subcategory_name = subcategory['name']
    fs = subcategory['fs']
    
    # Buat folder output
    category_folder = clean_folder_name(category_name)
    subcategory_folder = clean_folder_name(subcategory_name)
    output_dir = os.path.join(BASE_OUTPUT_DIR, category_folder, subcategory_folder)
    os.makedirs(output_dir, exist_ok=True)
    
    # Cek apakah sudah pernah di-scrape
    progress = load_progress()
    subcategory_key = f"{category_name}_{subcategory_name}"
    
    if subcategory_key in progress.get('completed_subcategories', []):
        print(f"⏭️  SKIP: {subcategory_name} (sudah selesai)")
        return
    
    try:
        # Ambil semua link naskah
        manuscript_links = get_manuscript_links_ajax(fc, fs, category_name, subcategory_name)
        
        if not manuscript_links:
            print(f"⚠️  Tidak ada naskah ditemukan\n")
            log_to_csv(category_name, subcategory_name, 0, 'NO_DATA')
            # Mark as completed
            progress['completed_subcategories'].append(subcategory_key)
            save_progress(progress)
            return
        
        # Scrape setiap naskah
        print(f"\n📥 Mulai download {len(manuscript_links)} naskah...")
        success_count = 0
        
        for i, link in enumerate(manuscript_links, 1):
            print(f"  [{i}/{len(manuscript_links)}] {link[:60]}...", end=' ')
            
            manuscript = scrape_manuscript(link)
            if manuscript and save_manuscript(manuscript, i, output_dir):
                success_count += 1
                print(f"✅")
            else:
                print(f"❌")
            
            time.sleep(DELAY_BETWEEN_REQUESTS)
        
        # Log hasil
        print(f"\n✅ {subcategory_name}: {success_count}/{len(manuscript_links)} berhasil")
        print(f"📁 Tersimpan di: {output_dir}\n")
        
        log_to_csv(category_name, subcategory_name, success_count, 'SUCCESS')
        
        # Mark as completed
        progress['completed_subcategories'].append(subcategory_key)
        save_progress(progress)
        
    except Exception as e:
        print(f"\n❌ Error di {subcategory_name}: {e}\n")
        log_to_csv(category_name, subcategory_name, 0, 'ERROR', str(e))

def main():
    """Main scraping function"""
    start_time = datetime.now()
    
    print(f"""
    {'='*80}
    🚀 SASTRA.ORG MASSIVE SCRAPER
    {'='*80}
    
    📊 Total Kategori: {len(CATEGORIES)}
    📊 Total Sub-kategori: {sum(len(cat['subcategories']) for cat in CATEGORIES.values())}
    📁 Output: {BASE_OUTPUT_DIR}/
    📝 Log: {LOG_FILE}
    ⚙️  Rate Limit: {DELAY_BETWEEN_REQUESTS}s per request
    
    {'='*80}
    """)
    
    input("⚠️  Press ENTER to start scraping... (Ctrl+C to cancel)")
    
    # Load progress
    progress = load_progress()
    
    total_categories = len(CATEGORIES)
    total_subcategories = sum(len(cat['subcategories']) for cat in CATEGORIES.values())
    processed_subcategories = 0
    
    # Loop semua kategori
    for cat_index, (category_name, category_data) in enumerate(CATEGORIES.items(), 1):
        fc = category_data['fc']
        subcategories = category_data['subcategories']
        
        print(f"\n\n{'#'*80}")
        print(f"# KATEGORI {cat_index}/{total_categories}: {category_name.upper()}")
        print(f"# Sub-kategori: {len(subcategories)}")
        print(f"{'#'*80}\n")
        
        # Loop semua sub-kategori dalam kategori ini
        for sub_index, subcategory in enumerate(subcategories, 1):
            processed_subcategories += 1
            
            print(f"\n[{processed_subcategories}/{total_subcategories}] ", end='')
            scrape_subcategory(category_name, fc, subcategory)
            
            # Delay antar sub-kategori
            if sub_index < len(subcategories):
                print(f"⏳ Waiting {DELAY_BETWEEN_CATEGORIES}s before next subcategory...\n")
                time.sleep(DELAY_BETWEEN_CATEGORIES)
        
        # Mark category as completed
        if category_name not in progress.get('completed_categories', []):
            progress.setdefault('completed_categories', []).append(category_name)
            save_progress(progress)
    
    # Summary
    end_time = datetime.now()
    duration = end_time - start_time
    
    print(f"""
    {'='*80}
    🎉 SCRAPING SELESAI!
    {'='*80}
    
    ⏱️  Durasi: {duration}
    📁 Output: {BASE_OUTPUT_DIR}/
    📊 Log Detail: {LOG_FILE}
    
    {'='*80}
    """)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Scraping dibatalkan oleh user")
        print("💾 Progress tersimpan! Jalankan ulang script untuk melanjutkan.\n")
    except Exception as e:
        print(f"\n\n❌ Fatal Error: {e}\n")
        import traceback
        traceback.print_exc()
