const XLSX = require('xlsx');

try {
    const workbook = XLSX.readFile('LRA DINKES.xlsx');
    const sheetName = 'DINKES INDUK';
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    let sum5Parts = 0;
    
    for (let i = 7; i < data.length; i++) {
        const row = data[i];
        if (row[3] && row[3].toString().startsWith('5.')) {
            const kode = row[3].toString().trim();
            const parts = kode.split('.');
            if (parts.length === 5) {
                // check if the next row is a child of this one
                const nextRow = data[i+1];
                let hasChild = false;
                if (nextRow && nextRow[3] && nextRow[3].toString().startsWith(kode + '.')) {
                    hasChild = true;
                }
                
                if (!hasChild) {
                    console.log(`Leaf node with 5 parts found: ${kode}, Pagu=${row[9]}`);
                    const val = parseFloat(row[9].toString().replace(/\./g, '').replace(/,/g, '.')) || 0;
                    sum5Parts += val;
                }
            }
        }
    }
    console.log("Total Pagu of 5-part leaf nodes:", sum5Parts);
} catch (e) {
    console.error(e);
}
