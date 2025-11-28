import requests
from bs4 import BeautifulSoup
import time
import os
import re
import json
import urllib.parse

# Buat folder untuk menyimpan hasil scraping
OUTPUT_DIR = "naskah_babad_tanah_jawi"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Headers untuk request
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.sastra.org/koleksi?cid=11&sid=46',
    'X-Requested-With': 'XMLHttpRequest',
}

def get_manuscript_links_ajax():
    """Ambil semua link naskah menggunakan AJAX endpoint"""
    print("Mengambil daftar naskah menggunakan AJAX...")
    
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
                "fc": 11,  # kategori: Kisah, Cerita dan Kronikal
                "fs": 42,  # sub-kategori: Babad Tanah Jawi
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
        
        print(f"Mengambil offset {offset}...")
        
        try:
            response = requests.get(url, headers=HEADERS)
            response.raise_for_status()
            
            # Parse HTML response
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Cari semua link naskah
            page_links = []
            for link in soup.find_all('a', href=True):
                href = link['href']
                if '/kisah-cerita-dan-kronikal/' in href:
                    full_url = href if href.startswith('http') else f"https://www.sastra.org{href}"
                    if full_url not in all_links:
                        page_links.append(full_url)
                        all_links.append(full_url)
            
            print(f"  Ditemukan {len(page_links)} naskah baru (Total: {len(all_links)})")
            
            # Jika tidak ada link baru, berarti sudah habis
            if not page_links:
                print("Tidak ada naskah lagi")
                break
            
            offset += items_per_page
            time.sleep(1)
            
        except Exception as e:
            print(f"Error: {e}")
            break
    
    print(f"\nTotal ditemukan {len(all_links)} naskah")
    return all_links

def clean_filename(text):
    """Bersihkan nama file dari karakter tidak valid"""
    text = re.sub(r'[<>:"/\\|?*]', '', text)
    text = text.strip()
    return text[:200]

def scrape_manuscript(url):
    """Scrape konten naskah dari URL"""
    print(f"Scraping: {url}")
    
    try:
        response = requests.get(url, headers=HEADERS)
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
        print(f"Error scraping {url}: {e}")
        return None

def save_manuscript(manuscript, index):
    """Simpan naskah ke file txt"""
    if not manuscript:
        return
    
    filename = f"{index:03d}_{clean_filename(manuscript['title'])}.txt"
    filepath = os.path.join(OUTPUT_DIR, filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(f"Judul: {manuscript['title']}\n")
        f.write(f"URL: {manuscript['url']}\n")
        f.write("=" * 80 + "\n\n")
        f.write(manuscript['content'])
    
    print(f"Tersimpan: {filename}")

def main():
    # Ambil semua link naskah menggunakan AJAX
    manuscript_links = get_manuscript_links_ajax()
    
    if not manuscript_links:
        print("Tidak ada naskah ditemukan.")
        return
    
    print(f"\n{'='*80}")
    print(f"Mulai scraping {len(manuscript_links)} naskah...")
    print(f"{'='*80}\n")
    
    success_count = 0
    for i, link in enumerate(manuscript_links, 1):
        manuscript = scrape_manuscript(link)
        if manuscript:
            save_manuscript(manuscript, i)
            success_count += 1
        
        time.sleep(2)
        print(f"Progress: {i}/{len(manuscript_links)} ({success_count} berhasil)\n")
    
    print(f"\n{'='*80}")
    print(f"Selesai! {success_count}/{len(manuscript_links)} naskah tersimpan di folder '{OUTPUT_DIR}'")
    print(f"{'='*80}")

if __name__ == "__main__":
    main()
