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
    const sheetName = 'DINKES INDUK'; // DINKES INDUK has everything
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    let sumAllSekretariat = 0;
    let sumAllYankes = 0;
    
    for (let i = 7; i < 1054; i++) { // up to 1053 (the last data row)
        const row = data[i];
        const pagu = parseNumber(row[9]);
        const bidang = row[row.length - 1]; // last column
        
        if (typeof bidang === 'string') {
            if (bidang.trim() === 'SEKRETARIAT') {
                sumAllSekretariat += pagu;
            } else if (bidang.trim() === 'YANKES') {
                sumAllYankes += pagu;
            }
        }
    }
    
    console.log(`Sum of ALL rows with Bidang=SEKRETARIAT: ${sumAllSekretariat}`);
    console.log(`Sum of ALL rows with Bidang=YANKES: ${sumAllYankes}`);
    
    // Also, what is the sum of ALL rows (no filter)?
    let sumAll = 0;
    for (let i = 7; i < 1054; i++) {
        sumAll += parseNumber(data[i][9]);
    }
    console.log(`Sum of ALL rows (no filter): ${sumAll}`);

} catch (e) {
    console.error(e);
}
