# Panduan Pengujian Aplikasi Monitoring Anggaran

Dokumen ini berisi panduan langkah demi langkah untuk menguji fungsionalitas aplikasi monitoring anggaran.

## 1. Pengujian Halaman Utama (Dashboard)

Buka halaman utama aplikasi (biasanya `http://localhost:3000`).

### 1.1. Verifikasi Tampilan Awal
- [ ] Pastikan 4 kartu KPI (Total Pagu, Total Realisasi, Sisa Anggaran, Persentase Realisasi) menampilkan data.
- [ ] Pastikan nilai mata uang pada kartu KPI diformat dengan benar (contoh: `Rp. 1.234.567`).
- [ ] Pastikan tabel data anggaran di bawahnya menampilkan daftar kegiatan.
- [ ] Pastikan ada tombol filter untuk Semester dan Bidang.

### 1.2. Pengujian Filter
- [ ] **Filter Semester:**
  - Pilih 'Semester 1'. Verifikasi bahwa hanya data dari Semester 1 yang ditampilkan di tabel dan KPI diperbarui.
  - Pilih 'Semester 2'. Verifikasi bahwa hanya data dari Semester 2 yang ditampilkan.
  - Pilih 'Semua Semester'. Verifikasi bahwa semua data kembali ditampilkan.
- [ ] **Filter Bidang:**
  - Pilih satu atau beberapa bidang (misal: 'Sekretariat', 'SDK'). Verifikasi bahwa tabel hanya menampilkan data dari bidang yang dipilih dan KPI diperbarui.
  - Hapus pilihan bidang. Verifikasi bahwa data dari semua bidang kembali ditampilkan.
- [ ] **Kombinasi Filter:**
  - Pilih 'Semester 1' dan bidang 'P2P'. Verifikasi bahwa hanya data P2P dari Semester 1 yang muncul.
- [ ] **Pencarian (Search):**
  - Ketik nama kegiatan (misal: 'Pengadaan') di kolom pencarian. Verifikasi bahwa tabel hanya menampilkan data yang cocok.
  - Coba cari berdasarkan kode rekening atau bidang.

### 1.3. Pengujian Aksi pada Tabel
Untuk setiap baris data di tabel, lakukan pengujian berikut:

- [ ] **Tombol Lihat (View):**
  - Klik ikon mata (Lihat).
  - Pastikan modal (jendela pop-up) muncul dengan judul 'Detail Data Anggaran'.
  - Verifikasi bahwa semua data yang ditampilkan di modal sudah benar dan dalam mode *read-only* (tidak bisa diubah).
  - Klik 'Tutup' atau tombol 'X' untuk menutup modal.

- [ ] **Tombol Edit:**
  - Klik ikon pensil (Edit).
  - Pastikan modal muncul dengan judul 'Edit Data Anggaran'.
  - Coba ubah salah satu nilai (misal: Pagu atau Realisasi).
  - Klik 'Simpan'.
  - Verifikasi bahwa data di tabel telah diperbarui sesuai perubahan.
  - Verifikasi bahwa KPI di atas juga ikut diperbarui.

- [ ] **Tombol Hapus (Delete):**
  - Klik ikon tong sampah (Hapus).
  - Pastikan muncul konfirmasi penghapusan.
  - Klik 'OK' atau 'Ya'.
  - Verifikasi bahwa baris data tersebut hilang dari tabel.
  - Verifikasi bahwa KPI di atas juga ikut diperbarui.

## 2. Pengujian Halaman Detail Data

Navigasi ke halaman detail (klik menu 'Detail Data' di sidebar).

### 2.1. Verifikasi Tampilan dan Fungsi Dasar
- [ ] Pastikan halaman menampilkan judul 'Data Detail Anggaran'.
- [ ] Pastikan filter dan tabel data berfungsi sama seperti di halaman utama.

