const XLSX = require('xlsx');

try {
    const workbook = XLSX.readFile('LRA DINKES.xlsx');
    const sheetName = 'DINKES INDUK';
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    let validCount = 0;
    for (let i = 7; i < 20; i++) {
        const row = data[i];
        if (!row) continue;
        console.log(`Row ${i}: A=${row[0]}, B=${row[1]}, C=${row[2]}, D=${row[3]}, E=${row[4]}, P(15)=${row[15]}, LastCol=${row[row.length-1]}`);
    }
} catch (e) {
    console.error(e);
}
