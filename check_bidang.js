const XLSX = require('xlsx');

try {
    const workbook = XLSX.readFile('LRA DINKES.xlsx');
    const sheetName = 'DINKES INDUK';
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    const bidangs = new Set();
    
    for (let i = 7; i < data.length; i++) {
        const row = data[i];
        const lastCol = row[row.length - 1];
        if (typeof lastCol === 'string' && lastCol.trim() !== '') {
            bidangs.add(lastCol.trim());
        }
    }
    console.log("Found Bidangs in last column:", Array.from(bidangs));
    
} catch (e) {
    console.error(e);
}
