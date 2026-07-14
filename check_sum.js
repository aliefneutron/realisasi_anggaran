const XLSX = require('xlsx');

const parseNumber = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    let str = val.toString().trim();
    if (str === '-' || str === '') return 0;
    if (str.includes(',') || str.includes('.')) {
        str = str.replace(/\./g, '').replace(/,/g, '.');
    }
    return parseFloat(str) || 0;
};

try {
    const workbook = XLSX.readFile('LRA DINKES.xlsx');
    
    ['SEKRETARIAT', 'YANKES', 'SDK', 'KESMAS', 'P2P', 'KB'].forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) return;
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        let sumPagu = 0;
        let sumRealisasi = 0;
        
        for (let i = 7; i < data.length; i++) {
            const row = data[i];
            
            let kode_rekening = '';
            let isLeaf = false;

            if (row[3] && row[3].toString().startsWith('5.')) {
                kode_rekening = row[3].toString().trim();
                const parts = kode_rekening.split('.');
                // Check if it's the most granular belanja
                // In my DB, I used parts.length >= 6 as 'belanja' (leaf node)
                if (parts.length >= 6) {
                    isLeaf = true;
                }
            }
            
            if (isLeaf) {
                sumPagu += parseNumber(row[9]);
                sumRealisasi += parseNumber(row[10]);
            }
        }
        console.log(`Sheet: ${sheetName} -> Sum Pagu: ${sumPagu}, Sum Realisasi: ${sumRealisasi}`);
    });
} catch (e) {
    console.error(e);
}
