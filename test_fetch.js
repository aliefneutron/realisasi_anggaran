const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAFXq9Rku14Bx9edvI0gmLpTvArbsWqeTA",
  authDomain: "simona-dinkes.firebaseapp.com",
  projectId: "simona-dinkes"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFetch() {
    const querySnapshot = await getDocs(collection(db, 'realisasi_history'));
    const history = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log("Fetched from db directly:", history.length);
}

testFetch().catch(console.error);
