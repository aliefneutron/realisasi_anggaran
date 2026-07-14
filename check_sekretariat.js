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
    
    let sumSekretariat = 0;
    
    for (let i = 7; i < 1054; i++) {
        const row = data[i];
        let bidang = row[row.length - 1];
        if (typeof bidang === 'string' && bidang.trim() === 'SEKRETARIAT') {
            sumSekretariat += parseNumber(row[9]);
        }
    }
    console.log("Total for SEKRETARIAT:", sumSekretariat);
} catch (e) {
    console.error(e);
}
