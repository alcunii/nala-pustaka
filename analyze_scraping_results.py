"""
Analisis Hasil Scraping Sastra.org
Script ini akan menganalisis folder hasil scraping dan memberikan statistik lengkap
"""

import os
import json
from collections import defaultdict
from datetime import datetime

BASE_DIR = "data_naskah_sastra_org"

def analyze_directory():
    """Analisis struktur dan konten folder hasil scraping"""
    
    if not os.path.exists(BASE_DIR):
        print(f"❌ Folder {BASE_DIR} tidak ditemukan!")
        print(f"💡 Jalankan scraper terlebih dahulu: python scraper_multi_kategori_all.py")
        return
    
    stats = {
        'categories': {},
        'total_manuscripts': 0,
        'total_size_bytes': 0,
        'total_words': 0,
    }
    
    print(f"\n{'='*80}")
    print(f"📊 ANALISIS HASIL SCRAPING SASTRA.ORG")
    print(f"{'='*80}\n")
    
    # Loop through categories
    for category_name in os.listdir(BASE_DIR):
        category_path = os.path.join(BASE_DIR, category_name)
        
        if not os.path.isdir(category_path):
            continue
        
        stats['categories'][category_name] = {
            'subcategories': {},
            'total_manuscripts': 0,
            'total_size_bytes': 0,
        }
        
        # Loop through subcategories
        for subcategory_name in os.listdir(category_path):
            subcategory_path = os.path.join(category_path, subcategory_name)
            
            if not os.path.isdir(subcategory_path):
                continue
            
            # Count manuscripts in this subcategory
            manuscripts = [f for f in os.listdir(subcategory_path) if f.endswith('.txt')]
            manuscript_count = len(manuscripts)
            
            # Calculate total size
            total_size = sum(
                os.path.getsize(os.path.join(subcategory_path, f)) 
                for f in manuscripts
            )
            
            # Sample word count (dari file pertama)
            avg_words = 0
            if manuscripts:
                sample_file = os.path.join(subcategory_path, manuscripts[0])
                try:
                    with open(sample_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                        words = len(content.split())
                        avg_words = words
                except:
                    pass
            
            stats['categories'][category_name]['subcategories'][subcategory_name] = {
                'manuscripts': manuscript_count,
                'size_bytes': total_size,
                'avg_words': avg_words,
            }
            
            stats['categories'][category_name]['total_manuscripts'] += manuscript_count
            stats['categories'][category_name]['total_size_bytes'] += total_size
            stats['total_manuscripts'] += manuscript_count
            stats['total_size_bytes'] += total_size
    
    # Print hasil
    print_statistics(stats)
    
    # Save to JSON
    output_file = "scraping_analysis.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Analisis lengkap tersimpan di: {output_file}")

def print_statistics(stats):
    """Print statistik dalam format yang mudah dibaca"""
    
    # Overall stats
    total_manuscripts = stats['total_manuscripts']
    total_size_mb = stats['total_size_bytes'] / (1024 * 1024)
    total_categories = len(stats['categories'])
    total_subcategories = sum(
        len(cat['subcategories']) 
        for cat in stats['categories'].values()
    )
    
    print(f"📈 RINGKASAN KESELURUHAN:")
    print(f"   Total Kategori      : {total_categories}")
    print(f"   Total Sub-kategori  : {total_subcategories}")
    print(f"   Total Naskah        : {total_manuscripts:,}")
    print(f"   Total Ukuran        : {total_size_mb:.2f} MB")
    print(f"   Rata-rata per Naskah: {(total_size_mb / total_manuscripts * 1024):.1f} KB")
    
    print(f"\n{'='*80}")
    print(f"📂 DETAIL PER KATEGORI:")
    print(f"{'='*80}\n")
    
    # Sort categories by manuscript count
    sorted_categories = sorted(
        stats['categories'].items(),
        key=lambda x: x[1]['total_manuscripts'],
        reverse=True
    )
    
    for category_name, category_data in sorted_categories:
        manuscripts = category_data['total_manuscripts']
        size_mb = category_data['total_size_bytes'] / (1024 * 1024)
        subcategories = len(category_data['subcategories'])
        
        print(f"📚 {category_name}")
        print(f"   Sub-kategori: {subcategories}")
        print(f"   Naskah      : {manuscripts:,}")
        print(f"   Ukuran      : {size_mb:.2f} MB")
        print(f"   Avg/naskah  : {(size_mb / manuscripts * 1024):.1f} KB" if manuscripts > 0 else "   Avg/naskah  : N/A")
        
        # Top 3 subcategories
        sorted_subs = sorted(
            category_data['subcategories'].items(),
            key=lambda x: x[1]['manuscripts'],
            reverse=True
        )[:3]
        
        if sorted_subs:
            print(f"   Top sub-kategori:")
            for sub_name, sub_data in sorted_subs:
                print(f"      • {sub_name}: {sub_data['manuscripts']} naskah")
        
        print()

def generate_report():
    """Generate markdown report"""
    
    if not os.path.exists(BASE_DIR):
        print("❌ Folder tidak ditemukan")
        return
    
    report = []
    report.append("# Laporan Hasil Scraping Sastra.org\n")
    report.append(f"**Tanggal**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    report.append(f"**Folder**: `{BASE_DIR}/`\n\n")
    
    total_manuscripts = 0
    total_size = 0
    
    report.append("## Ringkasan Per Kategori\n")
    report.append("| Kategori | Sub-kategori | Total Naskah | Ukuran |\n")
    report.append("|----------|--------------|--------------|--------|\n")
    
    for category_name in sorted(os.listdir(BASE_DIR)):
        category_path = os.path.join(BASE_DIR, category_name)
        
        if not os.path.isdir(category_path):
            continue
        
        cat_manuscripts = 0
        cat_size = 0
        subcategory_count = 0
        
        for subcategory_name in os.listdir(category_path):
            subcategory_path = os.path.join(category_path, subcategory_name)
            
            if not os.path.isdir(subcategory_path):
                continue
            
            subcategory_count += 1
            manuscripts = [f for f in os.listdir(subcategory_path) if f.endswith('.txt')]
            manuscript_count = len(manuscripts)
            
            size = sum(
                os.path.getsize(os.path.join(subcategory_path, f)) 
                for f in manuscripts
            )
            
            cat_manuscripts += manuscript_count
            cat_size += size
        
        total_manuscripts += cat_manuscripts
        total_size += cat_size
        
        size_mb = cat_size / (1024 * 1024)
        report.append(f"| {category_name} | {subcategory_count} | {cat_manuscripts:,} | {size_mb:.2f} MB |\n")
    
    total_size_mb = total_size / (1024 * 1024)
    report.append(f"| **TOTAL** | | **{total_manuscripts:,}** | **{total_size_mb:.2f} MB** |\n\n")
    
    # Save report
    report_file = "SCRAPING_REPORT.md"
    with open(report_file, 'w', encoding='utf-8') as f:
        f.writelines(report)
    
    print(f"\n📄 Laporan tersimpan di: {report_file}")

if __name__ == "__main__":
    print("\n🔍 Memulai analisis...\n")
    analyze_directory()
    generate_report()
    print("\n✅ Analisis selesai!\n")
