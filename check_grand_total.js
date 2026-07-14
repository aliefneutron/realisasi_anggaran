const XLSX = require('xlsx');

try {
    const workbook = XLSX.readFile('LRA DINKES.xlsx');
    
    ['DINKES INDUK', 'SEKRETARIAT'].forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) return;
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        console.log(`\n--- Sheet: ${sheetName} ---`);
        for (let i = 0; i < 12; i++) {
            if (data[i]) {
                const j = data[i][9]; // Column J
                const k = data[i][10]; // Column K
                const a = data[i][0]; // Column A
                const d = data[i][3];
                const e = data[i][4];
                console.log(`Row ${i}: A=${a}, D=${d}, E=${e}, J=${j}, K=${k}`);
            }
        }
    });
} catch (e) {
    console.error(e);
}
