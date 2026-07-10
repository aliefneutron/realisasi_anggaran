import * as XLSX from 'xlsx';

/**
 * Generate Excel template for realization input
 * @param {Array} belanjaList - List of belanja items
 * @param {String} subKegiatanName - Name of sub kegiatan
 * @returns {Blob} Excel file blob
 */
export const generateRealizationTemplate = (belanjaList, subKegiatanName = '') => {
    // Prepare data for Excel
    const data = belanjaList.map(belanja => ({
        'Kode Rekening': belanja.kode_rekening,
        'Nama Belanja': belanja.name,
        'Pagu': belanja.pagu,
        'Realisasi': '', // Empty for user to fill
        'Tanggal': '' // Optional
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // Set column widths
    ws['!cols'] = [
        { wch: 20 }, // Kode Rekening
        { wch: 40 }, // Nama Belanja
        { wch: 15 }, // Pagu
        { wch: 15 }, // Realisasi
        { wch: 12 }  // Tanggal
    ];

    // Create instructions sheet
    const instructions = [
        ['INSTRUKSI PENGGUNAAN TEMPLATE IMPORT REALISASI'],
        [''],
        ['1. Isi kolom "Realisasi" dengan nilai realisasi anggaran'],
        ['2. Kolom "Tanggal" bersifat opsional (format: DD/MM/YYYY)'],
        ['3. JANGAN ubah kolom "Kode Rekening", "Nama Belanja", atau "Pagu"'],
        ['4. Realisasi tidak boleh melebihi Pagu'],
        ['5. Realisasi harus berupa angka positif'],
        ['6. Simpan file dan upload kembali ke sistem'],
        [''],
        ['CATATAN:'],
        ['- Baris yang kosong (tanpa realisasi) akan diabaikan'],
        ['- Data yang tidak valid akan ditampilkan di preview sebelum import'],
        ['- Hanya data yang valid yang akan disimpan'],
        [''],
        [`Sub Kegiatan: ${subKegiatanName}`],
        [`Jumlah Item: ${belanjaList.length}`]
    ];

    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
    wsInstructions['!cols'] = [{ wch: 80 }];

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Realisasi');
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instruksi');

    // Generate Excel file
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });

    return blob;
};

/**
 * Download Excel template
 * @param {Blob} blob - Excel file blob
 * @param {String} filename - Filename for download
 */
export const downloadExcelTemplate = (blob, filename = 'Template_Realisasi.xlsx') => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

/**
 * Parse uploaded Excel file
 * @param {File} file - Excel file
 * @returns {Promise<Array>} Parsed data
 */
export const parseRealizationExcel = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Get first sheet (Data Realisasi)
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                // Parse and clean data
                const parsedData = jsonData
                    .map((row, index) => {
                        // Skip rows without realisasi
                        if (!row['Realisasi'] || row['Realisasi'] === '') {
                            return null;
                        }

                        return {
                            rowNumber: index + 2, // +2 because Excel is 1-indexed and has header
                            kode_rekening: row['Kode Rekening']?.toString().trim(),
                            nama_belanja: row['Nama Belanja']?.toString().trim(),
                            pagu: parseFloat(row['Pagu']) || 0,
                            realisasi: parseFloat(row['Realisasi']) || 0,
                            tanggal: row['Tanggal']?.toString().trim() || null
                        };
                    })
                    .filter(item => item !== null); // Remove null entries

                resolve(parsedData);
            } catch (error) {
                reject(new Error('Gagal membaca file Excel. Pastikan format file benar.'));
            }
        };

        reader.onerror = () => {
            reject(new Error('Gagal membaca file.'));
        };

        reader.readAsArrayBuffer(file);
    });
};

/**
 * Validate imported realization data
 * @param {Array} importedData - Data from Excel
 * @param {Array} belanjaList - List of valid belanja items
 * @returns {Object} { valid: [], errors: [] }
 */
export const validateRealizationData = (importedData, belanjaList) => {
    const valid = [];
    const errors = [];

    // Create lookup map for faster validation
    const belanjaMap = new Map(
        belanjaList.map(item => [item.kode_rekening, item])
    );

    importedData.forEach(item => {
        const validationErrors = [];

        // Check if kode rekening exists
        const belanjaItem = belanjaMap.get(item.kode_rekening);
        if (!belanjaItem) {
            validationErrors.push(`Kode rekening ${item.kode_rekening} tidak ditemukan`);
        }

        // Check if realisasi is valid number
        if (isNaN(item.realisasi)) {
            validationErrors.push('Realisasi harus berupa angka');
        }

        // Check if realisasi is positive
        if (item.realisasi < 0) {
            validationErrors.push('Realisasi tidak boleh negatif');
        }

        // Check if realisasi doesn't exceed pagu
        if (belanjaItem && item.realisasi > belanjaItem.pagu) {
            validationErrors.push(
                `Realisasi Rp${item.realisasi.toLocaleString('id-ID')} melebihi Pagu Rp${belanjaItem.pagu.toLocaleString('id-ID')}`
            );
        }

        // Validate date format if provided
        if (item.tanggal) {
            const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
            if (!dateRegex.test(item.tanggal)) {
                validationErrors.push('Format tanggal tidak valid (gunakan DD/MM/YYYY)');
            }
        }

        if (validationErrors.length === 0) {
            valid.push({
                ...item,
                belanjaId: belanjaItem.id,
                belanja: belanjaItem
            });
        } else {
            errors.push({
                ...item,
                errors: validationErrors
            });
        }
    });

    return { valid, errors };
};

/**
 * Format validation result for display
 * @param {Object} validationResult - Result from validateRealizationData
 * @returns {Object} Formatted summary
 */
export const formatValidationSummary = (validationResult) => {
    const { valid, errors } = validationResult;

    return {
        totalItems: valid.length + errors.length,
        validCount: valid.length,
        errorCount: errors.length,
        totalRealisasi: valid.reduce((sum, item) => sum + item.realisasi, 0),
        hasErrors: errors.length > 0
    };
};
