# Contoh Perhitungan dan Visualisasi

## 1. Contoh Data Sample

### 1.1 Data Excel Input
```
Semester    | Bidang   | Kode_Rekening | Nama_Kegiatan              | Pagu        | Realisasi
Semester 1  | Bidang A | 5.1.02.01.01  | Pengadaan Alat Tulis       | 50,000,000  | 35,000,000
Semester 1  | Bidang A | 5.1.02.02.01  | Biaya Perjalanan Dinas     | 75,000,000  | 60,000,000
Semester 1  | Bidang B | 5.1.03.01.01  | Pelatihan SDM              | 100,000,000 | 80,000,000
Semester 2  | Bidang A | 5.1.02.01.02  | Pengadaan Komputer         | 200,000,000 | 150,000,000
Semester 2  | Bidang B | 5.1.03.02.01  | Workshop Teknis            | 80,000,000  | 95,000,000
Semester 2  | Bidang C | 5.1.04.01.01  | Maintenance Sistem         | 120,000,000 | 110,000,000
```

## 2. Perhitungan Detail per Record

### 2.1 Formula Sisa Dana
```
Sisa = Pagu - Realisasi

Contoh:
Record 1: Sisa = 50,000,000 - 35,000,000 = 15,000,000
Record 2: Sisa = 75,000,000 - 60,000,000 = 15,000,000
Record 5: Sisa = 80,000,000 - 95,000,000 = -15,000,000 (Over Budget)
```

### 2.2 Formula Persentase Realisasi
```
Persentase = (Realisasi / Pagu) × 100%

Contoh:
Record 1: Persentase = (35,000,000 / 50,000,000) × 100% = 70%
Record 2: Persentase = (60,000,000 / 75,000,000) × 100% = 80%
Record 5: Persentase = (95,000,000 / 80,000,000) × 100% = 118.75% (Over Budget)
```

### 2.3 Status Kategorisasi
```
Status Logic:
- Over Budget: Persentase > 100%
- On Track: 80% ≤ Persentase ≤ 100%
- Under Budget: Persentase < 80%

Contoh:
Record 1: 70% → "Under Budget"
Record 2: 80% → "On Track"
Record 5: 118.75% → "Over Budget"
```

## 3. Perhitungan Dashboard (Aggregated)

### 3.1 Total Keseluruhan
```
Total Pagu = SUM(Pagu) = 625,000,000
Total Realisasi = SUM(Realisasi) = 530,000,000
Total Sisa = Total Pagu - Total Realisasi = 95,000,000
Persentase Realisasi Keseluruhan = (530,000,000 / 625,000,000) × 100% = 84.8%
```

### 3.2 Filter per Semester 1
```
Data Semester 1:
- Record 1: Pagu 50M, Realisasi 35M
- Record 2: Pagu 75M, Realisasi 60M  
- Record 3: Pagu 100M, Realisasi 80M

Total Pagu Semester 1 = 225,000,000
Total Realisasi Semester 1 = 175,000,000
Total Sisa Semester 1 = 50,000,000
Persentase Semester 1 = (175,000,000 / 225,000,000) × 100% = 77.8%
```

### 3.3 Filter per Bidang A
```
Data Bidang A:
- Record 1: Pagu 50M, Realisasi 35M
- Record 2: Pagu 75M, Realisasi 60M
- Record 4: Pagu 200M, Realisasi 150M

Total Pagu Bidang A = 325,000,000
Total Realisasi Bidang A = 245,000,000
Total Sisa Bidang A = 80,000,000
Persentase Bidang A = (245,000,000 / 325,000,000) × 100% = 75.4%
```

## 4. Contoh Visualisasi

### 4.1 KPI Cards Dashboard
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   TOTAL PAGU    │  │ TOTAL REALISASI │  │   SISA DANA     │  │ % REALISASI     │
│                 │  │                 │  │                 │  │                 │
│  Rp 625,000,000 │  │  Rp 530,000,000 │  │  Rp 95,000,000  │  │     84.8%       │
│                 │  │                 │  │                 │  │                 │
│  📊 +5% vs      │  │  📈 +12% vs     │  │  📉 -8% vs      │  │  🎯 Target 85%  │
│     last month  │  │     last month  │  │     last month  │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘
```

### 4.2 Progress Bar per Bidang
```
Bidang A: 75.4% ████████████████████████████████████████████████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░
Bidang B: 91.7% ████████████████████████████████████████████████████████████████████████████████████████████████████░░░░░
Bidang C: 91.7% ████████████████████████████████████████████████████████████████████████████████████████████████████░░░░░

