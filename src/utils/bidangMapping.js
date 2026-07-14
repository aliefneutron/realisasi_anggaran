export const bidangMapping = {
    "SEKRETARIAT": [
        "1.02.01.2.01.0001",
        "1.02.01.2.01.0002",
        "1.02.01.2.01.0003",
        "1.02.01.2.01.0004",
        "1.02.01.2.01.0005",
        "1.02.01.2.01.0006",
        "1.02.01.2.01.0007",
        "1.02.01.2.01.0009",
        "1.02.01.2.02.0001",
        "1.02.01.2.02.0003",
        "1.02.01.2.02.0005",
        "1.02.01.2.02.0007",
        "1.02.01.2.03.0005",
        "1.02.01.2.06.0001",
        "1.02.01.2.06.0002",
        "1.02.01.2.06.0004",
        "1.02.01.2.06.0005",
        "1.02.01.2.06.0006",
        "1.02.01.2.06.0009",
        "1.02.01.2.08.0002",
        "1.02.01.2.09.0002",
        "1.02.01.2.09.0006",
        "1.02.01.2.09.0009"
    ],
    "YANKES": [
        "1.02.02.2.01.0006",
        "1.02.02.2.01.0024",
        "1.02.02.2.02.0019",
        "1.02.02.2.02.0026",
        "1.02.02.2.02.0033",
        "1.02.02.2.02.0038",
        "1.02.02.2.02.0045",
        "1.02.02.2.03.0002",
        "1.02.02.2.04.0001",
        "1.02.02.2.04.0003",
        "1.02.02.2.04.0004"
    ],
    "SDK": [
        "1.02.02.2.01.0014",
        "1.02.02.2.01.0020",
        "1.02.02.2.01.0023",
        "1.02.02.2.01.0026",
        "1.02.03.2.01.0001",
        "1.02.03.2.02.0001",
        "1.02.03.2.02.0002",
        "1.02.03.2.02.0003",
        "1.02.03.2.03.0001"
    ],
    "KESMAS": [
        "1.02.02.2.02.0001",
        "1.02.02.2.02.0002",
        "1.02.02.2.02.0003",
        "1.02.02.2.02.0004",
        "1.02.02.2.02.0005",
        "1.02.02.2.02.0006",
        "1.02.02.2.02.0007",
        "1.02.02.2.02.0015",
        "1.02.02.2.02.0016",
        "1.02.02.2.02.0017",
        "1.02.02.2.02.0018",
        "1.02.02.2.02.0029",
        "1.02.02.2.02.0046",
        "1.02.04.2.04.0001",
        "1.02.04.2.05.0001",
        "1.02.05.2.01.0001",
        "1.02.05.2.03.0001"
    ],
    "P2P": [
        "1.02.02.2.02.0008",
        "1.02.02.2.02.0009",
        "1.02.02.2.02.0010",
        "1.02.02.2.02.0011",
        "1.02.02.2.02.0012",
        "1.02.02.2.02.0020",
        "1.02.02.2.02.0025",
        "1.02.02.2.02.0028",
        "1.02.02.2.02.0036",
        "1.02.02.2.02.0042",
        "1.02.02.2.02.0050"
    ],
    "KB": [
        "2.14.02.2.02.0012",
        "2.14.02.2.02.0013",
        "2.14.02.2.02.0027",
        "2.14.03.2.01.0010",
        "2.14.03.2.01.0014",
        "2.14.03.2.02.0002",
        "2.14.03.2.02.0004",
        "2.14.03.2.03.0001",
        "2.14.03.2.03.0003",
        "2.14.04.2.01.0014",
        "2.14.04.2.02.0006"
    ]
};

/**
 * Returns the Bidang name based on the provided kode rekening.
 * @param {string} kodeRekening The account code (e.g., sub-kegiatan or belanja code).
 * @returns {string} The Bidang name or "Umum" if not found.
 */
export const getBidangByKodeRekening = (kodeRekening) => {
    if (!kodeRekening) return "Umum";
    
    // Sub kegiatan codes are 17 characters (e.g., 1.02.01.2.01.0001)
    // Extract the first 17 chars to get the sub-kegiatan prefix
    const subKegiatanPrefix = kodeRekening.length >= 17 ? kodeRekening.substring(0, 17) : kodeRekening;

    for (const [bidang, kodes] of Object.entries(bidangMapping)) {
        if (kodes.includes(subKegiatanPrefix)) {
            return bidang;
        }
    }
    return "Umum";
};

