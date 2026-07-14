import * as XLSX from 'xlsx';
import { getBidangByKodeRekening } from './bidangMapping';

// Helper functions for budget calculations and formatting

/**
 * Format currency to Indonesian Rupiah
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'Rp. 0';

  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  // The default format is 'Rp123.456.789', so we replace 'Rp' with 'Rp. '
  return formatted.replace('Rp', 'Rp. ');
};



/**
 * Calculate remaining budget
 * @param {number} pagu - Budget allocation
 * @param {number} realisasi - Actual spending
 * @returns {number} Remaining budget
 */
export const calculateSisa = (pagu, realisasi) => {
  return (pagu || 0) - (realisasi || 0);
};

/**
 * Calculate realization percentage
 * @param {number} realisasi - Actual spending
 * @param {number} pagu - Budget allocation
 * @returns {number} Percentage (0-100+)
 */
export const calculatePercentage = (realisasi, pagu) => {
  if (!pagu || pagu === 0) return 0;
  return ((realisasi || 0) / pagu) * 100;
};

/**
 * Get status based on realization percentage
 * @param {number} percentage - Realization percentage
 * @returns {string} Status: 'on-track', 'over-budget', 'under-budget'
 */
export const getStatus = (percentage) => {
  if (percentage > 100) return 'over-budget';
  if (percentage >= 80) return 'on-track';
  return 'under-budget';
};

/**
 * Get status label in Indonesian
 * @param {string} status - Status code
 * @returns {string} Indonesian status label
 */
export const getStatusLabel = (status) => {
  const labels = {
    'on-track': 'Sesuai Target',
    'over-budget': 'Melebihi Anggaran',
    'under-budget': 'Di Bawah Target'
  };
  return labels[status] || 'Unknown';
};

/**
 * Get status color
 * @param {string} status - Status code
 * @returns {string} Color code
 */
export const getStatusColor = (status) => {
  const colors = {
    'on-track': '#52c41a',
    'over-budget': '#ff4d4f',
    'under-budget': '#1890ff'
  };
  return colors[status] || '#666';
};

/**
 * Process raw budget data and add calculated fields
 * @param {Array} rawData - Raw budget data from API
 * @returns {Array} Processed data with calculated fields
 */
export const processBudgetData = (rawData) => {
  if (!Array.isArray(rawData)) return [];
  
  const nodeMap = {};
  const childrenMap = {};
  
  // 1. Initialize node map and children mapping
  rawData.forEach((item, index) => {
    nodeMap[item.id_unik] = {
      ...item,
      id: item.id || index + 1,
      pagu: parseFloat(item.pagu) || 0,
      realisasi: parseFloat(item.realisasi) || 0
    };
    if (!childrenMap[item.id_unik]) {
      childrenMap[item.id_unik] = [];
    }
    if (item.parent_id_unik) {
      if (!childrenMap[item.parent_id_unik]) {
        childrenMap[item.parent_id_unik] = [];
      }
      childrenMap[item.parent_id_unik].push(item.id_unik);
    }
  });

  // 2. Recursive function to calculate sums from bottom up
  const aggregate = (nodeId) => {
    const node = nodeMap[nodeId];
    if (!node) return { pagu: 0, realisasi: 0 };
    
    const childrenIds = childrenMap[nodeId] || [];
    
    if (childrenIds.length > 0) {
      let sumPagu = 0;
      let sumRealisasi = 0;
      
      childrenIds.forEach(childId => {
        const { pagu, realisasi } = aggregate(childId);
        sumPagu += pagu;
        sumRealisasi += realisasi;
      });
      
      // Override parent's value with the sum of its children's values
      node.pagu = sumPagu;
      node.realisasi = sumRealisasi;
    }
    
    return { pagu: node.pagu, realisasi: node.realisasi };
  };

  // Find all nodes that are not children of anyone else (roots)
  const allChildIds = new Set();
  Object.values(childrenMap).forEach(children => {
    children.forEach(id => allChildIds.add(id));
  });
  
  const rootIds = rawData
    .filter(item => !allChildIds.has(item.id_unik))
    .map(item => item.id_unik);
    
  // 3. Trigger aggregation from roots
  rootIds.forEach(rootId => {
    aggregate(rootId);
  });
  
  // 4. Return processed items with calculated statuses
  return Object.values(nodeMap).map(node => {
    const sisa = calculateSisa(node.pagu, node.realisasi);
    const percentage = calculatePercentage(node.realisasi, node.pagu);
    const status = getStatus(percentage);
    
    return {
      ...node,
      sisa,
      percentage: Math.round(percentage * 100) / 100,
      status,
      statusLabel: getStatusLabel(status),
      statusColor: getStatusColor(status)
    };
  });
};