Legend: ████ Realisasi  ░░░░ Sisa
```

### 4.3 Bar Chart Comparison
```
Pagu vs Realisasi per Bidang (dalam Juta Rupiah)

    400 |                    
        |     ██████████     
    300 |     ██████████     ████████
        |     ██████████     ████████
    200 |     ██████████     ████████     ████████
        |     ██████████     ████████     ████████
    100 |     ██████████     ████████     ████████
        |     ██████████     ████████     ████████
      0 |_____|██████████_____|████████_____|████████_____
              Bidang A        Bidang B      Bidang C

        ██████ Pagu (Budget)
        ░░░░░░ Realisasi (Actual)
```

### 4.4 Pie Chart Status Distribution
```
Status Distribusi Kegiatan

Over Budget (16.7%)     ████
On Track (33.3%)        ████████
Under Budget (50%)      ████████████

Total: 6 Kegiatan
- Over Budget: 1 kegiatan
- On Track: 2 kegiatan  
- Under Budget: 3 kegiatan
```

## 5. Contoh Implementasi AppSheet

### 5.1 Formula di AppSheet
```
// Kolom Sisa (Virtual Column)
[Pagu] - [Realisasi]

// Kolom Persentase (Virtual Column)  
([Realisasi] / [Pagu]) * 100

// Kolom Status (Virtual Column)
IFS(
  [Persentase] > 100, "Over Budget",
  [Persentase] >= 80, "On Track", 
  "Under Budget"
)

// Dashboard Summary (Slice)
SELECT(Budget_Data[Pagu], [Semester] = "Semester 1")
```

### 5.2 Chart Configuration
```json
{
  "chartType": "ColumnChart",
  "title": "Pagu vs Realisasi per Bidang",
  "data": {
    "groupBy": "Bidang",
    "aggregations": [
      {"column": "Pagu", "function": "SUM"},
      {"column": "Realisasi", "function": "SUM"}
    ]
  },
  "options": {
    "colors": ["#1f77b4", "#ff7f0e"],
    "legend": {"position": "bottom"},
    "vAxis": {"title": "Amount (Rupiah)"},
    "hAxis": {"title": "Bidang"}
  }
}
```

## 6. Contoh Export Report

### 6.1 Summary Report Format
```
LAPORAN MONITORING ANGGARAN
Periode: Semester 1 & 2 Tahun 2024
Generated: 27 Juli 2024

RINGKASAN EKSEKUTIF
===================
Total Pagu Anggaran    : Rp 625,000,000
Total Realisasi        : Rp 530,000,000  
Total Sisa Dana        : Rp 95,000,000
Persentase Realisasi   : 84.8%

BREAKDOWN PER SEMESTER
======================
Semester 1:
- Pagu: Rp 225,000,000 (36%)
- Realisasi: Rp 175,000,000 (77.8%)
- Sisa: Rp 50,000,000

Semester 2:  
- Pagu: Rp 400,000,000 (64%)
- Realisasi: Rp 355,000,000 (88.8%)
- Sisa: Rp 45,000,000

BREAKDOWN PER BIDANG
====================
Bidang A: 75.4% (Rp 245M / Rp 325M)
Bidang B: 91.7% (Rp 175M / Rp 190M) 
Bidang C: 91.7% (Rp 110M / Rp 120M)

ALERT & REKOMENDASI
===================
⚠️  Over Budget: 1 kegiatan (Workshop Teknis)
⚠️  Under Performance: Bidang A (75.4% < target 80%)
✅  Good Performance: Bidang B & C (>90%)
```

## 7. Mobile View Examples

### 7.1 Mobile Dashboard Cards
```
┌─────────────────────┐
│  📊 TOTAL PAGU      │
│  Rp 625,000,000     │
│  ↗️ +5% vs last month│
└─────────────────────┘

┌─────────────────────┐
│  💰 REALISASI       │
│  Rp 530,000,000     │
│  ↗️ +12% vs last month│
└─────────────────────┘

┌─────────────────────┐
│  💸 SISA DANA       │
│  Rp 95,000,000      │
│  ↘️ -8% vs last month│
└─────────────────────┘

┌─────────────────────┐
│  🎯 % REALISASI     │
│  84.8%              │
│  Target: 85%        │
└─────────────────────┘
```

### 7.2 Mobile Chart (Horizontal Bar)
```
┌─────────────────────┐
│ Realisasi per Bidang│
│                     │
│ Bidang A ████████░░ │ 75%
│ Bidang B ████████████│ 92%  
│ Bidang C ████████████│ 92%
│                     │
│ [View Details] 👆   │
└─────────────────────┘
```

Dokumentasi ini memberikan contoh konkret bagaimana perhitungan dilakukan dan bagaimana data akan ditampilkan dalam berbagai format visualisasi, baik di desktop maupun mobile.
