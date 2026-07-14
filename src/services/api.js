import axios from 'axios';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc, setDoc, addDoc, query, where } from 'firebase/firestore';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── In-memory cache ───────────────────────────────────────────────────────
let _budgetItemsCache = null;   // Array of raw docs from 'budget_items'
let _historyCache = null;       // Array of raw docs from 'realisasi_history'

/** Hapus cache agar fetch berikutnya mengambil data fresh dari Firestore */
export const invalidateCache = () => {
  _budgetItemsCache = null;
  _historyCache = null;
};

/** Ambil budget_items dengan cache */
const getCachedBudgetItems = async () => {
  if (_budgetItemsCache !== null) return _budgetItemsCache;
  const querySnapshot = await getDocs(collection(db, 'budget_items'));
  _budgetItemsCache = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  return _budgetItemsCache;
};

/** Ambil realisasi_history dengan cache */
const getCachedHistoryItems = async () => {
  if (_historyCache !== null) return _historyCache;
  const querySnapshot = await getDocs(collection(db, 'realisasi_history'));
  _historyCache = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  return _historyCache;
};
// ───────────────────────────────────────────────────────────────────────────

const getCurrentUser = () => {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
};

export const getBudgetData = async (params = {}) => {
  try {
    // Gunakan cache agar tidak fetch ulang jika data sudah ada
    let flatData = await getCachedBudgetItems();
    
    // Only return belanja level for the table
    flatData = flatData.filter(item => item.level === 'belanja');

    const user = getCurrentUser();
    if (user && user.role !== 'admin') {
      flatData = flatData.filter(item => item.bidang === user.bidang);
    }

    // Semester filter is now handled dynamically on the frontend via filterData and historyData

    if (params.bidang && params.bidang.length > 0) {
      flatData = flatData.filter(item => params.bidang.includes(item.bidang));
    }

    if (params.search) {
      const searchLower = params.search.toLowerCase();
      flatData = flatData.filter(item =>
        (item.nama_kegiatan || '').toLowerCase().includes(searchLower) ||
        (item.kode_rekening || '').toLowerCase().includes(searchLower) ||
        (item.bidang || '').toLowerCase().includes(searchLower)
      );
    }

    return {
      success: true,
      data: flatData,
      total: flatData.length
    };
  } catch (error) {
    console.error('Error fetching budget data:', error);
    throw error;
  }
};

const buildHierarchy = (items) => {
  const nodeMap = {};
  const bidangMap = {};
  
  // First pass: Create all nodes and put them in map
  items.forEach(item => {
      nodeMap[item.id_unik] = {
          id: item.id_unik, // Use id_unik as internal ID
          docId: item.id, // Firestore ID
          name: item.nama_kegiatan,
          pagu: item.pagu,
          realisasi: item.realisasi,
          level: item.level,
          bidang: item.bidang || 'Umum',
          kode_rekening: item.kode_rekening,
          id_unik: item.id_unik,
          parent_id_unik: item.parent_id_unik,
          children: []
      };
  });

  // Second pass: Link children to parents
  items.forEach(item => {
      const node = nodeMap[item.id_unik];
      
      if (item.parent_id_unik && nodeMap[item.parent_id_unik]) {
          nodeMap[item.parent_id_unik].children.push(node);
      } else if (item.level === 'program') {
          // Group programs under their Bidang
          if (!bidangMap[node.bidang]) {
              bidangMap[node.bidang] = {
                  id: 'bidang-' + node.bidang,
                  name: node.bidang,
                  level: 'bidang',
                  children: []
              };
          }
          bidangMap[node.bidang].children.push(node);
      }
  });
  
  return [{
      id: 'skpd-dinkes',
      name: 'DINAS KESEHATAN',
      level: 'skpd',
      children: Object.values(bidangMap)
  }];
};

export const getHierarchicalData = async () => {
  try {
    // Reuse cache yang sama dengan getBudgetData
    const items = await getCachedBudgetItems();
    
    let hierarchy = buildHierarchy(items);
    
    const user = getCurrentUser();
    if (user && user.role !== 'admin') {
      hierarchy = hierarchy.map(skpd => ({
        ...skpd,
        children: skpd.children?.filter(bidang => bidang.name === user.bidang) || []
      })).filter(skpd => skpd.children.length > 0);
    }

    return {
      success: true,
      data: hierarchy
    };
  } catch (error) {
    console.error('Error fetching hierarchical data:', error);
    throw error;
  }
};

export const updateBudgetItem = async (id, budgetData) => {
  try {
    const itemRef = doc(db, 'budget_items', id);
    await updateDoc(itemRef, {
      nama_kegiatan: budgetData.nama_kegiatan,
      pagu: budgetData.pagu,
      realisasi: budgetData.realisasi,
      kode_rekening: budgetData.kode_rekening
    });

    return {
      success: true,
      data: budgetData,
      message: 'Budget item updated successfully'
    };
  } catch (error) {
    console.error('Error updating budget item:', error);
    throw error;
  }
};

