# Model Data Aplikasi Monitoring Anggaran

## 1. Struktur Data Excel (Input)

### 1.1 Tabel Detail Anggaran: `budget_detail`
| Kolom | Tipe Data | Deskripsi | Contoh |
|-------|-----------|-----------|---------|
| Semester | Text | Semester 1 atau Semester 2 | "Semester 1" |
| Program_Kegiatan | Text | Nama program kegiatan utama | "Program Peningkatan Pelayanan Publik" |
| Kegiatan | Text | Nama kegiatan dalam program | "Peningkatan Sarana Prasarana" |
| Sub_Kegiatan | Text | Sub kegiatan detail | "Pengadaan Peralatan Kantor" |
| Belanja_Barang | Text | Jenis belanja barang | "Alat Tulis Kantor" |
| Kode_Rekening | Text | Kode rekening anggaran | "5.1.02.01.01" |
| Bidang | Text | Nama bidang/departemen | "Bidang Administrasi" |
| Pagu | Number | Anggaran yang dialokasikan | 50000000 |
| Realisasi | Number | Anggaran yang sudah direalisasi | 35000000 |
| Saldo | Number | Sisa anggaran (Pagu - Realisasi) | 15000000 |
| Persentase_Realisasi | Number | Persentase realisasi anggaran | 70 |
| Status_Realisasi | Text | Status berdasarkan persentase | "Normal" |
| Tanggal_Realisasi | Date | Tanggal terakhir realisasi | "2024-06-15" |

### 1.2 Contoh Data Excel dengan Struktur Baru
```
Semester | Program_Kegiatan | Kegiatan | Sub_Kegiatan | Belanja_Barang | Kode_Rekening | Bidang | Pagu | Realisasi | Saldo | Persentase_Realisasi | Status_Realisasi | Tanggal_Realisasi
Semester 1 | Program Peningkatan Pelayanan | Peningkatan Sarana | Pengadaan Peralatan | Alat Tulis Kantor | 5.1.02.01.01 | Bidang Administrasi | 50000000 | 35000000 | 15000000 | 70% | Normal | 2024-06-15
Semester 1 | Program Peningkatan Pelayanan | Peningkatan Sarana | Pengadaan Peralatan | Peralatan Komputer | 5.1.02.01.02 | Bidang IT | 100000000 | 85000000 | 15000000 | 85% | Normal | 2024-06-20
Semester 1 | Program Pengembangan SDM | Pelatihan Pegawai | Pelatihan Teknis | Biaya Pelatihan | 5.1.02.02.01 | Bidang SDM | 75000000 | 60000000 | 15000000 | 80% | Normal | 2024-06-25
Semester 2 | Program Operasional | Kegiatan Rutin | Perjalanan Dinas | Biaya Transport | 5.1.03.01.01 | Bidang Operasional | 80000000 | 45000000 | 35000000 | 56% | Rendah | 2024-07-10
```

## 2. Model Data Aplikasi (Processed)

### 2.1 Tabel Detail Anggaran dengan Kolom Kalkulasi
| Kolom | Tipe Data | Formula/Kalkulasi | Deskripsi |
|-------|-----------|-------------------|-----------|
| ID | Auto Number | Auto-generated | Primary Key |
| Semester | Text | From Excel | Semester 1/2 |
| **Program_Kegiatan** | Text | From Excel | Program kegiatan utama |
| **Kegiatan** | Text | From Excel | Kegiatan dalam program |
| **Sub_Kegiatan** | Text | From Excel | Sub kegiatan detail |
| **Belanja_Barang** | Text | From Excel | Jenis belanja barang |
| Kode_Rekening | Text | From Excel | Kode rekening anggaran |
| Bidang | Text | From Excel | Nama bidang/departemen |
| Pagu | Currency | From Excel | Anggaran dialokasikan |
| Realisasi | Currency | From Excel | Anggaran direalisasi |
| **Saldo** | Currency | `Pagu - Realisasi` | Sisa anggaran |
| **Persentase_Realisasi** | Percentage | `(Realisasi / Pagu) * 100` | % realisasi |
| **Status_Realisasi** | Text | IF formula | "Tinggi", "Normal", "Rendah", "Kritis" |
| Tanggal_Realisasi | Date | From Excel | Tanggal terakhir realisasi |
| Created_Date | DateTime | Auto | Tanggal input |
| Modified_Date | DateTime | Auto | Tanggal update |

### 2.2 Formula Kalkulasi Detail

#### A. Saldo Anggaran
```
Saldo = Pagu - Realisasi
```

#### B. Persentase Realisasi
```
Persentase_Realisasi = (Realisasi / Pagu) * 100
```

#### C. Status Realisasi
```
Status_Realisasi = 
  IF(Persentase_Realisasi >= 90, "Tinggi",
    IF(Persentase_Realisasi >= 70, "Normal",
      IF(Persentase_Realisasi >= 50, "Rendah", "Kritis")))
```

#### D. Validasi Hierarki
```
// Setiap Sub_Kegiatan harus terkait dengan Kegiatan
// Setiap Kegiatan harus terkait dengan Program_Kegiatan
// Setiap Belanja_Barang harus terkait dengan Sub_Kegiatan
Hierarki_Valid = Program_Kegiatan → Kegiatan → Sub_Kegiatan → Belanja_Barang
```

## 3. Model Data Dashboard (Aggregated)