### 2.2. Pengujian Tombol Tambah Data
- [ ] Klik tombol 'Tambah Data'.
- [ ] Pastikan modal muncul dengan judul 'Tambah Data Anggaran'.
- [ ] Isi semua kolom formulir dengan data baru.
- [ ] Klik 'Simpan'.
- [ ] Verifikasi bahwa data baru tersebut muncul di dalam tabel.
- [ ] Coba filter untuk menemukan data yang baru saja ditambahkan.

### 2.3. Pengujian Tombol Import XLSX
- [ ] Buat sebuah file Excel baru (misal: `import_test.xlsx`).
- [ ] Isi file tersebut dengan beberapa baris data. Pastikan nama kolom (header) sesuai dengan format yang dibutuhkan: `Nama Kegiatan`, `Kode Rekening`, `Pagu`, `Realisasi`, `Semester`, `Bidang`.
- [ ] Kembali ke aplikasi, di halaman "Detail Data", klik tombol 'Import XLSX'.
- [ ] Pilih file `import_test.xlsx` yang baru saja Anda buat.
- [ ] Verifikasi bahwa data dari file Excel tersebut muncul di dalam tabel.
- [ ] Pastikan pesan sukses "data berhasil diimpor" ditampilkan.
- [ ] Coba impor file dengan format kolom yang salah dan pastikan pesan error yang jelas muncul.

### 2.4. Pengujian Aksi pada Tabel (Lihat, Edit, Hapus)
- [ ] Ulangi langkah-langkah pada **Seksi 1.3** untuk memastikan semua aksi (Lihat, Edit, Hapus) berfungsi dengan benar di halaman ini.

## 3. Pengujian Umum

- [ ] **Responsivitas:**
  - Ubah ukuran jendela browser menjadi lebih kecil (seperti layar HP).
  - Pastikan tampilan aplikasi tetap rapi dan semua elemen dapat diakses.
- [ ] **Pesan Error dan Sukses:**
  - Pastikan pesan yang jelas muncul setelah berhasil menyimpan, mengedit, atau menghapus data.
  - Jika terjadi kesalahan (misal: gagal menyimpan), pastikan pesan error yang informatif ditampilkan.
- [ ] **Tombol Refresh:**
  - Klik tombol 'Refresh' di halaman Detail Data. Pastikan data dimuat ulang dari awal.

Setelah menyelesaikan semua langkah di atas, aplikasi dapat dianggap telah teruji dan berfungsi sesuai harapan.

## 1. Persiapan Environment

### 1.1 Prerequisites
Pastikan Anda sudah menginstall:
- **Node.js** (versi 16 atau lebih baru)
- **npm** (biasanya sudah termasuk dengan Node.js)
- **Git** (opsional, untuk version control)

### 1.2 Verifikasi Installation
```bash
# Cek versi Node.js
node --version

# Cek versi npm
npm --version
```

## 2. Setup dan Installation

### 2.1 Navigate ke Project Directory
```bash
cd "e:\DATA APLIKASI\Realisasi Keuangan"
```

### 2.2 Install Dependencies
```bash
# Install semua dependencies yang diperlukan
npm install
```

### 2.3 Troubleshooting Installation
Jika ada error saat install:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules dan package-lock.json
rmdir /s node_modules
del package-lock.json

# Install ulang
npm install
```

## 3. Menjalankan Aplikasi

### 3.1 Development Mode
```bash
# Jalankan aplikasi dalam development mode
npm start
```

Aplikasi akan:
- Otomatis membuka browser di `http://localhost:3000`
- Hot reload saat ada perubahan kode
- Menampilkan error di console jika ada masalah

### 3.2 Production Build
```bash
# Build aplikasi untuk production
npm run build

# Serve production build (install serve dulu)
npm install -g serve
serve -s build
```

## 4. Testing Checklist

### 4.1 Dashboard Testing

