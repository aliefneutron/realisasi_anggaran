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
  const q = query(collection(db, 'budget_items'), where('parent_kode', '==', '1.02.02.2.02.0001'));
  const snapshot = await getDocs(q);
  console.log(`Found ${snapshot.size} children for sub kegiatan 1.02.02.2.02.0001`);
  snapshot.forEach(doc => {
      const d = doc.data();
      console.log(`- ${d.nama_kegiatan} | Kode: "${d.kode_rekening}"`);
  });
}

checkData();
