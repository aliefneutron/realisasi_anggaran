const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAFXq9Rku14Bx9edvI0gmLpTvArbsWqeTA",
  authDomain: "simona-dinkes.firebaseapp.com",
  projectId: "simona-dinkes"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkBidang() {
  const snapshot = await getDocs(collection(db, 'budget_items'));
  const items = snapshot.docs.map(doc => doc.data());
  
  const bidangSet = new Set();
  items.forEach(i => {
      if (i.bidang) bidangSet.add(i.bidang);
  });
  
  console.log("Unique bidang in DB:", Array.from(bidangSet));
}

checkBidang();