/**
 * Calculate summary statistics
 * @param {Array} data - Processed budget data
 * @returns {Object} Summary statistics
 */
export const calculateSummary = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return {
      totalPagu: 0,
      totalRealisasi: 0,
      totalSisa: 0,
      averagePercentage: 0,
      totalKegiatan: 0,
      onTrackCount: 0,
      overBudgetCount: 0,
      underBudgetCount: 0
    };
  }
  // The user requested to ONLY sum "Detail Belanja" (kode rekening 14-15 digit, level: 'belanja')
  // We filter out all other levels so they are not included in the total card calculation.
  const leafNodes = data.filter(item => item.level === 'belanja');
  const dataToSum = leafNodes.length > 0 ? leafNodes : data;
  
  const totalPagu = dataToSum.reduce((sum, item) => sum + (item.pagu || 0), 0);
  const totalRealisasi = dataToSum.reduce((sum, item) => sum + (item.realisasi || 0), 0);
  const totalSisa = totalPagu - totalRealisasi;
  const averagePercentage = totalPagu > 0 ? (totalRealisasi / totalPagu) * 100 : 0;
  
  const statusCounts = data.reduce((counts, item) => {
    counts[item.status] = (counts[item.status] || 0) + 1;
    return counts;
  }, {});
  
  return {
    totalPagu,
    totalRealisasi,
    totalSisa,
    averagePercentage: Math.round(averagePercentage * 100) / 100,
    totalKegiatan: data.length,
    onTrackCount: statusCounts['on-track'] || 0,
    overBudgetCount: statusCounts['over-budget'] || 0,
    underBudgetCount: statusCounts['under-budget'] || 0
  };
};

/**
 * Filter data based on criteria and calculate dynamic realization based on semester
 * @param {Array} data - Data to filter
 * @param {Object} filters - Filter criteria
 * @param {Array} historyData - Realization history data for dynamic calculation
 * @returns {Array} Filtered data
 */
