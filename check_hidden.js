const XLSX = require('xlsx');

try {
    const workbook = XLSX.readFile('LRA DINKES.xlsx');
    const worksheet = workbook.Sheets['SEKRETARIAT'];
    
    if (worksheet['!rows']) {
        let hiddenCount = 0;
        let visibleCount = 0;
        for (let i = 0; i < worksheet['!rows'].length; i++) {
            if (worksheet['!rows'][i] && worksheet['!rows'][i].hidden) {
                hiddenCount++;
            } else {
                visibleCount++;
            }
        }
        console.log(`SEKRETARIAT sheet: ${hiddenCount} hidden rows, ${visibleCount} visible rows.`);
    } else {
        console.log("No !rows metadata found.");
    }
} catch (e) {
    console.error(e);
}
