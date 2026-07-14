const XLSX = require('xlsx');

try {
    const workbook = XLSX.readFile('LRA DINKES.xlsx');
    
    ['DINKES INDUK', 'SEKRETARIAT', 'YANKES', 'SDK', 'KESMAS', 'P2P', 'KB'].forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) return;
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        console.log(`Sheet: ${sheetName} -> Total rows: ${data.length}`);
    });
} catch (e) {
    console.error(e);
}
