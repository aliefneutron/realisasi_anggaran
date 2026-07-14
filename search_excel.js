const XLSX = require('xlsx');

try {
    const workbook = XLSX.readFile('LRA DINKES.xlsx');
    
    workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) return;
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            for (let j = 0; j < row.length; j++) {
                const val = row[j];
                if (val && val.toString().replace(/\D/g, '').includes('136535794')) {
                    console.log(`Found in sheet ${sheetName}, row ${i}, col ${j}: ${val}`);
                }
                if (val && val.toString().replace(/\D/g, '').includes('694750100')) {
                    console.log(`Found in sheet ${sheetName}, row ${i}, col ${j}: ${val}`);
                }
            }
        }
    });
} catch (e) {
    console.error(e);
}
