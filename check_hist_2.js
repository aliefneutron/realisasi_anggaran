const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAFXq9Rku14Bx9edvI0gmLpTvArbsWqeTA",
  authDomain: "simona-dinkes.firebaseapp.com",
  projectId: "simona-dinkes"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function searchHistory() {
  const snapshot = await getDocs(collection(db, 'realisasi_history'));
  const items = snapshot.docs.map(doc => doc.data());
  
  const matches = items.filter(item => item.kode_rekening.includes('5.1.02.01.001.0001'));
  console.log("Matches:", matches);
}

searchHistory().catch(console.error);
