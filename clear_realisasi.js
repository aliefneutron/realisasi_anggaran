const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, updateDoc, doc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAFXq9Rku14Bx9edvI0gmLpTvArbsWqeTA",
  authDomain: "simona-dinkes.firebaseapp.com",
  projectId: "simona-dinkes"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearRealisasi() {
  console.log("Mulai menghapus riwayat realisasi...");
  
  // 1. Delete all realisasi_history
  const historySnap = await getDocs(collection(db, 'realisasi_history'));
  let deletedHistory = 0;
  for (const docSnap of historySnap.docs) {
      await deleteDoc(doc(db, 'realisasi_history', docSnap.id));
      deletedHistory++;
  }
  console.log(`Berhasil menghapus ${deletedHistory} data dari tabel realisasi_history.`);

  // 2. Reset realisasi to 0 in budget_items
  const budgetSnap = await getDocs(collection(db, 'budget_items'));
  let updatedBudget = 0;
  for (const docSnap of budgetSnap.docs) {
      const data = docSnap.data();
      if (data.realisasi > 0) {
          await updateDoc(doc(db, 'budget_items', docSnap.id), {
              realisasi: 0
          });
          updatedBudget++;
      }
  }
  console.log(`Berhasil me-reset nilai realisasi menjadi 0 pada ${updatedBudget} data budget_items.`);
  
  console.log("Selesai! Semua data realisasi telah dikosongkan.");
}

clearRealisasi().catch(console.error);
