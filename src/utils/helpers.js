import * as XLSX from 'xlsx';

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
  
  return rawData.map((item, index) => {
    const pagu = parseFloat(item.pagu) || 0;
    const realisasi = parseFloat(item.realisasi) || 0;
    const sisa = calculateSisa(pagu, realisasi);
    const percentage = calculatePercentage(realisasi, pagu);
    const status = getStatus(percentage);
    
    return {
      ...item,
      id: item.id || index + 1,
      pagu,
      realisasi,
      sisa,
      percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
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
  
  const totalPagu = data.reduce((sum, item) => sum + (item.pagu || 0), 0);
  const totalRealisasi = data.reduce((sum, item) => sum + (item.realisasi || 0), 0);
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
 * Filter data based on criteria
 * @param {Array} data - Data to filter
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered data
 */
export const filterData = (data, filters) => {
  if (!Array.isArray(data)) return [];
  
  return data.filter(item => {
    // Semester filter
    if (filters.semester && filters.semester !== 'all') {
      if (item.semester !== filters.semester) return false;
    }
    
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
        const parsedData = json.map((row, index) => ({
          id: `imported-${Date.now()}-${index}`, // Temporary unique ID
          nama_kegiatan: row['Nama Kegiatan'],
          kode_rekening: row['Kode Rekening'],
          pagu: parseFloat(row['Pagu']) || 0,
          realisasi: parseFloat(row['Realisasi']) || 0,
          semester: row['Semester'],
          bidang: row['Bidang'],
        }));

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
