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
    const sheetName = 'DINKES INDUK';
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    const sums = {};
    
    for (let i = 7; i < 1054; i++) {
        const row = data[i];
        let isLeaf = false;
        
        if (row[3] && row[3].toString().startsWith('5.')) {
            const parts = row[3].toString().trim().split('.');
            if (parts.length >= 6) {
                isLeaf = true;
            }
        }
        
        if (isLeaf) {
            const pagu = parseNumber(row[9]);
            let bidang = row[row.length - 1];
            if (typeof bidang !== 'string' || bidang.trim() === '') {
                bidang = 'UNKNOWN';
            } else {
                bidang = bidang.trim();
            }
            
            if (!sums[bidang]) sums[bidang] = 0;
            sums[bidang] += pagu;
        }
    }
    
    console.log("Leaf node sums by Bidang:");
    for (const [bidang, sum] of Object.entries(sums)) {
        console.log(`${bidang}: ${sum}`);
    }
    
} catch (e) {
    console.error(e);
}
