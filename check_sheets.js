const XLSX = require('xlsx');

try {
    const workbook = XLSX.readFile('LRA DINKES.xlsx');
    console.log("Sheet names:", workbook.SheetNames);
} catch (e) {
    console.error(e);
}
