const XLSX = require('xlsx');

try {
    const workbook = XLSX.readFile('LRA DINKES.xlsx');
    
    ['DINKES INDUK', 'SEKRETARIAT'].forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) return;
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        console.log(`\n--- Sheet: ${sheetName} ---`);
        const row = data[1055];
        if (row) {
            console.log(row);
        }
    });
} catch (e) {
    console.error(e);
}
