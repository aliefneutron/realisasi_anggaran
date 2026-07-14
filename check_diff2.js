const XLSX = require('xlsx');

try {
    const workbook = XLSX.readFile('LRA DINKES.xlsx');
    
    ['DINKES INDUK', 'SEKRETARIAT', 'YANKES'].forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) return;
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        console.log(`\n--- Sheet: ${sheetName} ---`);
        for (let i = 12; i < 15; i++) {
            const row = data[i];
            console.log(`Row ${i}: A=${row[0]}, E=${row[4]}, J(Pagu)=${row[9]}`);
        }
    });
} catch (e) {
    console.error(e);
}
