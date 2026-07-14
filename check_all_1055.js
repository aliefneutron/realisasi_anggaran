const XLSX = require('xlsx');

try {
    const workbook = XLSX.readFile('LRA DINKES.xlsx');
    
    ['DINKES INDUK', 'SEKRETARIAT', 'YANKES', 'SDK', 'KESMAS', 'P2P', 'KB'].forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) return;
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const row = data[1055];
        if (row && row[9]) {
            console.log(`Sheet: ${sheetName}, Row 1055 Grand Total Pagu: ${row[9]}`);
        }
    });
} catch (e) {
    console.error(e);
}
