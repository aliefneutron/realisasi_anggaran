const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "dummy",
    authDomain: "simona-dinkes.firebaseapp.com",
    projectId: "simona-dinkes",
    storageBucket: "simona-dinkes.firebasestorage.app",
    messagingSenderId: "dummy",
    appId: "dummy"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const bidangMapping = {
    "SEKRETARIAT": [
        "1.02.01.2.01.0001",
        "1.02.01.2.01.0002",
        "1.02.01.2.01.0003",
        "1.02.01.2.01.0004",
        "1.02.01.2.01.0005",
        "1.02.01.2.01.0006",
        "1.02.01.2.01.0007",
        "1.02.01.2.01.0009",
        "1.02.01.2.02.0001",
        "1.02.01.2.02.0003",
        "1.02.01.2.02.0005",
        "1.02.01.2.02.0007",
        "1.02.01.2.03.0005",
        "1.02.01.2.06.0001",
        "1.02.01.2.06.0002",
        "1.02.01.2.06.0004",
        "1.02.01.2.06.0005",
        "1.02.01.2.06.0006",
        "1.02.01.2.06.0009",
        "1.02.01.2.08.0002",
        "1.02.01.2.09.0002",
        "1.02.01.2.09.0006",
        "1.02.01.2.09.0009"
    ],
    "YANKES": [
        "1.02.02.2.01.0006",
        "1.02.02.2.01.0024",
        "1.02.02.2.02.0019",
        "1.02.02.2.02.0026",
        "1.02.02.2.02.0033",
        "1.02.02.2.02.0038",
        "1.02.02.2.02.0045",
        "1.02.02.2.03.0002",
        "1.02.02.2.04.0001",
        "1.02.02.2.04.0003",
        "1.02.02.2.04.0004"
    ],
    "SDK": [
        "1.02.02.2.01.0014",
        "1.02.02.2.01.0020",
        "1.02.02.2.01.0023",
        "1.02.02.2.01.0026",
        "1.02.03.2.01.0001",
        "1.02.03.2.02.0001",
        "1.02.03.2.02.0002",
        "1.02.03.2.02.0003",
        "1.02.03.2.03.0001"
    ],
    "KESMAS": [
        "1.02.02.2.02.0001",
        "1.02.02.2.02.0002",
        "1.02.02.2.02.0003",
        "1.02.02.2.02.0004",
        "1.02.02.2.02.0005",
        "1.02.02.2.02.0006",
        "1.02.02.2.02.0007",
        "1.02.02.2.02.0015",
        "1.02.02.2.02.0016",
        "1.02.02.2.02.0017",
        "1.02.02.2.02.0018",
        "1.02.02.2.02.0029",
        "1.02.02.2.02.0046",
        "1.02.04.2.04.0001",
        "1.02.04.2.05.0001",
        "1.02.05.2.01.0001",
        "1.02.05.2.03.0001"
    ],
    "P2P": [
        "1.02.02.2.02.0008",
        "1.02.02.2.02.0009",
        "1.02.02.2.02.0010",
        "1.02.02.2.02.0011",
        "1.02.02.2.02.0012",
        "1.02.02.2.02.0020",
        "1.02.02.2.02.0025",
        "1.02.02.2.02.0028",
        "1.02.02.2.02.0036",
        "1.02.02.2.02.0042",
        "1.02.02.2.02.0050"
    ],
    "KB": [
        "2.14.02.2.02.0012",
        "2.14.02.2.02.0013",
        "2.14.02.2.02.0027",
        "2.14.03.2.01.0010",
        "2.14.03.2.01.0014",
        "2.14.03.2.02.0002",
        "2.14.03.2.02.0004",
        "2.14.03.2.03.0001",
        "2.14.03.2.03.0003",
        "2.14.04.2.01.0014",
        "2.14.04.2.02.0006"
    ]
};

const getBidangByKodeRekening = (kodeRekening) => {
    if (!kodeRekening) return "Umum";
    const subKegiatanPrefix = kodeRekening.length >= 17 ? kodeRekening.substring(0, 17) : kodeRekening;
    for (const [bidang, kodes] of Object.entries(bidangMapping)) {
        if (kodes.includes(subKegiatanPrefix)) {
            return bidang;
        }
    }
    return "Umum";
};

async function updateBidang() {
    console.log('Fetching budget_items...');
    const snapshot = await getDocs(collection(db, 'budget_items'));
    let updateCount = 0;
    
    for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        const correctBidang = getBidangByKodeRekening(data.kode_rekening);
        
        // If it's urusan, bidang, program etc, we might not have a full 17 char code.
        // Wait, the root nodes like "1" (Urusan) won't match any of this.
        // What do we do for parents? They inherit from their children?
        // Let's just apply to those that match, and for shorter ones we can ignore or let them be 'Umum'
        
        // But for things shorter than 17 chars, maybe they belong to multiple bidangs? 
        // e.g. "1.02" is Dinas Kesehatan, which contains all bidangs.
        // In the original system, `bidang` was just "SEKRETARIAT", "YANKES" etc for all rows (copied from excel).
        // It's okay if top-level items get assigned to "Umum" or we just DON'T overwrite top level items if they don't have a 17 char prefix?
        // Actually, if we just overwrite ALL of them, the UI only filters by `bidang` on the leaf nodes or sub_kegiatans anyway.
        // Or we can say if length < 17, don't change its bidang unless it's a direct prefix?
        
        // Let's see how `bidang` is used. It's used in filters.
        
        if (correctBidang !== 'Umum') {
            if (data.bidang !== correctBidang) {
                await updateDoc(doc(db, 'budget_items', docSnapshot.id), {
                    bidang: correctBidang
                });
                updateCount++;
                console.log(`Updated ${data.kode_rekening} to ${correctBidang}`);
            }
        } else {
            // For items that don't match exactly (e.g. 1.02.01 program), we can leave their current bidang, or if they are < 17 chars we leave them alone.
            // If they are >= 17 chars and still 'Umum', then we also update it if it's currently not 'Umum' (meaning it was wrongly assigned)
            if (data.kode_rekening && data.kode_rekening.length >= 17) {
                if (data.bidang !== 'Umum') {
                    await updateDoc(doc(db, 'budget_items', docSnapshot.id), {
                        bidang: 'Umum'
                    });
                    updateCount++;
                }
            }
        }
    }
    console.log(`Updated ${updateCount} documents.`);
}

updateBidang().catch(console.error);
