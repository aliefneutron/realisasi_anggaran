const XLSX = require('xlsx');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAFXq9Rku14Bx9edvI0gmLpTvArbsWqeTA",
  authDomain: "simona-dinkes.firebaseapp.com",
  projectId: "simona-dinkes",
  storageBucket: "simona-dinkes.firebasestorage.app",
  messagingSenderId: "110448646014",
  appId: "1:110448646014:web:ae057b678776611c8e852f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const parseNumber = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    let str = val.toString().trim();
    if (str === '-' || str === '') return 0;
    if (str.includes(',') || str.includes('.')) {
        str = str.replace(/\./g, '').replace(/,/g, '.');
    }
    return parseFloat(str) || 0;
};

async function migrateTotals() {
    console.log("Migrating Bidang totals from Excel...");
    try {
        const workbook = XLSX.readFile('LRA DINKES.xlsx');
        const sheetsToRead = ['DINKES INDUK', 'SEKRETARIAT', 'YANKES', 'SDK', 'KESMAS', 'P2P', 'KB'];
        
        for (const sheetName of sheetsToRead) {
            const worksheet = workbook.Sheets[sheetName];
            if (!worksheet) {
                console.log(`Sheet ${sheetName} not found.`);
                continue;
            }
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            // Find the row that contains the totals. It should be the last row with data in J and K.
            // Often it's row 1055 (0-indexed). Let's scan from the bottom.
            let pagu = 0;
            let realisasi = 0;
            
            for (let i = data.length - 1; i >= 0; i--) {
                const row = data[i];
                if (row && (row[9] !== undefined || row[10] !== undefined)) {
                    // Check if it's the grand total row (doesn't have kode_rekening in A or D)
                    if (!row[0] && !row[3]) {
                        pagu = parseNumber(row[9]);
                        realisasi = parseNumber(row[10]);
                        if (pagu > 0 || realisasi > 0) {
                            console.log(`Found totals for ${sheetName} at row ${i + 1}: Pagu=${pagu}, Realisasi=${realisasi}`);
                            break;
                        }
                    }
                }
            }
            
            // If we didn't find it scanning from bottom, fallback to row 1055
            if (pagu === 0 && realisasi === 0 && data[1055]) {
                pagu = parseNumber(data[1055][9]);
                realisasi = parseNumber(data[1055][10]);
            }

            const totalDoc = {
                bidang: sheetName,
                pagu: pagu,
                realisasi: realisasi,
                updatedAt: new Date().toISOString()
            };
            
            const docId = sheetName.replace(/\s+/g, '_').toUpperCase();
            await setDoc(doc(db, 'summary_totals', docId), totalDoc);
            console.log(`Saved totals for ${sheetName} to Firestore.`);
        }
        
        console.log("Finished migrating totals.");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
}

migrateTotals();