export const filterData = (data, filters, historyData = []) => {
  if (!Array.isArray(data)) return [];
  
  // Create a map of id_unik -> dynamically calculated realisasi
  const realizationMap = {};
  
  const hasTimeFilter = (filters.semester && filters.semester !== 'all') || (filters.bulan && filters.bulan !== 'all');
  
  if (historyData && historyData.length > 0 && hasTimeFilter) {
    // Build a lookup for parent tracking using id_unik
    const parentMap = {};
    data.forEach(item => {
      parentMap[item.id_unik] = item.parent_id_unik;
    });

    historyData.forEach(record => {
      if (!record.tanggal) return;
      const month = new Date(record.tanggal).getMonth(); // 0-indexed (Jan=0, Dec=11)
      
      let includeRecord = false;
      
      if (filters.bulan && filters.bulan !== 'all') {
        includeRecord = (month === parseInt(filters.bulan, 10));
      } else if (filters.semester === 'Semester 1') {
        includeRecord = month < 6; // Jan - Jun
      } else if (filters.semester === 'Semester 2') {
        includeRecord = true; // Jan - Dec (cumulative)
      }
      
      if (includeRecord) {
        let currentId = record.id_unik;
        const amount = parseFloat(record.jumlah_realisasi) || 0;
        
        // Traverse up the tree using parentMap to aggregate totals for parent nodes
        while (currentId) {
          if (!realizationMap[currentId]) {
            realizationMap[currentId] = 0;
          }
          realizationMap[currentId] += amount;
          
          currentId = parentMap[currentId]; // Move to parent
        }
      }
    });
  }
  
  return data.map(item => {
    let newItem = { ...item };
    
    // If time filter is active and it's a SPECIFIC month, we could use history.
    // However, the user clarified that Column K (base item.realisasi) is the data up to June.
    // So we will just use the base item.pagu and item.realisasi directly for all Semester views.
    
    if (hasTimeFilter && filters.bulan && filters.bulan !== 'all') {
      const selectedMonth = parseInt(filters.bulan, 10);
      let newRealisasi = 0;
      
      // Kategori Semester 1 (Januari - Juni: 0 - 5)
      // Jika bulan masuk Semester 1 (atau sampai Juli sesuai request, kita set <= 6 atau < 6)
      // Karena user menyebut "masuk kategori semester 1", kita set < 6 (Jan-Jun)
      // Namun karena disebutkan "data realisasi sampai bulan juli", kita beri toleransi sampai Juli (6) jika diperlukan, 
      // tetapi untuk amannya kita patuhi "kategori semester 1" (0-5) dan tampilkan realisasi yang ada.
      if (selectedMonth < 6) {
        newRealisasi = item.realisasi;
      } else {
        newRealisasi = 0; // Semester 2 dikosongkan
      }
      
      const newSisa = calculateSisa(item.pagu, newRealisasi);
      const newPercentage = calculatePercentage(newRealisasi, item.pagu);
      const newStatus = getStatus(newPercentage);
      
      newItem = {
        ...newItem,
        realisasi: newRealisasi,
        sisa: newSisa,
        percentage: Math.round(newPercentage * 100) / 100,
        status: newStatus,
        statusLabel: getStatusLabel(newStatus),
        statusColor: getStatusColor(newStatus)
      };
    }
    
    return newItem;
  }).filter(item => {
    // Bidang filter
    if (filters.bidang && filters.bidang.length > 0) {
      if (!filters.bidang.includes(item.bidang)) return false;
    }
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const searchFields = [
        item.nama_kegiatan,
        item.kode_rekening,
        item.bidang
      ];
      
      const matchesSearch = searchFields.some(field => 
        field && field.toString().toLowerCase().includes(searchLower)
      );
      
      if (!matchesSearch) return false;
    }
    
    return true;
  });
};

/**
 * Group data by field
 * @param {Array} data - Data to group
 * @param {string} groupBy - Field to group by
 * @returns {Object} Grouped data
 */
