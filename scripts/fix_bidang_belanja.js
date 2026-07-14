const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, writeBatch, doc } = require('firebase/firestore');
const { getBidangByKodeRekening } = require('../src/utils/bidangMapping.js');

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

async function fixBidang() {
  console.log("Fetching budget_items...");
  const snapshot = await getDocs(collection(db, 'budget_items'));
  
  const nodeMap = {};
  const parentMap = {};
  
  snapshot.forEach(d => {
      const data = d.data();
      nodeMap[data.id_unik] = data;
      parentMap[data.id_unik] = data.parent_id_unik;
  });
  
  let operations = [];
  
  snapshot.forEach(d => {
      const data = d.data();
      
      let currentId = data.id_unik;
      let resolvedBidang = null;
      
      while (currentId) {
          const node = nodeMap[currentId];
          if (node) {
              if (node.kode_rekening && (node.kode_rekening.startsWith('1.') || node.kode_rekening.startsWith('2.'))) {
                  const b = getBidangByKodeRekening(node.kode_rekening);
                  if (b !== 'Umum') {
                      resolvedBidang = b;
                      break;
                  }
              }
          }
          currentId = parentMap[currentId];
      }
      
      if (resolvedBidang && data.bidang !== resolvedBidang) {
          operations.push({ ref: doc(db, 'budget_items', d.id), data: { bidang: resolvedBidang } });
      }
  });
  
  console.log(`Found ${operations.length} documents to update.`);
  if (operations.length > 0) {
      for (let i = 0; i < operations.length; i += 500) {
          const batch = writeBatch(db);
          const chunk = operations.slice(i, i + 500);
          chunk.forEach(op => {
              batch.update(op.ref, op.data);
          });
          await batch.commit();
      }
      console.log(`Successfully fixed ${operations.length} documents.`);
  }
}

fixBidang().catch(console.error);
