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
    
    for (let i = 7; i < data.length; i++) {
        const row = data[i];
        const pagu = parseNumber(row[9]);
        if (pagu > 50000000000 && pagu < 1000000000000) { // > 50 Billion and < 1 Trillion
            console.log(`Row ${i}: A=${row[0]}, C=${row[2]}, D=${row[3]}, E=${row[4]}, Pagu=${pagu}`);
        }
    }
} catch (e) {
    console.error(e);
}
