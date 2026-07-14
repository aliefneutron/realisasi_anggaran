const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

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

async function checkData() {
  const snapshot = await getDocs(collection(db, 'budget_items'));
  let found = false;
  snapshot.forEach(doc => {
      const d = doc.data();
      if (d.nama_kegiatan && d.nama_kegiatan.toLowerCase().includes('audit maternal')) {
          console.log(`Found: ${d.nama_kegiatan} | Kode: ${d.kode_rekening} | Level: ${d.level} | Parent: ${d.parent_kode}`);
          found = true;
      }
  });
  if (!found) console.log("Not found in budget_items");
}

checkData();
