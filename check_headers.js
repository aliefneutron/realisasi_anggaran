const XLSX = require('xlsx');

try {
    const workbook = XLSX.readFile('LRA DINKES.xlsx');
    const sheetName = workbook.SheetNames[0]; 
    const worksheet = workbook.Sheets[sheetName];
    
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    for (let i = 12; i < 20; i++) {
        const row = data[i];
        let level = 'unknown';
        let kode_rekening = '';
        let parent_kode = null;

        if (row[3] && row[3].toString().startsWith('5.')) {
            kode_rekening = row[3].toString().trim();
            const parts = kode_rekening.split('.');
            if (parts.length === 3) { 
                level = 'belanja_jenis';
                parent_kode = row[2] ? row[2].toString().trim() : null; 
            } else if (parts.length === 4) { 
                level = 'belanja_objek';
                parent_kode = parts.slice(0, 3).join('.'); 
            } else if (parts.length === 5) { 
                level = 'belanja_rincian_objek';
                parent_kode = parts.slice(0, 4).join('.');
            } else if (parts.length === 6) { 
                level = 'belanja';
                parent_kode = parts.slice(0, 5).join('.');
            }
        } else if (row[2]) {
            const parts = row[2].toString().trim().split('.');
            kode_rekening = row[2].toString().trim();
            if (parts.length === 3) {
                level = 'program';
            } else if (parts.length === 5) {
                level = 'kegiatan';
                parent_kode = parts.slice(0, 3).join('.');
            } else if (parts.length === 6) {
                level = 'sub_kegiatan';
                parent_kode = parts.slice(0, 5).join('.');
            }
        }
        
        console.log(`Row ${i} - Kode: ${kode_rekening}, Level: ${level}, Parent: ${parent_kode}`);
    }
} catch (e) {
    console.error(e);
}