export const groupData = (data, groupBy) => {
  if (!Array.isArray(data)) return {};
  
  return data.reduce((groups, item) => {
    const key = item[groupBy] || 'Unknown';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
};

/**
 * Generate chart data for visualization
 * @param {Array} data - Processed budget data
 * @param {string} groupBy - Field to group by ('bidang' or 'semester')
 * @returns {Object} Chart.js compatible data
 */
export const generateChartData = (data, groupBy = 'bidang') => {
  const grouped = groupData(data, groupBy);
  const labels = Object.keys(grouped);
  
  const paguData = labels.map(label => {
    return grouped[label].reduce((sum, item) => sum + (item.pagu || 0), 0);
  });
  
  const realisasiData = labels.map(label => {
    return grouped[label].reduce((sum, item) => sum + (item.realisasi || 0), 0);
  });
  
  return {
    labels,
    datasets: [
      {
        label: 'Pagu Anggaran',
        data: paguData,
        backgroundColor: 'rgba(24, 144, 255, 0.6)',
        borderColor: 'rgba(24, 144, 255, 1)',
        borderWidth: 1
      },
      {
        label: 'Realisasi',
        data: realisasiData,
        backgroundColor: 'rgba(82, 196, 26, 0.6)',
        borderColor: 'rgba(82, 196, 26, 1)',
        borderWidth: 1
      }
    ]
  };
};

/**
 * Export data to CSV format
 * @param {Array} data - Data to export
 * @param {string} filename - Filename for download
 */
/**
 * Export data to XLSX format
 * @param {Array} data - Data to export
 * @param {string} filename - Filename for download
 */
/**
 * Parses an XLSX file and converts it to a structured JSON array.
 * @param {File} file - The file to parse.
 * @returns {Promise<Array>} A promise that resolves with the parsed data.
 */
export const parseXLSXFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        if (json.length === 0) {
          return reject(new Error('File XLSX kosong atau format tidak sesuai.'));
        }

        // Validate header
        const requiredHeaders = ['Nama Kegiatan', 'Kode Rekening', 'Pagu', 'Realisasi', 'Semester', 'Bidang'];
        const fileHeaders = Object.keys(json[0]);
        const missingHeaders = requiredHeaders.filter(h => !fileHeaders.includes(h));

        if (missingHeaders.length > 0) {
          return reject(new Error(`Header kolom tidak sesuai. Kolom yang hilang: ${missingHeaders.join(', ')}`));
        }

        // Map to application's data structure
        const parsedData = json.map((row, index) => {
          const kodeRekening = row['Kode Rekening'];
          const determinedBidang = getBidangByKodeRekening(kodeRekening);
          return {
            id: `imported-${Date.now()}-${index}`, // Temporary unique ID
            nama_kegiatan: row['Nama Kegiatan'],
            kode_rekening: kodeRekening,
            pagu: parseFloat(row['Pagu']) || 0,
            realisasi: parseFloat(row['Realisasi']) || 0,
            semester: row['Semester'],
            bidang: determinedBidang !== 'Umum' ? determinedBidang : (row['Bidang'] || 'Umum'),
          };
        });

        resolve(parsedData);
      } catch (error) {
        reject(new Error('Gagal memproses file XLSX. Pastikan format file benar.'));
      }
    };

    reader.onerror = (error) => {
      reject(new Error('Gagal membaca file: ' + error));
    };

    reader.readAsArrayBuffer(file);
  });
};

export const exportToXLSX = (data, filename = 'budget_data.xlsx') => {
  if (!Array.isArray(data) || data.length === 0) return;

  const headers = [
    'Semester',
    'Bidang',
    'Kode Rekening',
    'Nama Kegiatan',
    'Pagu',
    'Realisasi',
    'Sisa',
    'Persentase (%)',
    'Status'
  ];

  const dataForExport = data.map(row => ({
    'Semester': row.semester || '',
    'Bidang': row.bidang || '',
    'Kode Rekening': row.kode_rekening || '',
    'Nama Kegiatan': row.nama_kegiatan || '',
    'Pagu': row.pagu || 0,
    'Realisasi': row.realisasi || 0,
    'Sisa': row.sisa || 0,
    'Persentase (%)': row.percentage || 0,
    'Status': row.statusLabel || ''
  }));

  const ws = XLSX.utils.json_to_sheet(dataForExport, { header: headers });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data Anggaran');

  // Set column widths for better readability
  ws['!cols'] = [
    { wch: 15 }, // Semester
    { wch: 15 }, // Bidang
    { wch: 18 }, // Kode Rekening
    { wch: 40 }, // Nama Kegiatan
    { wch: 20 }, // Pagu
    { wch: 20 }, // Realisasi
    { wch: 20 }, // Sisa
    { wch: 15 }, // Persentase
    { wch: 20 }  // Status
  ];

  // Apply number formatting for currency columns
  dataForExport.forEach((_row, index) => {
    const rowIndex = index + 2; // +1 for header, +1 for 1-based index
    ['E', 'F', 'G'].forEach(col => {
      const cellRef = `${col}${rowIndex}`;
      if (ws[cellRef]) {
        ws[cellRef].z = '"Rp"#,##0';
      }
    });
  });

  XLSX.writeFile(wb, filename);
};