#### ✅ KPI Cards
- [ ] **Total Pagu Anggaran** menampilkan nilai yang benar
- [ ] **Total Realisasi** menampilkan nilai yang benar  
- [ ] **Sisa Dana** menampilkan kalkulasi yang benar (Pagu - Realisasi)
- [ ] **Persentase Realisasi** menampilkan % yang benar
- [ ] Trend indicators (arrow up/down) berfungsi
- [ ] Hover effects pada cards berfungsi

#### ✅ Progress Overview
- [ ] Progress bar menampilkan persentase yang benar
- [ ] Status colors (hijau/merah/biru) sesuai dengan kondisi
- [ ] Total Kegiatan menampilkan jumlah yang benar
- [ ] Distribusi status (Sesuai Target, Melebihi Anggaran) benar

### 4.2 Filter Testing

#### ✅ Semester Filter
- [ ] Dropdown menampilkan "Semester 1" dan "Semester 2"
- [ ] Filter "Semua Semester" menampilkan semua data
- [ ] Filter "Semester 1" hanya menampilkan data semester 1
- [ ] Filter "Semester 2" hanya menampilkan data semester 2

#### ✅ Bidang Filter
- [ ] Multi-select dropdown berfungsi
- [ ] Dapat memilih multiple bidang sekaligus
- [ ] Filter menampilkan data sesuai bidang yang dipilih
- [ ] Clear selection berfungsi

#### ✅ Search Filter
- [ ] Search box dapat mencari berdasarkan nama kegiatan
- [ ] Search box dapat mencari berdasarkan kode rekening
- [ ] Search box dapat mencari berdasarkan bidang
- [ ] Clear search berfungsi

#### ✅ Reset Filter
- [ ] Tombol "Reset" mengembalikan semua filter ke default
- [ ] Active filter indicator hilang setelah reset

### 4.3 Chart Testing

#### ✅ Bar Chart
- [ ] Chart menampilkan data per bidang
- [ ] Bars untuk "Pagu" dan "Realisasi" terlihat
- [ ] Tooltip menampilkan nilai dalam format Rupiah
- [ ] Legend menampilkan keterangan yang benar
- [ ] Chart responsive di berbagai ukuran layar

#### ✅ Pie Chart
- [ ] Chart menampilkan distribusi status
- [ ] Warna sesuai dengan status (hijau, biru, merah)
- [ ] Tooltip menampilkan jumlah dan persentase
- [ ] Legend menampilkan label yang benar

### 4.4 Table Testing

#### ✅ Data Display
- [ ] Semua kolom terlihat dengan benar
- [ ] Format currency (Rupiah) ditampilkan dengan benar
- [ ] Progress bar di kolom "Progress" berfungsi
- [ ] Status tags menampilkan warna yang sesuai
- [ ] Nomor urut ditampilkan dengan benar

#### ✅ Table Features
- [ ] Sorting pada kolom Pagu, Realisasi, Sisa berfungsi
- [ ] Filter status di kolom Status berfungsi
- [ ] Pagination berfungsi (Previous/Next)
- [ ] Page size selector berfungsi (10, 20, 50, 100)
- [ ] Table summary menampilkan total yang benar

#### ✅ Row Selection
- [ ] Checkbox selection berfungsi
- [ ] "Select All" berfungsi
- [ ] Counter "X item dipilih" akurat
- [ ] Bulk actions (Export, Delete) berfungsi

#### ✅ Actions
- [ ] Tombol "Lihat Detail" (Eye icon) berfungsi
- [ ] Tombol "Edit" (Edit icon) berfungsi
- [ ] Tombol "Hapus" (Delete icon) menampilkan konfirmasi
- [ ] Export CSV berfungsi dan file terdownload

### 4.5 Responsive Testing

#### ✅ Desktop (> 1024px)
- [ ] Layout 4 kolom untuk KPI cards
- [ ] Chart dan table terlihat penuh
- [ ] Sidebar filter terlihat
- [ ] Semua fitur dapat diakses

