import requests
from bs4 import BeautifulSoup
import time
import os
import re

# Buat folder untuk menyimpan hasil scraping
OUTPUT_DIR = "naskah_babad"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Headers untuk request
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}

def get_manuscript_links(collection_url, max_manuscripts=100):
    """Ambil semua link naskah dari halaman koleksi dengan pagination"""
    print(f"Mengambil daftar naskah dari: {collection_url}")
    
    all_links = []
    page = 0
    
    while len(all_links) < max_manuscripts:
        # Coba berbagai format pagination
        if page == 0:
            url = collection_url
        else:
            # Format pagination Joomla biasanya menggunakan ?start=X atau &start=X
            separator = '&' if '?' in collection_url else '?'
            url = f"{collection_url}{separator}start={page * 20}"
        
        print(f"Mengambil halaman {page + 1}: {url}")
        
        try:
            response = requests.get(url, headers=HEADERS)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Cari semua link yang mengarah ke naskah
            page_links = []
            for link in soup.find_all('a', href=True):
                href = link['href']
                if '/kisah-cerita-dan-kronikal/babad/' in href:
                    full_url = href if href.startswith('http') else f"https://www.sastra.org{href}"
                    if full_url not in all_links:
                        page_links.append(full_url)
                        all_links.append(full_url)
            
            print(f"  Ditemukan {len(page_links)} naskah di halaman ini (Total: {len(all_links)})")
            
            # Jika tidak ada link baru, berarti sudah habis
            if not page_links:
                print("Tidak ada naskah lagi di halaman berikutnya")
                break
            
            page += 1
            time.sleep(1)  # Delay antar halaman
            
        except Exception as e:
            print(f"Error mengambil halaman {page + 1}: {e}")
            break
    
    print(f"\nTotal ditemukan {len(all_links)} naskah")
    return all_links[:max_manuscripts]

def clean_filename(text):
    """Bersihkan nama file dari karakter tidak valid"""
    text = re.sub(r'[<>:"/\\|?*]', '', text)
    text = text.strip()
    return text[:200]  # Batasi panjang nama file

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
        
        # Ambil konten utama (sesuaikan selector dengan struktur HTML sastra.org)
        content_div = soup.find('div', class_='item-page') or soup.find('article')
        
        if content_div:
            # Ambil semua teks dari konten
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
    
    # Buat nama file dari judul
    filename = f"{index:03d}_{clean_filename(manuscript['title'])}.txt"
    filepath = os.path.join(OUTPUT_DIR, filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(f"Judul: {manuscript['title']}\n")
        f.write(f"URL: {manuscript['url']}\n")
        f.write("=" * 80 + "\n\n")
        f.write(manuscript['content'])
    
    print(f"Tersimpan: {filename}")

def main():
    # URL koleksi Babad
    collection_url = "https://www.sastra.org/koleksi?cid=11&sid=46"
    
    # Ambil semua link naskah (maksimal 100)
    manuscript_links = get_manuscript_links(collection_url, max_manuscripts=100)
    
    if not manuscript_links:
        print("Tidak ada naskah ditemukan. Periksa selector HTML.")
        return
    
    print(f"\n{'='*80}")
    print(f"Mulai scraping {len(manuscript_links)} naskah...")
    print(f"{'='*80}\n")
    
    # Scrape setiap naskah
    success_count = 0
    for i, link in enumerate(manuscript_links, 1):
        manuscript = scrape_manuscript(link)
        if manuscript:
            save_manuscript(manuscript, i)
            success_count += 1
        
        # Delay untuk menghindari rate limiting
        time.sleep(2)
        
        print(f"Progress: {i}/{len(manuscript_links)} ({success_count} berhasil)\n")
    
    print(f"\n{'='*80}")
    print(f"Selesai! {success_count}/{len(manuscript_links)} naskah tersimpan di folder '{OUTPUT_DIR}'")
    print(f"{'='*80}")

if __name__ == "__main__":
    main()