/**
 * Generate and download Realization Import Template
 */
export const exportRealizationTemplate = () => {
  const headers = [
    'Kode Rekening',
    'Tanggal (DD-MM-YYYY)',
    'Jumlah Realisasi'
  ];

  const data = [
    {
      'Kode Rekening': '1.02.01.2.01.0001.5.1.02.01.01.0004',
      'Tanggal (DD-MM-YYYY)': '15-07-2025',
      'Jumlah Realisasi': 1500000
    },
    {
      'Kode Rekening': '1.02.01.2.01.0001.5.1.02.01.01.0024',
      'Tanggal (DD-MM-YYYY)': '16-07-2025',
      'Jumlah Realisasi': 500000
    }
  ];

  const ws = XLSX.utils.json_to_sheet(data, { header: headers });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template Realisasi');

  ws['!cols'] = [
    { wch: 35 }, // Kode Rekening
    { wch: 25 }, // Tanggal
    { wch: 20 }, // Jumlah Realisasi
  ];

  XLSX.writeFile(wb, 'template_import_realisasi.xlsx');
};

/**
 * Parses a Realization XLSX file and converts it to a structured JSON array.
 * @param {File} file - The file to parse.
 * @returns {Promise<Array>} A promise that resolves with the parsed data.
 */
export const parseRealizationXLSXFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        if (json.length === 0) {
          return reject(new Error('File XLSX kosong atau format tidak sesuai.'));
        }

        // We flexibly check for required keys
        const requiredHeaders = ['Kode Rekening', 'Uraian', 'Jumlah Realisasi'];
        const fileHeaders = Object.keys(json[0]);
        
        // Let's do a more flexible matching for headers since users might slightly change them
        const findHeader = (target) => {
           return fileHeaders.find(h => h.toLowerCase().includes(target.toLowerCase()));
        };

        const kodeHeader = findHeader('Kode');
        const tanggalHeader = findHeader('Tanggal');
        const uraianHeader = findHeader('Uraian'); // Now optional
        const jumlahHeader = findHeader('Jumlah') || findHeader('Realisasi');

        if (!kodeHeader || !jumlahHeader) {
          return reject(new Error('Format kolom tidak sesuai. Pastikan ada kolom Kode Rekening dan Jumlah Realisasi.'));
        }

        // Map to standard structure
        const parsedData = json.map((row) => {
          let tanggalStr = new Date().toISOString().split('T')[0]; // Default today YYYY-MM-DD
          
          const rawDate = row[tanggalHeader];
          if (rawDate) {
             const strDate = rawDate.toString().trim();
             // Parse DD-MM-YYYY to YYYY-MM-DD
             const match = strDate.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
             if (match) {
                 const d = match[1].padStart(2, '0');
                 const m = match[2].padStart(2, '0');
                 const y = match[3];
                 tanggalStr = `${y}-${m}-${d}`;
             }
          }

          return {
            kode_rekening: row[kodeHeader]?.toString().trim(),
            tanggal: tanggalStr,
            uraian: (uraianHeader && row[uraianHeader]) ? row[uraianHeader].toString().trim() : 'Input Realisasi Excel',
            jumlah_realisasi: parseFloat(row[jumlahHeader]) || 0
          };
        }).filter(row => row.kode_rekening && row.jumlah_realisasi > 0);

        resolve(parsedData);
      } catch (error) {
        reject(new Error('Gagal memproses file XLSX. Pastikan format file benar.'));
      }
    };

    reader.onerror = (error) => {
      reject(new Error('Gagal membaca file: ' + error));
    };

    reader.readAsArrayBuffer(file);
  });
};