#### ✅ Tablet (768px - 1024px)
- [ ] Layout 2 kolom untuk KPI cards
- [ ] Chart masih readable
- [ ] Table dapat di-scroll horizontal
- [ ] Filter dapat diakses

#### ✅ Mobile (< 768px)
- [ ] KPI cards stack vertikal
- [ ] Filter menjadi collapsible
- [ ] Table dapat di-scroll horizontal
- [ ] Touch interactions berfungsi
- [ ] Bottom navigation (jika ada) berfungsi

### 4.6 Performance Testing

#### ✅ Loading Performance
- [ ] Initial load < 3 detik
- [ ] Filter changes < 1 detik
- [ ] Chart rendering smooth
- [ ] No memory leaks saat navigasi

#### ✅ Data Handling
- [ ] Mock data (6 records) load dengan benar
- [ ] Calculations (Sisa, Persentase) akurat
- [ ] Aggregations (Total, Summary) benar
- [ ] No JavaScript errors di console

## 5. Browser Compatibility Testing

### 5.1 Desktop Browsers
- [ ] **Chrome** (latest)
- [ ] **Firefox** (latest)
- [ ] **Safari** (latest)
- [ ] **Edge** (latest)

### 5.2 Mobile Browsers
- [ ] **Chrome Mobile**
- [ ] **Safari Mobile**
- [ ] **Samsung Internet**

## 6. Error Handling Testing

### 6.1 Network Errors
- [ ] Aplikasi menampilkan loading state
- [ ] Error message muncul jika API gagal
- [ ] Retry mechanism berfungsi

### 6.2 Data Validation
- [ ] Empty state ditampilkan jika tidak ada data
- [ ] Invalid data tidak crash aplikasi
- [ ] Form validation berfungsi (jika ada)

## 7. Sample Test Data

Aplikasi menggunakan mock data berikut untuk testing:

```javascript
// 6 sample records dengan berbagai status
[
  {
    semester: "Semester 1",
    bidang: "Bidang A", 
    pagu: 50000000,
    realisasi: 35000000,
    // Status: Under Budget (70%)
  },
  {
    semester: "Semester 2",
    bidang: "Bidang B",
    pagu: 80000000, 
    realisasi: 95000000,
    // Status: Over Budget (118.75%)
  }
  // ... 4 records lainnya
]
```

## 8. Common Issues & Solutions

### 8.1 Port Already in Use
```bash
# Error: Port 3000 is already in use
# Solution: Kill process atau gunakan port lain
npx kill-port 3000
# atau
PORT=3001 npm start
```

### 8.2 Dependencies Issues
```bash
# Error: Module not found
# Solution: Install missing dependencies
npm install --save [missing-package]
```

### 8.3 Build Errors
```bash
# Error: Build failed
# Solution: Check console untuk specific error
npm run build 2>&1 | tee build.log
```

## 9. Test Results Template

```
HASIL TESTING APLIKASI MONITORING ANGGARAN
==========================================
Tanggal Testing: [DATE]
Tester: [NAME]
Browser: [BROWSER VERSION]
OS: [OPERATING SYSTEM]

DASHBOARD TESTING:
✅ KPI Cards: PASS
✅ Progress Overview: PASS
✅ Charts: PASS

FILTER TESTING:
✅ Semester Filter: PASS
✅ Bidang Filter: PASS  
✅ Search Filter: PASS

TABLE TESTING:
✅ Data Display: PASS
✅ Sorting/Pagination: PASS
✅ Export Function: PASS

RESPONSIVE TESTING:
✅ Desktop: PASS
✅ Tablet: PASS
✅ Mobile: PASS

OVERALL RESULT: ✅ PASS / ❌ FAIL
NOTES: [Any issues or observations]
```

## 10. Next Steps

Setelah testing berhasil:
1. **Deploy ke Production** (Netlify, Vercel, dll)
2. **Setup Backend API** untuk data real
3. **Add Authentication** jika diperlukan
4. **Performance Optimization**
5. **User Acceptance Testing**