/**
 * Logika penentuan level dari kode rekening.
 * Sesuai panduan:
 * 1. Sub Kegiatan / penentu Bidang (contoh: 1.02.01.2.01.0003) -> 6 bagian, awalan 1/2
 * 2. Jenis Belanja (contoh: 5.1.02.01.001) -> 5 bagian, awalan 5
 * 3. Detail Belanja (contoh: 5.1.02.01.001.00024) -> 6 bagian, awalan 5
 * 
 * @param {string} kodeRekening The account code
 * @returns {string} The level string ("Sub Kegiatan", "Jenis Belanja", "Detail Belanja", or "Unknown")
 */
export const getLevelInfoByKodeRekening = (kodeRekening) => {
    if (!kodeRekening) return "Unknown";
    
    const parts = kodeRekening.split('.');
    
    // Sub Kegiatan
    if (parts.length === 6 && (kodeRekening.startsWith('1.') || kodeRekening.startsWith('2.'))) {
        return "Sub Kegiatan";
    }
    
    // Jenis Belanja
    if (parts.length === 5 && kodeRekening.startsWith('5.')) {
        return "Jenis Belanja";
    }
    
    // Detail Belanja
    if (parts.length === 6 && kodeRekening.startsWith('5.')) {
        return "Detail Belanja";
    }
    
    return "Unknown";
};

