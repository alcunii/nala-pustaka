"""
Debug script untuk melihat response AJAX dari sastra.org
Untuk troubleshoot kenapa scraper mendapat 0 hasil
"""

import requests
from bs4 import BeautifulSoup
import json
import urllib.parse

# Test dengan kategori yang kita tahu berhasil: Babad Tanah Jawi
fc = 11  # Kisah, Cerita dan Kronikal
fs = 42  # Babad Tanah Jawi

# Headers
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.sastra.org/koleksi?cid=11&sid=42',
    'X-Requested-With': 'XMLHttpRequest',
}

# Parameter AJAX
param = {
    "sn": "koleksi",
    "ui": "691aa8f9f3caa",
    "us": 0,
    "koleksi": {
        "cs": "adens",
        "fc": fc,
        "fs": fs,
        "nr": 20,
        "ps": 0,
        "sk": "",
        "sl": 2,
        "el": "judul"
    }
}

print("="*80)
print("🔍 DEBUG: Testing AJAX endpoint untuk Babad Tanah Jawi")
print("="*80)
print(f"\nParameter:")
print(json.dumps(param, indent=2))

# Encode parameter
param_json = json.dumps(param, separators=(',', ':'))
param_encoded = urllib.parse.quote(param_json)

url = f"https://www.sastra.org/sastra/koleksi/koleksi.inx.php?param={param_encoded}"

print(f"\nURL:\n{url[:100]}...")

# Request
print(f"\n{'='*80}")
print("Sending request...")
print(f"{'='*80}\n")

try:
    response = requests.get(url, headers=HEADERS, timeout=30)
    response.raise_for_status()
    
    print(f"✅ Response Status: {response.status_code}")
    print(f"✅ Response Size: {len(response.content)} bytes")
    
    # Parse HTML
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Tampilkan semua link yang ditemukan
    print(f"\n{'='*80}")
    print("📋 SEMUA LINK YANG DITEMUKAN:")
    print(f"{'='*80}\n")
    
    all_links = soup.find_all('a', href=True)
    print(f"Total links: {len(all_links)}\n")
    
    for i, link in enumerate(all_links[:20], 1):  # Tampilkan 20 pertama
        href = link['href']
        text = link.get_text(strip=True)
        print(f"{i:2}. {href[:60]:60} | {text[:40]}")
    
    if len(all_links) > 20:
        print(f"\n... dan {len(all_links) - 20} link lainnya")
    
    # Analisis pattern
    print(f"\n{'='*80}")
    print("📊 ANALISIS PATTERN:")
    print(f"{'='*80}\n")
    
    patterns = {}
    for link in all_links:
        href = link['href']
        # Extract path pattern
        if href.startswith('/'):
            parts = href.split('/')
            if len(parts) >= 2:
                pattern = '/' + parts[1]
                patterns[pattern] = patterns.get(pattern, 0) + 1
        elif 'sastra.org' in href:
            patterns['full_url'] = patterns.get('full_url', 0) + 1
        else:
            patterns['other'] = patterns.get('other', 0) + 1
    
    for pattern, count in sorted(patterns.items(), key=lambda x: x[1], reverse=True):
        print(f"  {pattern:30} : {count} links")
    
    # Coba filter yang berbeda
    print(f"\n{'='*80}")
    print("🔍 TESTING BERBAGAI FILTER:")
    print(f"{'='*80}\n")
    
    test_filters = [
        ("Contain '/kisah-cerita-dan-kronikal/'", lambda h: '/kisah-cerita-dan-kronikal/' in h),
        ("Contain '/babad-tanah-jawi/'", lambda h: '/babad-tanah-jawi/' in h),
        ("Start with '/' and NOT menu", lambda h: h.startswith('/') and h not in ['/', '/koleksi', '/tentang']),
        ("Contain 'sastra.org' and NOT homepage", lambda h: 'sastra.org' in h and '/index' not in h),
    ]
    
    for filter_name, filter_func in test_filters:
        matched = [link['href'] for link in all_links if filter_func(link['href'])]
        print(f"  {filter_name:50} : {len(matched)} matches")
        if matched:
            for m in matched[:3]:
                print(f"      → {m}")
    
    # Save HTML untuk inspeksi manual
    output_file = "debug_response.html"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(response.text)
    
    print(f"\n💾 Response HTML saved to: {output_file}")
    print("   Buka file ini untuk inspeksi manual\n")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
