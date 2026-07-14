const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAFXq9Rku14Bx9edvI0gmLpTvArbsWqeTA",
  authDomain: "simona-dinkes.firebaseapp.com",
  projectId: "simona-dinkes"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkBackfilledHistory() {
  const snapshot = await getDocs(collection(db, 'realisasi_history'));
  const items = snapshot.docs.map(doc => doc.data());
  
  console.log("Total realisasi_history records:", items.length);
  if (items.length > 0) {
      console.log("Sample record:", items[0]);
  }
}

checkBackfilledHistory().catch(console.error);
