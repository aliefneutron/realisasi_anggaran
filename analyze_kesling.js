const xlsx = require('xlsx');

const filePath = 'KESLING RAK 2025.xlsx';
const workbook = xlsx.readFile(filePath);

console.log('--- Analisa File Excel: ' + filePath + ' ---');
console.log('Daftar Sheet:');
workbook.SheetNames.forEach(sheetName => {
    console.log(`- ${sheetName}`);
    
    const sheet = workbook.Sheets[sheetName];
    // Convert to JSON to get rows
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    console.log(`  Total Baris: ${data.length}`);
    
    // Print first 5 rows to understand the structure
    console.log('  5 Baris Pertama:');
    for (let i = 0; i < Math.min(5, data.length); i++) {
        console.log(`    Baris ${i + 1}: ${JSON.stringify(data[i])}`);
    }
    console.log('');
});
