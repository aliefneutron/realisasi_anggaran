const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAFXq9Rku14Bx9edvI0gmLpTvArbsWqeTA",
  authDomain: "simona-dinkes.firebaseapp.com",
  projectId: "simona-dinkes"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkRealizations() {
  const snapshot = await getDocs(collection(db, 'realizations'));
  const items = snapshot.docs.map(doc => doc.data());
  
  console.log("Total realizations:", items.length);
  
  if (items.length > 0) {
      console.log("Sample realization:", items[0]);
      
      // Let's get the corresponding budget item to check its bidang
      const budgetSnap = await getDocs(collection(db, 'budget_items'));
      const budgetItems = budgetSnap.docs.map(doc => doc.data());
      
      const relatedBelanja = budgetItems.find(b => b.kode_rekening === items[0].kode_rekening);
      if (relatedBelanja) {
          console.log("Related belanja found:", relatedBelanja.name);
          console.log("Belanja parent kode:", relatedBelanja.parent_kode);
          
          const parentSubKeg = budgetItems.find(b => b.kode_rekening === relatedBelanja.parent_kode || 
                                                    (b.level === 'sub_kegiatan' && relatedBelanja.kode_rekening.startsWith(b.kode_rekening)));
          if (parentSubKeg) {
              console.log("Parent SubKeg bidang:", parentSubKeg.bidang);
          }
      }
  }
}

checkRealizations();