### 3.1 Summary Data per Filter
| Metric | Formula | Deskripsi |
|--------|---------|-----------|
| **Total_Pagu** | `SUM(Pagu)` | Total anggaran |
| **Total_Realisasi** | `SUM(Realisasi)` | Total realisasi |
| **Total_Sisa** | `SUM(Sisa)` | Total sisa dana |
| **Avg_Persentase** | `(Total_Realisasi / Total_Pagu) * 100` | Rata-rata % realisasi |
| **Count_Kegiatan** | `COUNT(ID)` | Jumlah kegiatan |
| **Count_Over_Budget** | `COUNT(Status = "Over Budget")` | Jumlah over budget |

### 3.2 Data untuk Visualisasi

#### A. Data untuk Bar Chart (Per Bidang)
```json
{
  "labels": ["Bidang A", "Bidang B", "Bidang C"],
  "datasets": [
    {
      "label": "Pagu",
      "data": [500000000, 750000000, 300000000]
    },
    {
      "label": "Realisasi", 
      "data": [400000000, 600000000, 280000000]
    }
  ]
}
```

#### B. Data untuk Progress Bar
```json
{
  "bidang": "Bidang A",
  "pagu": 500000000,
  "realisasi": 400000000,
  "persentase": 80,
  "status": "On Track"
}
```

## 4. Validasi Data

### 4.1 Aturan Validasi Input
| Field | Validasi | Error Message |
|-------|----------|---------------|
| Semester | Required, "Semester 1" or "Semester 2" | "Semester harus diisi" |
| Program_Kegiatan | Required, Text, Max 100 chars | "Program Kegiatan harus diisi" |
| Kegiatan | Required, Text, Max 100 chars | "Kegiatan harus diisi" |
| Sub_Kegiatan | Required, Text, Max 100 chars | "Sub Kegiatan harus diisi" |
| Belanja_Barang | Required, Text, Max 100 chars | "Belanja Barang harus diisi" |
| Kode_Rekening | Required, Format: X.X.XX.XX.XX | "Format kode rekening salah" |
| Bidang | Required, Text, Max 50 chars | "Bidang harus diisi" |
| Pagu | Required, Number > 0 | "Pagu harus lebih dari 0" |
| Realisasi | Required, Number >= 0 | "Realisasi tidak boleh negatif" |
| Tanggal_Realisasi | Required, Date format | "Tanggal realisasi harus valid" |

### 4.2 Business Rules
1. **Realisasi tidak boleh negatif**
2. **Pagu harus lebih besar dari 0**
3. **Kode Rekening harus unik per sub kegiatan**
4. **Hierarki harus konsisten: Program → Kegiatan → Sub Kegiatan → Belanja Barang**
5. **Satu Sub Kegiatan hanya boleh dalam satu Kegiatan**
6. **Satu Kegiatan hanya boleh dalam satu Program Kegiatan**
7. **Total realisasi per Program tidak boleh melebihi total pagu Program**
8. **Tanggal realisasi tidak boleh di masa depan**

## 5. Struktur Hierarki Data

### 5.1 Hubungan Hierarki
```
Program_Kegiatan (Level 1)
├── Kegiatan (Level 2)
    ├── Sub_Kegiatan (Level 3)
        ├── Belanja_Barang (Level 4)
            └── Detail Anggaran (Level 5)
```

### 5.2 Contoh Struktur Hierarki
```
Program Peningkatan Pelayanan Publik
├── Peningkatan Sarana Prasarana
│   ├── Pengadaan Peralatan Kantor
│   │   ├── Alat Tulis Kantor
│   │   └── Peralatan Komputer
│   └── Renovasi Gedung
│       ├── Material Bangunan
│       └── Upah Tenaga Kerja
└── Peningkatan SDM
    ├── Pelatihan Pegawai
    │   ├── Biaya Pelatihan
    │   └── Biaya Konsumsi
    └── Pengembangan Kompetensi
        ├── Sertifikasi
        └── Workshop
```

### 5.3 Agregasi Data per Level
| Level | Agregasi | Formula |
|-------|----------|----------|
| Program_Kegiatan | Total Pagu Program | `SUM(Pagu WHERE Program_Kegiatan = X)` |
| Program_Kegiatan | Total Realisasi Program | `SUM(Realisasi WHERE Program_Kegiatan = X)` |
| Kegiatan | Total Pagu Kegiatan | `SUM(Pagu WHERE Kegiatan = X)` |
| Kegiatan | Total Realisasi Kegiatan | `SUM(Realisasi WHERE Kegiatan = X)` |
| Sub_Kegiatan | Total Pagu Sub Kegiatan | `SUM(Pagu WHERE Sub_Kegiatan = X)` |
| Sub_Kegiatan | Total Realisasi Sub Kegiatan | `SUM(Realisasi WHERE Sub_Kegiatan = X)` |

## 5. Indeks dan Optimasi

### 5.1 Indeks yang Diperlukan
- **Primary Index**: ID
- **Filter Index**: Semester, Bidang (untuk filtering cepat)
- **Search Index**: Nama_Kegiatan, Kode_Rekening (untuk pencarian)
- **Composite Index**: Semester + Bidang (untuk dashboard aggregation)

### 5.2 Partitioning Strategy
- **Partition by Semester**: Memisahkan data per semester untuk performa query
- **Archive Strategy**: Data tahun sebelumnya dipindah ke tabel archive
