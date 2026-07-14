const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAFXq9Rku14Bx9edvI0gmLpTvArbsWqeTA",
  authDomain: "simona-dinkes.firebaseapp.com",
  projectId: "simona-dinkes"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function backfillHistory() {
  const budgetSnap = await getDocs(collection(db, 'budget_items'));
  const budgetItems = budgetSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  const itemsWithRealisasi = budgetItems.filter(b => b.realisasi > 0 && b.level === 'belanja');
  console.log(`Found ${itemsWithRealisasi.length} belanja items with existing realisasi.`);
  
  let added = 0;
  for (const item of itemsWithRealisasi) {
      await addDoc(collection(db, 'realisasi_history'), {
          budget_item_id: item.id,
          kode_rekening: item.kode_rekening,
          tanggal: "2025-01-01",
          uraian: "Realisasi Awal (Migrasi)",
          jumlah_realisasi: parseFloat(item.realisasi),
          created_at: new Date().toISOString()
      });
      added++;
  }
  
  console.log(`Backfilled ${added} history records successfully!`);
}

backfillHistory().catch(console.error);
