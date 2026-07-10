# Alur Navigasi Aplikasi Monitoring Anggaran

## 1. Struktur Menu Utama

```
┌─────────────────────────────────────┐
│           HEADER NAVIGATION         │
│  [Logo] Dashboard | Data | Reports  │
└─────────────────────────────────────┘
```

### 1.1 Menu Items
- **Dashboard**: Halaman utama dengan KPI dan visualisasi
- **Data**: Tabel detail dengan fungsi CRUD
- **Reports**: Export dan laporan
- **Settings**: Konfigurasi aplikasi (admin only)

## 2. Flow Chart Navigasi

```
┌─────────────┐
│   Landing   │
│    Page     │
└──────┬──────┘
       │
       ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Dashboard  │◄──►│  Data Table │◄──►│   Reports   │
│   (Home)    │    │   (Detail)  │    │  (Export)   │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Filter    │    │ Add/Edit    │    │  Download   │
│   Dialog    │    │   Record    │    │   Report    │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 3. Halaman Dashboard dengan Menu Hierarki

### 3.1 Struktur Menu Hierarki
```
┌─────────────────────────────────────────────────────────────────┐
│                        DASHBOARD HEADER                        │
├─────────────────┬───────────────────────────────────────────────┤
│   MENU HIERARKI │              CONTENT AREA                     │
│                 │                                               │
│ 📊 Belanja      │  ┌─────────────────────────────────────────┐  │
│ ├─ 🏢 SKPD      │  │            KPI CARDS                    │  │
│ │  ├─ Unit SKPD │  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │  │
│ │  └─ Bidang    │  │  │Total │ │Total │ │ Sisa │ │  %   │   │  │
│ ├─ 📋 Program   │  │  │ Pagu │ │Reali │ │ Dana │ │Reali │   │  │
│ │  ├─ Kegiatan  │  │  └──────┘ └──────┘ └──────┘ └──────┘   │  │
│ │  └─ Sub Keg   │  └─────────────────────────────────────────┘  │
│ └─ 💰 Detail    │                                               │
│                 │  ┌─────────────────────────────────────────┐  │
│ 🔍 [Search]     │  │          VISUALIZATION                  │  │
│ 📊 [Filter]     │  │     (Charts based on selection)        │  │
│                 │  └─────────────────────────────────────────┘  │
└─────────────────┴───────────────────────────────────────────────┘
```

### 3.2 Menu Hierarki Interaktif

#### A. Level 1: Belanja (Root)
```
📊 Belanja
├─ 🏢 Dinas Kesehatan, Pengendalian Penduduk dan KB
│  ├─ 📈 Anggaran: Rp595.465.465.420,00
│  ├─ 💰 Realisasi: Rp145.374.016.286,00 (24.41%)
│  └─ 📊 Status: Rendah
├─ 🏢 Dinas Kesehatan, Pengendalian...
│  ├─ 📈 Anggaran: Rp293.757.889.028,00
│  ├─ 💰 Realisasi: Rp143.662.467.079,00 (48.91%)
│  └─ 📊 Status: Rendah
└─ [+ Expand untuk SKPD lainnya]
```

#### B. Level 2: SKPD/Unit SKPD
```
🏢 Dinas Kesehatan, Pengendalian Penduduk dan KB
├─ 🏛️ Unit SKPD
│  └─ 📋 URUSAN PEMERINTAHAN BIDANG KESEHATAN
│     ├─ 📈 Anggaran: Rp281.245.474.384,00
│     ├─ 💰 Realisasi: Rp140.716.610.905,00 (50.03%)
│     └─ 📊 Status: Rendah
└─ [+ Unit SKPD lainnya]
```

#### C. Level 3: Bidang Urusan/Program
```
📋 URUSAN PEMERINTAHAN BIDANG KESEHATAN
├─ 🎯 PROGRAM PEMENUHAN UPAYA KESEHATAN...
│  ├─ 📈 Anggaran: Rp121.342.577.570,00
│  ├─ 💰 Realisasi: Rp55.321.926.117,00 (45.59%)
│  └─ 📊 Status: Rendah
└─ [+ Program lainnya]
```

#### D. Level 4: Kegiatan
```
🎯 PROGRAM PEMENUHAN UPAYA KESEHATAN
├─ 🔧 Penyediaan Fasilitas Pelayanan...
│  ├─ 📈 Anggaran: Rp26.700.473.029,00
│  ├─ 💰 Realisasi: Rp10.233.955.445,00 (38.33%)
│  └─ 📊 Status: Rendah
└─ [+ Kegiatan lainnya]
```

#### E. Level 5: Sub Kegiatan
```
🔧 Penyediaan Fasilitas Pelayanan
├─ ⚙️ Pembangunan Puskesmas
│  ├─ 📈 Anggaran: Rp10.499.999.914,00
│  ├─ 💰 Realisasi: Rp0,00 (0.00%)
│  └─ 📊 Status: Kritis
└─ [+ Sub Kegiatan lainnya]
```

#### F. Level 6: Detail Belanja
```
⚙️ Pembangunan Puskesmas
├─ 💳 Belanja Alat/Bahan Untuk...
│  ├─ 📈 Anggaran: Rp561.600,00
│  ├─ 💰 Realisasi: Rp0,00 (0.00%)
│  ├─ 🏷️ Kode: 5.1.02.01.01.0025
│  └─ 📊 Status: Kritis
└─ [+ Detail Belanja lainnya]
```

### 3.3 Interaksi Menu Hierarki

#### A. Expand/Collapse Behavior
```javascript
// Pseudo-code untuk interaksi menu
const menuInteraction = {
  onNodeClick: (nodeId, level) => {
    if (hasChildren(nodeId)) {
      toggleExpand(nodeId);
      updateContentArea(nodeId, level);
    } else {
      showDetailView(nodeId);
    }
  },
  
  onNodeSelect: (nodeId) => {
    highlightNode(nodeId);
    updateKPICards(nodeId);
    updateVisualization(nodeId);
    updateBreadcrumb(nodeId);
  }
};
```

#### B. Status Indikator Visual
```
🟢 Tinggi (≥90%)    - Hijau
🟡 Normal (≥70%)    - Kuning  
🟠 Rendah (≥50%)    - Orange
🔴 Kritis (<50%)    - Merah
⚪ Tidak Ada Data   - Abu-abu
```

#### C. Context Menu (Right Click)
```
┌─────────────────────┐
│ 📊 Lihat Detail     │
│ 📈 Lihat Grafik     │
│ 📋 Export Data      │
│ ➕ Tambah Sub Item  │
│ ✏️ Edit             │
│ 🗑️ Hapus            │
└─────────────────────┘
```

### 3.4 Breadcrumb Navigation
```
🏠 Dashboard > 📊 Belanja > 🏢 Dinas Kesehatan > 📋 Urusan Kesehatan > 🎯 Program Upaya Kesehatan > 🔧 Penyediaan Fasilitas > ⚙️ Pembangunan Puskesmas
```

### 3.5 Search & Filter Integration
```
┌─────────────────────────────────────────────────────┐
│ 🔍 [Cari program, kegiatan, atau kode rekening...] │
├─────────────────────────────────────────────────────┤
│ 📊 Filter:                                          │
│ [Semester ▼] [Status ▼] [Bidang ▼] [Range Anggaran] │
└─────────────────────────────────────────────────────┘
```

### 3.6 Layout Desktop dengan Menu Hierarki
```
┌──────────────────────────────────────────────────────┐
│                    HEADER BAR                        │
├─────────────┬────────────────────────────────────────┤
│   FILTERS   │              KPI CARDS                 │
│             │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│ Semester:   │  │Total │ │Total │ │ Sisa │ │  %   │   │
│ [Dropdown]  │  │ Pagu │ │Reali │ │ Dana │ │Reali │   │
│             │  └──────┘ └──────┘ └──────┘ └──────┘   │
│ Bidang:     │                                        │
│ [Multi-sel] │              VISUALIZATIONS            │
│             │  ┌─────────────────────────────────┐   │
│ [Reset]     │  │        Bar Chart per Bidang     │   │
│ [Apply]     │  └─────────────────────────────────┘   │
└─────────────┴────────────────────────────────────────┤
│                  QUICK SUMMARY TABLE                 │
│  Top 5 Kegiatan dengan Realisasi Tertinggi          │
└──────────────────────────────────────────────────────┘
```

### 3.2 Layout Mobile
```
┌─────────────────────┐
│     HEADER BAR      │
├─────────────────────┤
│    FILTER BUTTON    │
│   [☰ Show Filters]  │
├─────────────────────┤
│     KPI CARDS       │
│   (Stacked 2x2)     │
│  ┌────────┬────────┐│
│  │ Total  │ Total  ││
│  │  Pagu  │ Reali  ││
│  ├────────┼────────┤│
│  │  Sisa  │   %    ││
│  │  Dana  │ Reali  ││
│  └────────┴────────┘│
├─────────────────────┤
│    CHART (Swipe)    │
│  ┌─────────────────┐│
│  │   Bar Chart     ││
│  │  (Horizontal)   ││
│  └─────────────────┘│
└─────────────────────┘
```

## 4. Halaman Data Table

### 4.1 Layout dan Fitur
```
┌──────────────────────────────────────────────────────┐
│  SEARCH BAR                              [+ Add New] │
│  [🔍 Search activities...]               [Export]    │
├──────────────────────────────────────────────────────┤
│                    DATA TABLE                        │
│ ┌──┬─────────────┬──────────┬────────┬────────┬─────┐│
│ │✓ │Nama Kegiatan│Kode Rek  │  Pagu  │Realisasi│ %  ││
│ ├──┼─────────────┼──────────┼────────┼────────┼─────┤│
│ │  │Pengadaan ATK│5.1.02.01 │50,000K │35,000K │70% ││
│ │  │Perj. Dinas  │5.1.02.02 │75,000K │60,000K │80% ││
│ └──┴─────────────┴──────────┴────────┴────────┴─────┘│
├──────────────────────────────────────────────────────┤
│  PAGINATION: [◄] Page 1 of 10 [►]     [10 per page] │
└──────────────────────────────────────────────────────┘
```

### 4.2 Actions per Row
- **View**: Lihat detail lengkap
- **Edit**: Edit data (jika ada permission)
- **Delete**: Hapus record (admin only)
- **History**: Lihat riwayat perubahan

## 5. Modal/Dialog Flows

### 5.1 Filter Dialog
```
┌─────────────────────────┐
│      FILTER OPTIONS     │
├─────────────────────────┤
│ Semester:               │
│ ○ All                   │
│ ○ Semester 1            │
│ ○ Semester 2            │
│                         │
│ Bidang:                 │
│ ☑ Bidang A              │
│ ☑ Bidang B              │
│ ☐ Bidang C              │
│                         │
│ Rentang Anggaran:       │
│ Min: [_______]          │
│ Max: [_______]          │
│                         │
│ [Reset] [Cancel] [Apply]│
└─────────────────────────┘
```

### 5.2 Add/Edit Record Dialog
```
┌─────────────────────────┐
│    ADD/EDIT KEGIATAN    │
├─────────────────────────┤
│ Semester: [Dropdown]    │
│ Bidang: [Dropdown]      │
│ Kode Rekening: [____]   │
│ Nama Kegiatan: [____]   │
│ Pagu: [____________]    │
│ Realisasi: [________]   │
│                         │
│ Calculated Fields:      │
│ Sisa: Rp 15,000,000     │
│ Persentase: 70%         │
│                         │
│ [Cancel] [Save]         │
└─────────────────────────┘
```

## 6. User Experience Flow

### 6.1 Typical User Journey
1. **Landing** → User membuka aplikasi
2. **Dashboard** → Melihat overview KPI
3. **Apply Filters** → Filter berdasarkan semester/bidang
4. **View Charts** → Analisis visual data
5. **Drill Down** → Klik "View Details" ke tabel
6. **Search/Sort** → Cari kegiatan spesifik
7. **Export** → Download laporan

### 6.2 Admin User Journey
1. **Dashboard** → Overview sistem
2. **Data Management** → Add/Edit/Delete records
3. **Bulk Import** → Upload Excel file
4. **User Management** → Kelola akses user
5. **System Reports** → Generate comprehensive reports

## 7. Responsive Navigation

### 7.1 Mobile Navigation
```
┌─────────────────────────┐
│ [☰] App Name    [User]  │ ← Header always visible
├─────────────────────────┤
│                         │
│     Main Content        │
│                         │
├─────────────────────────┤
│ [🏠] [📊] [📋] [📄]     │ ← Bottom navigation
└─────────────────────────┘
```

### 7.2 Tablet Navigation
```
┌─────────────────────────────────────┐
│ [Logo] Dashboard | Data | Reports   │ ← Top navigation
├─────────────────────────────────────┤
│                                     │
│           Main Content              │
│                                     │
└─────────────────────────────────────┘
```

## 8. Error Handling & Loading States

### 8.1 Loading States
- **Dashboard Loading**: Skeleton cards while data loads
- **Table Loading**: Spinner with "Loading data..." message
- **Chart Loading**: Placeholder with loading animation

### 8.2 Error States
- **No Data**: "Tidak ada data untuk filter yang dipilih"
- **Network Error**: "Koneksi bermasalah, silakan coba lagi"
- **Permission Error**: "Anda tidak memiliki akses ke halaman ini"

### 8.3 Success States
- **Data Saved**: Toast notification "Data berhasil disimpan"
- **Export Complete**: "Laporan berhasil diunduh"
- **Filter Applied**: Update data dengan smooth transition
