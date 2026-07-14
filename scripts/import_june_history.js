const XLSX = require('xlsx');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, setDoc, doc, writeBatch, getDocs, query, where, deleteDoc } = require('firebase/firestore');

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

async function importJuneHistory() {
    console.log("Starting June history import...");
    try {
        console.log("1. Deleting existing June history...");
        const historySnapshot = await getDocs(query(collection(db, 'realisasi_history'), where('uraian', '==', 'Realisasi s.d Juni')));
        let delBatch = writeBatch(db);
        let delCount = 0;
        for (const document of historySnapshot.docs) {
            delBatch.delete(document.ref);
            delCount++;
            if (delCount >= 400) {
                await delBatch.commit();
                delBatch = writeBatch(db);
                delCount = 0;
            }
        }
        if (delCount > 0) await delBatch.commit();
        console.log(`Deleted ${historySnapshot.size} existing June history records.`);

        console.log("2. Fetching budget items to determine leaf nodes...");
        const itemsSnapshot = await getDocs(collection(db, 'budget_items'));
        const items = {};
        const hasChildren = {};

        itemsSnapshot.forEach(doc => {
            const data = doc.data();
            items[doc.id] = data;
            if (data.parent_kode) {
                // To find the parent docId, we would need to reconstruct it, but it's easier to just track which id_uniks are parents
                // Wait, parent_kode alone is not unique. The unique string is parent-parent-kode.
                // We know that `data.id_unik` is the id_unik. What is its parent's id_unik?
                // Actually, just find the parent doc in the list.
                // It's simpler: if an item is someone's parent, it's not a leaf.
                // In our data, the parent's id_unik is just everything before the last dash, OR we can just rely on the level.
            }
        });

        // Simpler way to find leaf nodes: a node is a leaf if NO other node has it as its parent.
        // Wait, the id_unik of the parent is stored in parentMap in helpers.js using: parentMap[item.id_unik] = item.parent_id_unik.
        // But our DB doesn't have parent_id_unik directly. It has parent_kode.
        // Let's just find leaves by checking if any other item's kode_rekening starts with this item's kode_rekening.
        const leafNodes = new Set();
        Object.keys(items).forEach(id => {
            if (items[id].level === 'belanja') {
                leafNodes.add(id);
            }
        });
        console.log(`Found ${leafNodes.size} leaf nodes out of ${Object.keys(items).length} total items.`);
        console.log('Sample leaf nodes from DB:', Array.from(leafNodes).slice(0, 5));

        console.log("3. Reading LRA DINKES.xlsx...");
        const workbook = XLSX.readFile('LRA DINKES.xlsx');
        const worksheet = workbook.Sheets['DINKES INDUK'] || workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        let lastRowIdx = data.length;
        for (let i = 0; i < data.length; i++) {
            if (data[i] && data[i][4] && data[i][4].toString().trim() === 'Jumlah') {
                lastRowIdx = i;
                break;
            }
        }
        
        let batch = writeBatch(db);
        let batchCount = 0;
        let totalInserted = 0;
        
        let current_sub_kegiatan_kode = null;
        
        for (let i = 7; i < lastRowIdx; i++) {
            const row = data[i];
            if (!row) continue;
            
            let kode_rekening = '';
            let level = 'unknown';

            if (row[3] && row[3].toString().startsWith('5.')) {
                kode_rekening = row[3].toString().trim();
                const parts = kode_rekening.split('.');
                if (parts.length === 3) { 
                    level = 'belanja_jenis';
                } else if (parts.length === 4) { 
                    level = 'belanja_objek';
                } else if (parts.length === 5) { 
                    level = 'belanja_rincian_objek';
                } else if (parts.length >= 6) { 
                    level = 'belanja';
                }
            } else if (row[2]) {
                const parts = row[2].toString().trim().split('.');
                kode_rekening = row[2].toString().trim();
                if (parts.length === 6) {
                    current_sub_kegiatan_kode = kode_rekening;
                }
            }
            
            if (!kode_rekening) continue;
            
            let id_unik = kode_rekening;
            if (level.startsWith('belanja')) {
                if (!current_sub_kegiatan_kode) continue;
                id_unik = current_sub_kegiatan_kode + '-' + kode_rekening;
            }
            
            const docId = id_unik.replace(/\./g, '-');
            
            // Only insert history for LEAF NODES
            if (!leafNodes.has(docId)) {
                continue;
            }
            
            // Column G is index 6
            const amount = parseNumber(row[6]);
            
            if (amount > 0) {
                const historyRef = doc(collection(db, 'realisasi_history'));
                batch.set(historyRef, {
                    budget_item_id: docId,
                    id_unik: id_unik,
                    kode_rekening: kode_rekening,
                    tanggal: '2026-06-30', // Realisasi s.d Juni
                    uraian: 'Realisasi s.d Juni',
                    jumlah_realisasi: amount,
                    created_at: new Date().toISOString()
                });
                
                batchCount++;
                totalInserted++;
                
                if (batchCount >= 400) {
                    await batch.commit();
                    batch = writeBatch(db);
                    batchCount = 0;
                }
            } else {
                console.log(`Amount is 0 for docId: ${docId}, row[6] was: ${row[6]}`);
            }
        }
        
        if (batchCount > 0) {
            await batch.commit();
        }
        
        console.log(`Success! Inserted ${totalInserted} history records for June.`);
        process.exit(0);
        
    } catch (e) {
        console.error("Import failed:", e);
        process.exit(1);
    }
}

importJuneHistory();
