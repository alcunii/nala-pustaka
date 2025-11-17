# Backend API Testing Guide

## Server Status

Backend server harus running di: `http://localhost:3001`

```powershell
# Start backend server
cd backend
npm start
```

---

## 1. Health Check

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/health" -Method Get
```

---

## 2. Test Queries - Berbagai Topik

### Query 1: Tokoh Sejarah
```powershell
$body = @{query="Pangeran Mangkubumi";topK=5;minScore=0.5} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3001/api/search" -Method Post -Body $body -ContentType "application/json"
```

### Query 2: Peristiwa Sejarah
```powershell
$body = @{query="Perang Diponegoro";topK=5;minScore=0.5} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3001/api/search" -Method Post -Body $body -ContentType "application/json"
```

### Query 3: Tempat/Lokasi
```powershell
$body = @{query="Keraton Yogyakarta";topK=5;minScore=0.5} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3001/api/search" -Method Post -Body $body -ContentType "application/json"
```

### Query 4: Kerajaan
```powershell
$body = @{query="Majapahit";topK=5;minScore=0.5} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3001/api/search" -Method Post -Body $body -ContentType "application/json"
```

### Query 5: Sultan
```powershell
$body = @{query="Sultan Hamengku Buwono";topK=5;minScore=0.5} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3001/api/search" -Method Post -Body $body -ContentType "application/json"
```

---

## 3. Pretty Print Results

```powershell
$body = @{query="Panembahan Senopati";topK=3;minScore=0.5} | ConvertTo-Json
$result = Invoke-RestMethod -Uri "http://localhost:3001/api/search" -Method Post -Body $body -ContentType "application/json"

Write-Host "`n=== SEARCH RESULTS ===" -ForegroundColor Cyan
Write-Host "Query: $($result.query)" -ForegroundColor Yellow
Write-Host "Total: $($result.totalResults) results`n" -ForegroundColor Green

foreach ($item in $result.results) {
    Write-Host "📜 $($item.metadata.title)" -ForegroundColor Magenta
    Write-Host "   Score: $([math]::Round($item.score, 3))" -ForegroundColor Green
    Write-Host "   Year: $($item.metadata.year)" -ForegroundColor Gray
    Write-Host "   Text: $($item.metadata.chunkText.Substring(0, [Math]::Min(150, $item.metadata.chunkText.Length)))..." -ForegroundColor White
    Write-Host ""
}
```

---

## Score Interpretation:
- **0.7 - 1.0**: Sangat relevan
- **0.6 - 0.7**: Relevan
- **0.5 - 0.6**: Cukup relevan
- **< 0.5**: Kurang relevan (filtered)
