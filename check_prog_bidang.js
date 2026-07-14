const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAFXq9Rku14Bx9edvI0gmLpTvArbsWqeTA",
  authDomain: "simona-dinkes.firebaseapp.com",
  projectId: "simona-dinkes"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkSubKeg() {
  const snapshot = await getDocs(collection(db, 'budget_items'));
  const items = snapshot.docs.map(doc => doc.data());
  
  const prog = items.find(i => i.level === 'program');
  console.log("Program example:", prog.kode_rekening, prog.bidang);
  
  const subkeg = items.find(i => i.level === 'sub_kegiatan' && i.bidang && i.bidang !== 'Umum');
  console.log("SubKeg example:", subkeg.kode_rekening, subkeg.bidang);
}

checkSubKeg();
