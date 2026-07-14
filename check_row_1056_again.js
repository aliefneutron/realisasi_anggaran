const XLSX = require('xlsx');

try {
    const workbook = XLSX.readFile('LRA DINKES.xlsx');
    const sheetName = 'DINKES INDUK';
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Check row 1055 (0-indexed, which is row 1056 in Excel)
    if (data[1055]) {
        console.log(`Row 1056, Col J: ${data[1055][9]}`);
        console.log(`Row 1056, Col K: ${data[1055][10]}`);
    } else {
        console.log('Row 1056 not found.');
    }
} catch (e) {
    console.error(e);
}
