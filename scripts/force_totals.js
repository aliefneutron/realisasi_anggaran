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

const exactTotals = {
    'DINKES_INDUK': { pagu: 1388220340935, realisasi: 557635541190 },
    'SEKRETARIAT': { pagu: 694750100980, realisasi: 335267575990 },
    'YANKES': { pagu: 101153066583, realisasi: 33109920418 },
    'SDK': { pagu: 21616406280, realisasi: 5629207301 },
    'KESMAS': { pagu: 5061395612, realisasi: 1880437037 },
    'P2P': { pagu: 3631420120, realisasi: 2547348530 },
    'KB': { pagu: 7231759396, realisasi: 1306679754 }
};

async function updateTotals() {
    console.log("Updating exact totals in Firestore...");
    for (const [bidang, totals] of Object.entries(exactTotals)) {
        const totalDoc = {
            bidang: bidang.replace('_', ' '),
            pagu: totals.pagu,
            realisasi: totals.realisasi,
            updatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'summary_totals', bidang), totalDoc);
        console.log(`Updated ${bidang}`);
    }
    console.log("Done.");
    process.exit(0);
}

updateTotals();
