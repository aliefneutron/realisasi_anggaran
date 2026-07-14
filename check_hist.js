const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAFXq9Rku14Bx9edvI0gmLpTvArbsWqeTA",
  authDomain: "simona-dinkes.firebaseapp.com",
  projectId: "simona-dinkes"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkRealisasiHistory() {
  const snapshot = await getDocs(collection(db, 'realisasi_history'));
  const items = snapshot.docs.map(doc => doc.data());
  
  console.log("Total realisasi_history:", items.length);
  
  if (items.length > 0) {
      console.log("Sample realization:", items[0]);
      
      const budgetSnap = await getDocs(collection(db, 'budget_items'));
      const budgetItems = budgetSnap.docs.map(doc => doc.data());
      
      const relatedBelanja = budgetItems.find(b => b.kode_rekening === items[0].kode_rekening);
      if (relatedBelanja) {
          console.log("Related belanja:", relatedBelanja.name, relatedBelanja.kode_rekening);
          
          let parent = budgetItems.find(b => b.kode_rekening === relatedBelanja.parent_kode);
          console.log("Parent SubKeg/Keg:", parent?.name, parent?.kode_rekening, "Bidang:", parent?.bidang);
          
          if (parent?.level !== 'sub_kegiatan') {
              parent = budgetItems.find(b => b.kode_rekening === parent?.parent_kode);
              console.log("Grandparent:", parent?.name, "Bidang:", parent?.bidang);
          }
      }
  }
}

checkRealisasiHistory();