export const subKegiatanNameMapping = {
    '1.02.01.2.01.0001': 'Penyusunan Dokumen Perencanaan Perangkat Daerah',
    '1.02.01.2.01.0002': 'Koordinasi dan Penyusunan Dokumen RKA-SKPD',
    '1.02.01.2.01.0003': 'Koordinasi dan Penyusunan Dokumen Perubahan RKA-SKPD',
    '1.02.01.2.01.0004': 'Koordinasi dan Penyusunan DPA-SKPD',
    '1.02.01.2.01.0005': 'Koordinasi dan Penyusunan Perubahan DPA-SKPD',
    '1.02.01.2.01.0006': 'Koordinasi dan Penyusunan Laporan Capaian Kinerja dan Ikhtisar Realisasi Kinerja SKPD',
    '1.02.01.2.01.0007': 'Evaluasi Kinerja Perangkat Daerah',
    '1.02.01.2.01.0009': 'Pelaksanaan Pengumpulan Data Statistik Sektoral Daerah',
    '1.02.01.2.02.0001': 'Penyediaan Gaji dan Tunjangan ASN',
    '1.02.01.2.02.0003': 'Pelaksanaan Penatausahaan dan Pengujian/Verifikasi Keuangan SKPD',
    '1.02.01.2.02.0005': 'Koordinasi dan Penyusunan Laporan Keuangan Akhir Tahun SKPD',
    '1.02.01.2.02.0007': 'Koordinasi dan Penyusunan Laporan Keuangan Bulanan/Triwulanan/Semesteran SKPD',
    '1.02.01.2.03.0005': 'Rekonsiliasi dan Penyusunan Laporan Barang Milik Daerah pada SKPD',
    '1.02.01.2.06.0001': 'Penyediaan Komponen Instalasi Listrik/Penerangan Bangunan Kantor',
    '1.02.01.2.06.0002': 'Penyediaan Peralatan dan Perlengkapan Kantor',
    '1.02.01.2.06.0004': 'Penyediaan Bahan Logistik Kantor',
    '1.02.01.2.06.0005': 'Penyediaan Barang Cetakan dan Penggandaan',
    '1.02.01.2.06.0006': 'Penyediaan Bahan Bacaan dan Peraturan Perundang-undangan',
    '1.02.01.2.06.0009': 'Penyelenggaraan Rapat Koordinasi dan Konsultasi SKPD',
    '1.02.01.2.08.0002': 'Penyediaan Jasa Komunikasi, Sumber Daya Air dan Listrik',
    '1.02.01.2.09.0002': 'Penyediaan Jasa Pemeliharaan, Biaya Pemeliharaan, Pajak dan Perizinan Kendaraan Dinas Operasional atau Lapangan',
    '1.02.01.2.09.0006': 'Pemeliharaan Peralatan dan Mesin Lainnya',
    '1.02.01.2.09.0009': 'Pemeliharaan/Rehabilitasi Gedung Kantor dan Bangunan Lainnya',
    '1.02.02.2.01.0006': 'Pengembangan Puskesmas',
    '1.02.02.2.01.0024': 'Pengelolaan Pelayanan Kesehatan Dasar Melalui Pendekatan Keluarga',
    '1.02.02.2.02.0019': 'Pengelolaan Pelayanan Kesehatan Tradisional, Akupuntur, Asuhan Mandiri, dan Tradisional Lainnya',
    '1.02.02.2.02.0026': 'Pengelolaan Jaminan Kesehatan Masyarakat',
    '1.02.02.2.02.0033': 'Operasional Pelayanan Puskesmas',
    '1.02.02.2.02.0038': 'Penyediaan dan Pengelolaan Sistem Penanganan Gawat Darurat Terpadu (SPGDT)',
    '1.02.02.2.02.0045': 'Koordinasi dan Sinkronisasi Penerapan SPM Bidang Kesehatan Kabupaten/Kota',
    '1.02.02.2.03.0002': 'Pengelolaan Sistem Informasi Kesehatan',
    '1.02.02.2.04.0001': 'Pengendalian dan Pengawasan serta Tindak Lanjut Pengawasan Perizinan Rumah Sakit Kelas C, D dan Fasilitas Pelayanan Kesehatan Lainnya',
    '1.02.02.2.04.0003': 'Peningkatan Mutu Pelayanan Fasilitas Kesehatan',
    '1.02.02.2.04.0004': 'Penyiapan Perumusan dan Pelaksanaan Pelayanan Kesehatan Rujukan',
    '1.02.02.2.01.0014': 'Pengadaan Alat Kesehatan/Alat Penunjang Medik Fasilitas Pelayanan Kesehatan',
    '1.02.02.2.01.0020': 'Pemeliharaan Rutin dan Berkala Alat Kesehatan/Alat Penunjang Medik Fasilitas Pelayanan Kesehatan',
    '1.02.02.2.01.0023': 'Pengadaan Obat, Bahan Habis Pakai, Bahan Medis Habis Pakai, Vaksin, Makanan dan Minuman di Fasilitas Kesehatan',
    '1.02.02.2.01.0026': 'Distribusi Alat Kesehatan, Obat, Bahan Habis Pakai, Bahan Medis Habis Pakai, Vaksin, Makanan dan Minuman ke Fasilitas Kesehatan',
    '1.02.03.2.01.0001': 'Pengendalian Perizinan Praktik Tenaga Kesehatan',
    '1.02.03.2.02.0001': 'Perencanaan dan Distribusi serta Pemerataan Sumber Daya Manusia Kesehatan',
    '1.02.03.2.02.0002': 'Pemenuhan Kebutuhan Sumber Daya Manusia Kesehatan Sesuai Standar',
    '1.02.03.2.02.0003': 'Pembinaan dan Pengawasan Sumber Daya Manusia Kesehatan',
    '1.02.03.2.03.0001': 'Pengembangan Mutu dan Peningkatan Kompetensi Teknis Sumber Daya Manusia Kesehatan Tingkat Daerah Kabupaten/Kota',
    '1.02.02.2.02.0001': 'Pengelolaan Pelayanan Kesehatan Ibu Hamil',
    '1.02.02.2.02.0002': 'Pengelolaan Pelayanan Kesehatan Ibu Bersalin',
    '1.02.02.2.02.0003': 'Pengelolaan Pelayanan Kesehatan Bayi Baru Lahir',
    '1.02.02.2.02.0004': 'Pengelolaan Pelayanan Kesehatan Balita',
    '1.02.02.2.02.0005': 'Pengelolaan Pelayanan Kesehatan pada Usia Pendidikan Dasar',
    '1.02.02.2.02.0006': 'Pengelolaan Pelayanan Kesehatan pada Usia Produktif',
    '1.02.02.2.02.0007': 'Pengelolaan Pelayanan Kesehatan pada Usia Lanjut',
    '1.02.02.2.02.0015': 'Pengelolaan Pelayanan Kesehatan Gizi Masyarakat',
    '1.02.02.2.02.0016': 'Pengelolaan Pelayanan Kesehatan Kerja dan Olahraga',
    '1.02.02.2.02.0017': 'Pengelolaan Pelayanan Kesehatan Lingkungan',
    '1.02.02.2.02.0018': 'Pengelolaan Pelayanan Promosi Kesehatan',
    '1.02.02.2.02.0029': 'Penyelenggaraan Kabupaten/Kota Sehat',
    '1.02.02.2.02.0046': 'Pengelolaan upaya kesehatan Ibu dan Anak',
    '1.02.04.2.04.0001': 'Pengendalian dan Pengawasan serta Tindak Lanjut Pengawasan Penerbitan Sertifikat Laik Higiene Sanitasi Tempat Pengelolaan Makanan (TPM) antara lain Jasa Boga, Rumah Makan/Restoran dan Depot Air Minum (DAM)',
    '1.02.04.2.05.0001': 'Pengendalian dan Pengawasan serta Tindak Lanjut Penerbitan Stiker Pembinaan pada Makanan Jajanan dan Sentra Makanan Jajanan',
    '1.02.05.2.01.0001': 'Peningkatan Upaya Promosi Kesehatan, Advokasi, Kemitraan dan Pemberdayaan Masyarakat',
    '1.02.05.2.03.0001': 'Bimbingan Teknis dan Supervisi Pengembangan dan Pelaksanaan Upaya Kesehatan Bersumber Daya Masyarakat (UKBM)',
    '1.02.02.2.02.0008': 'Pengelolaan Pelayanan Kesehatan Penderita Hipertensi',
    '1.02.02.2.02.0009': 'Pengelolaan Pelayanan Kesehatan Penderita Diabetes Mellitus',
    '1.02.02.2.02.0010': 'Pengelolaan Pelayanan Kesehatan Orang dengan Gangguan Jiwa Berat',
    '1.02.02.2.02.0011': 'Pengelolaan Pelayanan Kesehatan Orang Terduga Tuberkulosis',
    '1.02.02.2.02.0012': 'Pengelolaan Pelayanan Kesehatan Orang dengan Risiko Terinfeksi HIV',
    '1.02.02.2.02.0020': 'Pengelolaan Surveilans Kesehatan',
    '1.02.02.2.02.0025': 'Pelayanan Kesehatan Penyakit Menular dan Tidak Menular',
    '1.02.02.2.02.0028': 'Pengambilan dan Pengiriman Spesimen Penyakit Potensial KLB ke Laboratorium Rujukan/Nasional',
    '1.02.02.2.02.0036': 'Investigasi Awal Kejadian Tidak Diharapkan (Kejadian Ikutan Pasca Imunisasi dan Pemberian Obat Massal)',
    '1.02.02.2.02.0042': 'Pengelolaan pelayanan Kesehatan Malaria',
    '1.02.02.2.02.0050': 'Pengelolaan Pelayanan Kesehatan Haji',
    '2.14.02.2.02.0012': 'Pencatatan dan Pengumpulan Data Keluarga',
    '2.14.02.2.02.0013': 'Pengolahan dan Pelaporan Data Pengendalian Lapangan dan Pelayanan KB',
    '2.14.02.2.02.0027': 'Penyusunan Profil program Pembangunan Keluarga, Kependudukan, dan Keluarga Berencana (Bangga Kencana)',
    '2.14.03.2.01.0010': 'Pengelolaan Operasional dan Sarana di Balai Penyuluhan Bangga Kencana',
    '2.14.03.2.01.0014': 'Advokasi Program Bangga Kencana oleh pokja advokasi kepada Stakeholders dan Mitra Kerja',
    '2.14.03.2.02.0002': 'Penyediaan Sarana Pendukung Operasional PKB/PLKB',
    '2.14.03.2.02.0004': 'Penggerakan Kader Institusi Masyarakat Pedesaan (IMP)',
    '2.14.03.2.03.0001': 'Pengendalian Pendistribusian Alat dan Obat Kontrasepsi dan Sarana Penunjang Pelayanan KB ke Fasilitas Kesehatan Termasuk Jaringan dan Jejaringnya',
    '2.14.03.2.03.0003': 'Peningkatan Kesertaan Penggunaan Metode Kontrasepsi Jangka Panjang (MKJP)',
    '2.14.04.2.01.0014': 'Penumbuhan dan Peningkatan Kesadaran Keluarga dalam Keterlibatan Perencanaan Kehidupan Menuju Keluarga Berkualitas',
    '2.14.04.2.02.0006': 'Pendampingan Keluarga Berisiko Stunting (Termasuk remaja Calon Pengantin/Calon PUS, Ibu Hamil, Pasca salin/kelahiran, Baduta/Balita)'
};

/**
 * Returns the Nama Sub Kegiatan based on the provided kode rekening.
 * @param {string} kodeRekening The account code
 * @returns {string} The Sub Kegiatan name
 */
export const getNamaSubKegiatanByKode = (kodeRekening) => {
    if (!kodeRekening) return '';
    const subKegiatanPrefix = kodeRekening.length >= 17 ? kodeRekening.substring(0, 17) : kodeRekening;
    return subKegiatanNameMapping[subKegiatanPrefix] || '';
};
