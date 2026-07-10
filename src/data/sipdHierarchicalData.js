// SIPD Hierarchical Budget Data Structure
// Hierarchy: SKPD → BIDANG → Program → Kegiatan → Sub Kegiatan → Belanja
export const sipdHierarchicalData = [
  {
    id: 'skpd-1',
    name: 'Dinas Kesehatan, Pengendalian Penduduk dan KB',
    level: 'skpd',
    kode_rekening: '1.02.14.00.01.0000',
    pagu: 595465465420,
    realisasi: 145374016286,
    children: [
      {
        id: 'bidang-1',
        name: 'SEKRETARIAT',
        level: 'bidang',
        kode_rekening: '1.02.01',
        pagu: 132523863767,
        realisasi: 106366040050,
        monthly_targets: [10000000000, 10000000000, 12000000000, 11000000000, 10000000000, 10000000000, 12000000000, 11000000000, 10000000000, 10000000000, 12000000000, 14523863767],
        monthly_realization: [9000000000, 9500000000, 11000000000, 10500000000, 9000000000, 9800000000, 11500000000, 10000000000, 9000000000, 9500000000, 7566040050, 0],
        children: [
          {
            id: 'program-1',
            name: 'PROGRAM PENUNJANG URUSAN PEMERINTAHAN DAERAH KABUPATEN/KOTA',
            level: 'program',
            kode_rekening: '1.02.01',
            pagu: 132523863767,
            realisasi: 106366040050,
            children: [
              {
                id: 'kegiatan-1',
                name: 'Perencanaan, Penganggaran, dan Evaluasi Kinerja Perangkat Daerah',
                level: 'kegiatan',
                kode_rekening: '1.02.01.2.01',
                pagu: 59041300,
                realisasi: 53590750,
                children: [
                  {
                    id: 'sub-kegiatan-1',
                    name: 'Penyusunan Dokumen Perencanaan Perangkat Daerah',
                    level: 'sub_kegiatan',
                    kode_rekening: '1.02.01.2.01.0001',
                    pagu: 24295000,
                    realisasi: 21505750,
                    children: [
                      {
                        id: 'belanja-1',
                        name: 'Belanja Alat/Bahan Untuk Kegiatan Kantor-Alat Tulis Kantor',
                        level: 'belanja',
                        kode_rekening: '5.1.02.01.01.0025',
                        pagu: 561600,
                        realisasi: 0
                      },
                      {
                        id: 'belanja-2',
                        name: 'Belanja Alat/Bahan Untuk Kegiatan Kantor-Kertas',
                        level: 'belanja',
                        kode_rekening: '5.1.02.01.01.0026',
                        pagu: 1200000,
                        realisasi: 0
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'bidang-2',
        name: 'YANKES',
        level: 'bidang',
        kode_rekening: '1.02.02',
        pagu: 121342577570,
        realisasi: 55321926117,
        monthly_targets: [10000000000, 10000000000, 10000000000, 10000000000, 10000000000, 10000000000, 10000000000, 10000000000, 10000000000, 10000000000, 10000000000, 11342577570],
        monthly_realization: [8000000000, 9000000000, 8500000000, 9000000000, 8000000000, 8500000000, 4321926117, 0, 0, 0, 0, 0],
        children: [
          {
            id: 'program-2',
            name: 'PROGRAM PEMENUHAN UPAYA KESEHATAN PERORANGAN DAN UPAYA KESEHATAN MASYARAKAT',
            level: 'program',
            kode_rekening: '1.02.02',
            pagu: 121342577570,
            realisasi: 55321926117,
            children: [
              {
                id: 'kegiatan-2',
                name: 'Penyediaan Fasilitas Pelayanan Kesehatan Tingkat Pertama bagi Masyarakat',
                level: 'kegiatan',
                kode_rekening: '1.02.02.2.01',
                pagu: 26700473029,
                realisasi: 10233955445,
                children: [
                  {
                    id: 'sub-kegiatan-2',
                    name: 'Pembangunan Puskesmas',
                    level: 'sub_kegiatan',
                    kode_rekening: '1.02.02.2.01.0002',
                    pagu: 10499999914,
                    realisasi: 0,
                    children: [
                      {
                        id: 'belanja-3',
                        name: 'Belanja Alat/Bahan Untuk Kegiatan Kantor-Alat Tulis Kantor',
                        level: 'belanja',
                        kode_rekening: '5.1.02.01.01.0025',
                        pagu: 561600,
                        realisasi: 0
                      }
                    ]
                  },
                  {
                    id: 'sub-kegiatan-3',
                    name: 'Pengadaan Peralatan Medis',
                    level: 'sub_kegiatan',
                    kode_rekening: '1.02.02.2.01.0003',
                    pagu: 8500000000,
                    realisasi: 3200000000,
                    children: [
                      {
                        id: 'belanja-4',
                        name: 'Belanja Modal Peralatan dan Mesin-Alat Kedokteran',
                        level: 'belanja',
                        kode_rekening: '5.2.03.28.01.0001',
                        pagu: 5000000000,
                        realisasi: 2000000000
                      },
                      {
                        id: 'belanja-5',
                        name: 'Belanja Modal Peralatan dan Mesin-Alat Kesehatan Umum',
                        level: 'belanja',
                        kode_rekening: '5.2.03.28.02.0001',
                        pagu: 3500000000,
                        realisasi: 1200000000
                      }
                    ]
                  }
                ]
              },
              {
                id: 'kegiatan-3',
                name: 'Penyelenggaraan Pelayanan Kesehatan Rujukan',
                level: 'kegiatan',
                kode_rekening: '1.02.02.2.02',
                pagu: 45000000000,
                realisasi: 25000000000,
                children: [
                  {
                    id: 'sub-kegiatan-4',
                    name: 'Pelayanan Kesehatan Rujukan Tingkat Lanjutan',
                    level: 'sub_kegiatan',
                    kode_rekening: '1.02.02.2.02.0001',
                    pagu: 25000000000,
                    realisasi: 15000000000,
                    children: [
                      {
                        id: 'belanja-6',
                        name: 'Belanja Jasa Pelayanan Kesehatan',
                        level: 'belanja',
                        kode_rekening: '5.1.02.03.01.0001',
                        pagu: 20000000000,
                        realisasi: 12000000000
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'bidang-3',
        name: 'P2P',
        level: 'bidang',
        kode_rekening: '1.02.03',
        pagu: 89500000000,
        realisasi: 45000000000,
        children: [
          {
            id: 'program-3',
            name: 'PROGRAM PENCEGAHAN DAN PENGENDALIAN PENYAKIT',
            level: 'program',
            kode_rekening: '1.02.03',
            pagu: 89500000000,
            realisasi: 45000000000,
            children: [
              {
                id: 'kegiatan-4',
                name: 'Pencegahan dan Pengendalian Penyakit Menular',
                level: 'kegiatan',
                kode_rekening: '1.02.03.2.01',
                pagu: 50000000000,
                realisasi: 25000000000,
                children: [
                  {
                    id: 'sub-kegiatan-5',
                    name: 'Imunisasi Rutin',
                    level: 'sub_kegiatan',
                    kode_rekening: '1.02.03.2.01.0001',
                    pagu: 30000000000,
                    realisasi: 18000000000,
                    children: [
                      {
                        id: 'belanja-7',
                        name: 'Belanja Vaksin dan Serum',
                        level: 'belanja',
                        kode_rekening: '5.1.02.02.03.0001',
                        pagu: 25000000000,
                        realisasi: 15000000000
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'bidang-4',
        name: 'KESMAS',
        level: 'bidang',
        kode_rekening: '1.02.04',
        pagu: 50000000000,
        realisasi: 20000000000,
        children: [
          {
            id: 'program-4',
            name: 'PROGRAM PEMBERDAYAAN MASYARAKAT BIDANG KESEHATAN',
            level: 'program',
            kode_rekening: '1.02.04',
            pagu: 50000000000,
            realisasi: 20000000000,
            children: [
              {
                id: 'kegiatan-5',
                name: 'Pemberdayaan Masyarakat di Bidang Kesehatan',
                level: 'kegiatan',
                kode_rekening: '1.02.04.2.01',
                pagu: 30000000000,
                realisasi: 15000000000,
                children: [
                  {
                    id: 'sub-kegiatan-6',
                    name: 'Pengembangan Desa Siaga Aktif',
                    level: 'sub_kegiatan',
                    kode_rekening: '1.02.04.2.01.0001',
                    pagu: 20000000000,
                    realisasi: 10000000000,
                    children: [
                      {
                        id: 'belanja-8',
                        name: 'Belanja Bantuan Sosial',
                        level: 'belanja',
                        kode_rekening: '5.1.04.01.01.0001',
                        pagu: 15000000000,
                        realisasi: 8000000000
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'bidang-5',
        name: 'SDK',
        level: 'bidang',
        kode_rekening: '1.02.05',
        pagu: 40000000000,
        realisasi: 18000000000,
        children: [
          {
            id: 'program-5',
            name: 'PROGRAM SEDIAAN FARMASI, ALAT KESEHATAN DAN MAKANAN MINUMAN',
            level: 'program',
            kode_rekening: '1.02.05',
            pagu: 40000000000,
            realisasi: 18000000000,
            children: [
              {
                id: 'kegiatan-6',
                name: 'Pengawasan dan Pengendalian Obat dan Makanan',
                level: 'kegiatan',
                kode_rekening: '1.02.05.2.01',
                pagu: 25000000000,
                realisasi: 12000000000,
                children: [
                  {
                    id: 'sub-kegiatan-7',
                    name: 'Pengawasan Obat dan Makanan',
                    level: 'sub_kegiatan',
                    kode_rekening: '1.02.05.2.01.0001',
                    pagu: 15000000000,
                    realisasi: 8000000000,
                    children: [
                      {
                        id: 'belanja-9',
                        name: 'Belanja Pengadaan Obat',
                        level: 'belanja',
                        kode_rekening: '5.1.02.02.01.0001',
                        pagu: 10000000000,
                        realisasi: 6000000000
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'bidang-6',
        name: 'KB',
        level: 'bidang',
        kode_rekening: '1.02.06',
        pagu: 35000000000,
        realisasi: 16000000000,
        children: [
          {
            id: 'program-6',
            name: 'PROGRAM PENGENDALIAN PENDUDUK',
            level: 'program',
            kode_rekening: '1.02.06',
            pagu: 35000000000,
            realisasi: 16000000000,
            children: [
              {
                id: 'kegiatan-7',
                name: 'Pelayanan Keluarga Berencana',
                level: 'kegiatan',
                kode_rekening: '1.02.06.2.01',
                pagu: 20000000000,
                realisasi: 10000000000,
                children: [
                  {
                    id: 'sub-kegiatan-8',
                    name: 'Penyediaan Alat Kontrasepsi',
                    level: 'sub_kegiatan',
                    kode_rekening: '1.02.06.2.01.0001',
                    pagu: 12000000000,
                    realisasi: 7000000000,
                    children: [
                      {
                        id: 'belanja-10',
                        name: 'Belanja Alat Kontrasepsi',
                        level: 'belanja',
                        kode_rekening: '5.1.02.02.04.0001',
                        pagu: 10000000000,
                        realisasi: 6000000000
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

// Helper function to flatten the hierarchical data for search
export const flattenSipdData = (data, result = []) => {
  data.forEach(item => {
    result.push(item);
    if (item.children) {
      flattenSipdData(item.children, result);
    }
  });
  return result;
};

// Helper function to find a node by ID
export const findSipdNodeById = (data, targetId) => {
  for (const item of data) {
    if (item.id === targetId) {
      return item;
    }
    if (item.children) {
      const found = findSipdNodeById(item.children, targetId);
      if (found) return found;
    }
  }
  return null;
};

// Helper function to get the path to a node
export const getSipdPathToNode = (data, targetId, currentPath = []) => {
  for (const item of data) {
    const newPath = [...currentPath, item];

    if (item.id === targetId) {
      return newPath;
    }

    if (item.children) {
      const found = getSipdPathToNode(item.children, targetId, newPath);
      if (found) return found;
    }
  }
  return null;
};
