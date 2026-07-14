const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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

async function checkSubKeg() {
  const snapshot = await getDocs(collection(db, 'budget_items'));
  const items = snapshot.docs.map(doc => doc.data());
  
  // find everything under 1.02.02.2.02.0001
  const subkeg = items.filter(i => i.kode_rekening && i.kode_rekening.startsWith('1.02.02.2.02.0001'));
  const belanja = items.filter(i => i.kode_rekening && i.kode_rekening.startsWith('5.1.02') && i.parent_kode && i.parent_kode.startsWith('1.02.02.2.02.0001'));
  
  console.log("Subkeg items:");
  subkeg.forEach(i => console.log(i.kode_rekening, i.level, i.nama_kegiatan));
  
  console.log("\nChildren under 1.02.02.2.02.0001:");
  const children = items.filter(i => i.parent_kode === '1.02.02.2.02.0001');
  children.forEach(i => console.log(i.kode_rekening, i.level, i.nama_kegiatan));
  
  // Recursively find all children
  function findChildren(parentCode, indent) {
      const c = items.filter(i => i.parent_kode === parentCode);
      c.forEach(i => {
          console.log(indent + i.kode_rekening, i.level, i.nama_kegiatan);
          findChildren(i.kode_rekening, indent + "  ");
      });
  }
  
  console.log("\nFull Tree under 1.02.02.2.02.0001:");
  findChildren('1.02.02.2.02.0001', "  ");
}

checkSubKeg();