export const deleteBudgetItem = async (id) => {
  try {
    await deleteDoc(doc(db, 'budget_items', id));
    return {
      success: true,
      message: 'Budget item deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting budget item:', error);
    throw error;
  }
};

export const createBudgetItem = async (budgetData) => {
  try {
    const newDocRef = doc(collection(db, 'budget_items'));
    await setDoc(newDocRef, budgetData);
    return { success: true, data: { id: newDocRef.id, ...budgetData } };
  } catch (error) {
    console.error('Error creating budget item:', error);
    throw error;
  }
};

export const getBudgetById = async (id) => {
  try {
    const itemRef = doc(db, 'budget_items', id);
    const itemSnap = await getDoc(itemRef);
    
    if (itemSnap.exists()) {
      return { success: true, data: { id: itemSnap.id, ...itemSnap.data() } };
    } else {
      throw new Error('Budget item not found');
    }
  } catch (error) {
    console.error('Error fetching budget item:', error);
    throw error;
  }
};

export const getFilterOptions = async () => {
  try {
    // Reuse cache yang sama, tidak perlu query Firestore lagi
    const items = await getCachedBudgetItems();
    
    const bidangs = [...new Set(items.map(item => item.bidang).filter(b => b && b !== 'Umum'))];
    const semesters = ['Semester 1', 'Semester 2'];

    return {
      success: true,
      data: {
        semesters,
        bidangs
      }
    };
  } catch (error) {
    console.error('Error fetching filter options:', error);
    throw error;
  }
};

export const getSummaryTotals = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'summary_totals'));
    const totals = {};
    querySnapshot.docs.forEach(doc => {
      totals[doc.id] = doc.data();
    });
    return { success: true, data: totals };
  } catch (error) {
    console.error('Error fetching summary totals:', error);
    throw error;
  }
};

export const updateHierarchicalData = async (newData) => {
  return { success: true, message: 'Not supported with Firestore flat structure' };
};

export const addRealizationHistory = async (realizationDataArray) => {
  try {
    const results = { success: 0, failed: 0, errors: [] };
    
    // Gunakan cache untuk mapping
    const budgetItems = await getCachedBudgetItems();

    for (const item of realizationDataArray) {
      try {
        const budgetItem = budgetItems.find(i => i.id_unik === item.id_unik);
        
        if (!budgetItem) {
          throw new Error(`Budget item not found for id_unik: ${item.id_unik}`);
        }

        // Simpan ke Firestore
        await addDoc(collection(db, 'realisasi_history'), {
            budget_item_id: budgetItem.id, // Firestore doc ID
            id_unik: item.id_unik,
            kode_rekening: item.kode_rekening,
          tanggal: item.tanggal,
          uraian: item.uraian,
          jumlah_realisasi: item.jumlah_realisasi,
          created_at: new Date().toISOString()
        });

        // 2. Update the main budget_item's realisasi total
        const newRealisasiTotal = (parseFloat(budgetItem.realisasi) || 0) + item.jumlah_realisasi;
        const itemRef = doc(db, 'budget_items', budgetItem.id);
        await updateDoc(itemRef, {
          realisasi: newRealisasiTotal
        });

        // Update local cache so next iterations using same budget item get the updated total
        budgetItems[item.kode_rekening].realisasi = newRealisasiTotal;

        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push(err.message);
      }
    }

    // Invalidate cache setelah data baru ditulis ke Firestore
    invalidateCache();
    
    return { success: true, data: results };
  } catch (error) {
    console.error('Error adding realization history:', error);
    throw error;
  }
};

export const getRealizationHistory = async (budgetItemId) => {
  try {
    const q = query(
      collection(db, 'realisasi_history'), 
      where('budget_item_id', '==', budgetItemId)
    );
    const querySnapshot = await getDocs(q);
    const history = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sort by date descending
    history.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    
    return { success: true, data: history };
  } catch (error) {
    console.error('Error fetching realization history:', error);
    throw error;
  }
};

export const getAllRealizationHistory = async () => {
  try {
    // Gunakan cache agar tidak re-fetch seluruh koleksi setiap render
    const history = await getCachedHistoryItems();
    return { success: true, data: history };
  } catch (error) {
    console.error('Error fetching all realization history:', error);
    throw error;
  }
};

export const getPuskesmasData = async () => {
  return { success: true, data: [] };
};

export const uploadExcelFile = async (file) => {
  return { success: true };
};

export const exportToExcel = async (filters = {}) => {
  return { success: true };
};

export default api;
