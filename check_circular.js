const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAFXq9Rku14Bx9edvI0gmLpTvArbsWqeTA",
  authDomain: "simona-dinkes.firebaseapp.com",
  projectId: "simona-dinkes"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkCircular() {
  const snapshot = await getDocs(collection(db, 'budget_items'));
  const items = snapshot.docs.map(doc => doc.data());
  
  const selfRef = items.filter(i => i.kode_rekening === i.parent_kode);
  console.log("Self referencing nodes:", selfRef);
}

checkCircular();
