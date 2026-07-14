const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, writeBatch, doc } = require('firebase/firestore');
const { getNamaSubKegiatanByKode } = require('../src/utils/bidangMapping.js');

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

async function syncNames() {
  console.log("Fetching budget_items...");
  const snapshot = await getDocs(collection(db, 'budget_items'));
  
  let operations = [];
  
  snapshot.forEach(document => {
    const data = document.data();
    // Use the 17 character prefix to find the official name
    if (data.kode_rekening) {
        const subKegiatanKode = data.kode_rekening.length >= 17 ? data.kode_rekening.substring(0, 17) : null;
        
        // If it's explicitly a sub_kegiatan level, update its name.
        if (subKegiatanKode && data.level === 'sub_kegiatan') {
            const correctName = getNamaSubKegiatanByKode(subKegiatanKode);
            if (correctName && correctName !== data.nama_kegiatan) {
                operations.push({ ref: doc(db, 'budget_items', document.id), data: { nama_kegiatan: correctName }});
            }
        }
    }
  });
  
  if (operations.length > 0) {
      console.log(`Committing ${operations.length} updates...`);
      // Process in batches of 500 (Firestore limit)
      for (let i = 0; i < operations.length; i += 500) {
          const batch = writeBatch(db);
          const chunk = operations.slice(i, i + 500);
          chunk.forEach(op => {
              batch.update(op.ref, op.data);
          });
          await batch.commit();
      }
      console.log(`Successfully synced ${operations.length} sub kegiatan names.`);
  } else {
      console.log("All sub kegiatan names are already correct. No updates needed.");
  }
}

syncNames().catch(console.error);
