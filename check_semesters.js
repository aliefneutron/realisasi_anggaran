const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAFXq9Rku14Bx9edvI0gmLpTvArbsWqeTA",
  authDomain: "simona-dinkes.firebaseapp.com",
  projectId: "simona-dinkes"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkSemesters() {
  const snapshot = await getDocs(collection(db, 'budget_items'));
  const semesters = new Set();
  
  snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.semester) {
          semesters.add(data.semester);
      }
  });
  
  console.log("Semesters found in database:", Array.from(semesters));
}

checkSemesters().catch(console.error);
