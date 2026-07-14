const XLSX = require('xlsx');

try {
    const workbook = XLSX.readFile('LRA DINKES.xlsx');
    const sheetName = 'DINKES INDUK';
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    for (let i = 7; i < data.length; i++) {
        const row = data[i];
        if (row[0] && !row[0].toString().includes('.')) {
            // Top level Urusan (like '1', '2', '3', '4', '5', '6', '7')
            console.log(`Row ${i}: Kode=${row[0]}, Uraian=${row[4]}, Pagu=${row[9]}`);
        }
    }
} catch (e) {
    console.error(e);
}
