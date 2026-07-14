const XLSX = require('xlsx');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, setDoc, doc, writeBatch, getDocs } = require('firebase/firestore');

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

async function migrate() {
    console.log("Starting migration (Single Sheet Fix)...");
    try {
        console.log("Deleting old documents...");
        const snapshot = await getDocs(collection(db, 'budget_items'));
        let delBatch = writeBatch(db);
        let delCount = 0;
        for (const document of snapshot.docs) {
            delBatch.delete(document.ref);
            delCount++;
            if (delCount >= 450) {
                await delBatch.commit();
                delBatch = writeBatch(db);
                delCount = 0;
            }
        }
        if (delCount > 0) await delBatch.commit();
        console.log("Deleted old documents.");

        const workbook = XLSX.readFile('LRA DINKES.xlsx');
        // We only read DINKES INDUK because all sheets contain the same duplicated data
        const worksheet = workbook.Sheets['DINKES INDUK'] || workbook.Sheets[workbook.SheetNames[0]];
        
        let batch = writeBatch(db);
        let batchCount = 0;
        let totalProcessed = 0;

        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Find the last row before the Grand Total
        let lastRowIdx = data.length;
        for (let i = 0; i < data.length; i++) {
            if (data[i] && data[i][4] && data[i][4].toString().trim() === 'Jumlah') {
                lastRowIdx = i; // stop before "Jumlah"
                break;
            }
        }
        
        for (let i = 7; i < lastRowIdx; i++) {
            const row = data[i];
            if (!row) continue;
            
            let level = 'unknown';
            let kode_rekening = '';
            let parent_kode = null;

            if (row[3] && row[3].toString().startsWith('5.')) {
                kode_rekening = row[3].toString().trim();
                const parts = kode_rekening.split('.');
                if (parts.length === 3) { 
                    level = 'belanja_jenis';
                    parent_kode = row[2] ? row[2].toString().trim() : null; 
                } else if (parts.length === 4) { 
                    level = 'belanja_objek';
                    parent_kode = parts.slice(0, 3).join('.'); 
                } else if (parts.length === 5) { 
                    level = 'belanja_rincian_objek';
                    parent_kode = parts.slice(0, 4).join('.');
                } else if (parts.length >= 6) { 
                    level = 'belanja';
                    parent_kode = parts.slice(0, 5).join('.');
                }
            } else if (row[2]) {
                const parts = row[2].toString().trim().split('.');
                kode_rekening = row[2].toString().trim();
                if (parts.length === 3) {
                    level = 'program';
                } else if (parts.length === 5) {
                    level = 'kegiatan';
                    parent_kode = parts.slice(0, 3).join('.');
                } else if (parts.length === 6) {
                    level = 'sub_kegiatan';
                    parent_kode = parts.slice(0, 5).join('.');
                }
            }
            
            if (!kode_rekening) continue;
            
            let bidang = row[15];
            if (typeof bidang !== 'string' || !bidang.trim() || bidang.trim() === '0%') {
                bidang = 'Umum';
            } else {
                bidang = bidang.trim();
            }
            
            const item = {
                kode_rekening: kode_rekening.toString(),
                nama_kegiatan: row[4] ? row[4].toString().trim() : '',
                pagu: parseNumber(row[9]),
                realisasi: parseNumber(row[10]),
                bidang: bidang,
                level: level,
                parent_kode: parent_kode,
                semester: 'Semester 1'
            };
            
            const uniqueString = (parent_kode ? parent_kode + '-' : '') + kode_rekening;
            const docId = uniqueString.replace(/\./g, '-');
            const itemRef = doc(db, 'budget_items', docId);
            
            batch.set(itemRef, item);
            batchCount++;
            totalProcessed++;
            
            if (batchCount >= 450) {
                await batch.commit();
                batch = writeBatch(db);
                batchCount = 0;
            }
        }
        
        if (batchCount > 0) {
            await batch.commit();
        }
        
        console.log(`Migration complete! Successfully processed ${totalProcessed} unique items.`);
        process.exit(0);
        
    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
}

migrate();
