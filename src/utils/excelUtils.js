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
        'Tanggal (DD-MM-YYYY)': '',
        'Uraian': '',
        'Jumlah Realisasi': '' 
    }));

    // Define explicit headers to ensure they appear even if data is empty
    const headers = [
        'Kode Rekening',
        'Nama Belanja',
        'Tanggal (DD-MM-YYYY)',
        'Uraian',
        'Jumlah Realisasi'
    ];

    // Create worksheet with explicit headers
    const ws = XLSX.utils.json_to_sheet(data, { header: headers });

    // Set column widths
    ws['!cols'] = [
        { wch: 25 }, // Kode Rekening
        { wch: 40 }, // Nama Belanja
        { wch: 20 }, // Tanggal
        { wch: 40 }, // Uraian
        { wch: 20 }  // Jumlah Realisasi
    ];

    // Create instructions sheet
    const instructions = [
        ['INSTRUKSI PENGGUNAAN TEMPLATE IMPORT REALISASI'],
        [''],
        ['1. Isi kolom "Jumlah Realisasi" dengan nilai penambahan realisasi anggaran'],
        ['2. Isi kolom "Tanggal (DD-MM-YYYY)" dengan tanggal realisasi (opsional, default: hari ini)'],
        ['3. Isi kolom "Uraian" dengan rincian aktivitas (misal: "[-] Audit Maternal Perinatal")'],
        ['4. JANGAN ubah kolom "Kode Rekening" atau "Nama Belanja"'],
        ['5. Jumlah Realisasi harus berupa angka positif'],
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
                    .map((rawRow, index) => {
                        // Normalize keys (lowercase, trim spaces)
                        const row = {};
                        Object.keys(rawRow).forEach(k => {
                            if (k) {
                                row[k.toString().trim().toLowerCase()] = rawRow[k];
                            }
                        });

                        // Find realisasi value
                        const realisasiValue = row['jumlah realisasi'] || row['realisasi'] || row['jumlah'];
                        if (realisasiValue === undefined || realisasiValue === null || realisasiValue === '') {
                            return null;
                        }

                        // Clean up currency formatting (remove Rp, spaces, dots) and parse
                        let cleanStr = realisasiValue.toString().replace(/Rp/gi, '').replace(/\./g, '').replace(/,/g, '.').trim();
                        const parsedNum = parseFloat(cleanStr);
                        const finalRealisasi = isNaN(parsedNum) ? 0 : parsedNum;

                        let tanggalStr = new Date().toISOString().split('T')[0];
                        const rawTanggal = row['tanggal (dd-mm-yyyy)'] || row['tanggal'];
                        if (rawTanggal) {
                            const strDate = rawTanggal.toString().trim();
                            // Handle Excel serial date
                            if (!isNaN(strDate) && Number(strDate) > 20000) {
                                const dateObj = new Date(Math.round((Number(strDate) - 25569) * 86400 * 1000));
                                const d = dateObj.getDate().toString().padStart(2, '0');
                                const m = (dateObj.getMonth() + 1).toString().padStart(2, '0');
                                const y = dateObj.getFullYear();
                                tanggalStr = `${y}-${m}-${d}`;
                            } else {
                                const match = strDate.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
                                if (match) {
                                    const d = match[1].padStart(2, '0');
                                    const m = match[2].padStart(2, '0');
                                    const y = match[3];
                                    tanggalStr = `${y}-${m}-${d}`;
                                }
                            }
                        }

                        return {
                            rowNumber: index + 2,
                            kode_rekening: (row['kode rekening'] || '').toString().trim(),
                            nama_belanja: (row['nama belanja'] || '').toString().trim(),
                            realisasi: finalRealisasi,
                            tanggal: tanggalStr,
                            uraian: (row['uraian'] || 'Input Realisasi Excel').toString().trim()
                        };
                    })
                    .filter(item => item !== null && item.kode_rekening !== ''); // Remove null entries or empty codes

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

        // Validate date format if provided (DD-MM-YYYY or DD/MM/YYYY)
        if (item.tanggal) {
            // Because we already transformed it to YYYY-MM-DD in the parser, we just check if it's a valid date string
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(item.tanggal)) {
                validationErrors.push('Format tanggal tidak valid (gunakan DD-MM-YYYY)');
            }
        }

        if (validationErrors.length === 0) {
            valid.push({
                ...item,
                id_unik: belanjaItem.id_unik, // Include id_unik for backend
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
