/**
 * Materials Procurement Service - Firestore Database Operations (Phase 5)
 * Manages construction material supplies, quantities, agents/vendors, projects, and costs.
 * Generates atomic MAT-101 identifiers with full validation and real-time synchronization.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  runTransaction,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './config.js';

const MATERIALS_COLLECTION = 'materials';
const COUNTERS_COLLECTION = 'counters';
const MATERIAL_COUNTER_DOC = 'materials';

/**
 * Generates the next sequential Material ID (e.g., MAT-101, MAT-102)
 * using an atomic Firestore transaction.
 * @returns {Promise<string>}
 */
export async function getNextMaterialId() {
  const counterRef = doc(db, COUNTERS_COLLECTION, MATERIAL_COUNTER_DOC);

  try {
    const nextId = await runTransaction(db, async (transaction) => {
      const counterSnap = await transaction.get(counterRef);
      let nextSeq = 101;

      if (counterSnap.exists()) {
        const current = counterSnap.data().currentSeq;
        if (typeof current === 'number' && current >= 100) {
          nextSeq = current + 1;
        }
      }

      let candidateId = `MAT-${nextSeq}`;
      let exists = true;
      let checkSeq = nextSeq;

      while (exists) {
        candidateId = `MAT-${checkSeq}`;
        const matRef = doc(db, MATERIALS_COLLECTION, candidateId);
        const matSnap = await transaction.get(matRef);
        if (!matSnap.exists()) {
          exists = false;
        } else {
          checkSeq++;
        }
      }

      transaction.set(
        counterRef,
        {
          currentSeq: checkSeq,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );

      return candidateId;
    });

    return nextId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COUNTERS_COLLECTION}/${MATERIAL_COUNTER_DOC}`);
    return `MAT-${Date.now().toString().slice(-4)}`;
  }
}

/**
 * Validates material data
 * @param {Object} data
 */
export function validateMaterialData(data) {
  const errors = {};

  if (!data.date || !data.date.trim()) {
    errors.date = 'Date is required';
  }

  if (!data.projectId || !data.projectId.trim()) {
    errors.projectId = 'Project selection is required';
  }

  if (!data.item || !data.item.trim()) {
    errors.item = 'Material item name is required';
  } else if (data.item.trim().length > 200) {
    errors.item = 'Material item description is too long (max 200 chars)';
  }

  if (!data.quantity || !String(data.quantity).trim()) {
    errors.quantity = 'Quantity is required';
  }

  if (!data.agent || !data.agent.trim()) {
    errors.agent = 'Agent / supplier / vendor name is required';
  } else if (data.agent.trim().length > 150) {
    errors.agent = 'Agent name is too long (max 150 chars)';
  }

  const amt = Number(data.amount);
  if (data.amount === '' || data.amount === null || data.amount === undefined || isNaN(amt)) {
    errors.amount = 'Amount is required and must be a valid number';
  } else if (amt < 0) {
    errors.amount = 'Amount cannot be negative';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Subscribes to real-time updates for materials
 * @param {Function} onUpdate - Callback with material documents
 * @param {Function} onError - Callback for errors
 * @returns {Function} Unsubscribe function
 */
export function subscribeToMaterials(onUpdate, onError) {
  const matQuery = query(
    collection(db, MATERIALS_COLLECTION),
    orderBy('date', 'desc'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    matQuery,
    (snapshot) => {
      const materials = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      onUpdate(materials);
    },
    (error) => {
      console.error('Error in subscribeToMaterials:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, MATERIALS_COLLECTION);
    }
  );
}

/**
 * Creates a new Material procurement record
 * @param {Object} materialData
 * @param {Object} currentUser
 * @returns {Promise<Object>}
 */
export async function createMaterial(materialData, currentUser = null) {
  const validation = validateMaterialData(materialData);
  if (!validation.isValid) {
    const errorMsg = Object.values(validation.errors).join(', ');
    throw new Error(`Validation failed: ${errorMsg}`);
  }

  const materialId = await getNextMaterialId();
  const now = new Date().toISOString();

  const cleanedQuantity = typeof materialData.quantity === 'number' 
    ? String(materialData.quantity) 
    : String(materialData.quantity).trim();

  const payload = {
    materialId,
    date: materialData.date.trim(),
    projectId: materialData.projectId.trim(),
    projectName: (materialData.projectName || 'General / Unassigned Site').trim(),
    item: materialData.item.trim(),
    quantity: cleanedQuantity,
    agent: materialData.agent.trim(),
    amount: Number(materialData.amount) || 0,
    unit: (materialData.unit || '').trim() || null,
    ratePerUnit: materialData.ratePerUnit ? Number(materialData.ratePerUnit) : null,
    vehicleNumber: (materialData.vehicleNumber || '').trim() || null,
    challanNo: (materialData.challanNo || '').trim() || null,
    status: materialData.status || 'Received',
    notes: (materialData.notes || '').trim() || null,
    createdBy: currentUser?.email || currentUser?.uid || 'supervisor',
    createdAt: now,
    updatedAt: now
  };

  try {
    const docRef = doc(db, MATERIALS_COLLECTION, materialId);
    await setDoc(docRef, payload);
    return { id: materialId, ...payload };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${MATERIALS_COLLECTION}/${materialId}`);
    throw error;
  }
}

/**
 * Updates an existing Material record
 * @param {string} materialId
 * @param {Object} updates
 * @returns {Promise<Object>}
 */
export async function updateMaterial(materialId, updates) {
  if (!materialId) throw new Error('Material ID is required for update');

  const validation = validateMaterialData(updates);
  if (!validation.isValid) {
    const errorMsg = Object.values(validation.errors).join(', ');
    throw new Error(`Validation failed: ${errorMsg}`);
  }

  const cleanedQuantity = typeof updates.quantity === 'number' 
    ? String(updates.quantity) 
    : String(updates.quantity).trim();

  const payload = {
    date: updates.date.trim(),
    projectId: updates.projectId.trim(),
    projectName: (updates.projectName || 'General / Unassigned Site').trim(),
    item: updates.item.trim(),
    quantity: cleanedQuantity,
    agent: updates.agent.trim(),
    amount: Number(updates.amount) || 0,
    unit: (updates.unit || '').trim() || null,
    ratePerUnit: updates.ratePerUnit ? Number(updates.ratePerUnit) : null,
    vehicleNumber: (updates.vehicleNumber || '').trim() || null,
    challanNo: (updates.challanNo || '').trim() || null,
    status: updates.status || 'Received',
    notes: (updates.notes || '').trim() || null,
    updatedAt: new Date().toISOString()
  };

  try {
    const docRef = doc(db, MATERIALS_COLLECTION, materialId);
    await updateDoc(docRef, payload);
    return { id: materialId, ...payload };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${MATERIALS_COLLECTION}/${materialId}`);
    throw error;
  }
}

/**
 * Deletes a Material record
 * @param {string} materialId
 * @returns {Promise<void>}
 */
export async function deleteMaterial(materialId) {
  if (!materialId) throw new Error('Material ID is required for deletion');

  try {
    const docRef = doc(db, MATERIALS_COLLECTION, materialId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${MATERIALS_COLLECTION}/${materialId}`);
    throw error;
  }
}

/**
 * Seeds realistic Kerala road construction material procurement data if the collection is empty.
 * @param {Array} projects - Available active projects
 */
export async function seedSampleMaterialsIfEmpty(projects = []) {
  try {
    const snap = await getDocs(collection(db, MATERIALS_COLLECTION));
    if (!snap.empty) {
      return { seeded: false, count: snap.size };
    }

    const prj1 = projects[0] || { projectId: 'PRJ-101', projectName: 'Wayanad Ghat Road Retarring' };
    const prj2 = projects[1] || { projectId: 'PRJ-102', projectName: 'Kozhikode Bypass Drainage Works' };
    const prj3 = projects[2] || { projectId: 'PRJ-103', projectName: 'Palakkad Concrete Highway Stretch' };

    const today = new Date();
    const getDateStr = (offsetDays) => {
      const d = new Date(today);
      d.setDate(d.getDate() - offsetDays);
      return d.toISOString().split('T')[0];
    };

    const sampleMaterials = [
      {
        materialId: 'MAT-101',
        date: getDateStr(0),
        projectId: prj1.projectId,
        projectName: prj1.projectName,
        item: 'Bitumen VG-30 (Bulk Tanker)',
        quantity: '18 Tons',
        unit: 'Tons',
        agent: 'Malabar Bitumen Distributors, Kozhikode',
        amount: 882000,
        ratePerUnit: 49000,
        vehicleNumber: 'KL-11-BH-9821',
        challanNo: 'CH-2026/891',
        status: 'Received',
        notes: 'Supplied directly to hot mix plant site, quality certificate verified.'
      },
      {
        materialId: 'MAT-102',
        date: getDateStr(1),
        projectId: prj1.projectId,
        projectName: prj1.projectName,
        item: 'Aggregates 20mm (Blue Metal)',
        quantity: '6 Loads (Tipper)',
        unit: 'Loads',
        agent: 'Western Ghats Quarry Works',
        amount: 144000,
        ratePerUnit: 24000,
        vehicleNumber: 'KL-12-D-4512',
        challanNo: 'WGQ-5421',
        status: 'Received',
        notes: 'Crushed stone aggregate for asphalt wearing course.'
      },
      {
        materialId: 'MAT-103',
        date: getDateStr(2),
        projectId: prj1.projectId,
        projectName: prj1.projectName,
        item: 'M-Sand (Manufactured Sand)',
        quantity: '4 Loads',
        unit: 'Loads',
        agent: 'Royal Crushers & M-Sand, Nilambur',
        amount: 92000,
        ratePerUnit: 23000,
        vehicleNumber: 'KL-10-AZ-3301',
        challanNo: 'RC-1094',
        status: 'Paid',
        notes: 'High grade washed manufactured sand for bituminous base.'
      },
      {
        materialId: 'MAT-104',
        date: getDateStr(3),
        projectId: prj2.projectId,
        projectName: prj2.projectName,
        item: 'Cement UltraTech 53 Grade',
        quantity: '350 Bags',
        unit: 'Bags',
        agent: 'UltraTech Cement Regional C&F Agency',
        amount: 147000,
        ratePerUnit: 420,
        vehicleNumber: 'KL-11-AC-7890',
        challanNo: 'UT-KZD-8841',
        status: 'Paid',
        notes: 'For reinforced concrete storm water box culvert and drain walls.'
      },
      {
        materialId: 'MAT-105',
        date: getDateStr(4),
        projectId: prj2.projectId,
        projectName: prj2.projectName,
        item: 'Steel TMT Fe 500D (12mm/16mm)',
        quantity: '4.5 Tons',
        unit: 'Tons',
        agent: 'Kairali TMT Steel & Hardware Traders',
        amount: 279000,
        ratePerUnit: 62000,
        vehicleNumber: 'KL-10-M-6541',
        challanNo: 'KST-4412',
        status: 'Received',
        notes: 'Reinforcement bars for slab culverts across Kozhikode Bypass.'
      },
      {
        materialId: 'MAT-106',
        date: getDateStr(5),
        projectId: prj3.projectId,
        projectName: prj3.projectName,
        item: 'Granular Sub-Base (GSB)',
        quantity: '8 Loads',
        unit: 'Loads',
        agent: 'Kerala State Stone Crushers Syndicate',
        amount: 168000,
        ratePerUnit: 21000,
        vehicleNumber: 'KL-09-AK-5520',
        challanNo: 'KSC-7721',
        status: 'Paid',
        notes: 'Graded aggregate material for highway road foundation layer.'
      },
      {
        materialId: 'MAT-107',
        date: getDateStr(6),
        projectId: prj3.projectId,
        projectName: prj3.projectName,
        item: 'Precast Kerb Stones (Class A)',
        quantity: '400 Pieces',
        unit: 'Pieces',
        agent: 'Highland Infra & Quarry Suppliers',
        amount: 88000,
        ratePerUnit: 220,
        vehicleNumber: 'KL-09-Q-1144',
        challanNo: 'HI-901',
        status: 'Received',
        notes: 'Heavy duty road edge kerbs with chamfered profile.'
      }
    ];

    const now = new Date().toISOString();

    for (const item of sampleMaterials) {
      await setDoc(doc(db, MATERIALS_COLLECTION, item.materialId), {
        ...item,
        createdBy: 'system_bootstrap',
        createdAt: now,
        updatedAt: now
      });
    }

    // Set counter to 107
    await setDoc(
      doc(db, COUNTERS_COLLECTION, MATERIAL_COUNTER_DOC),
      {
        currentSeq: 107,
        updatedAt: now
      },
      { merge: true }
    );

    return { seeded: true, count: sampleMaterials.length };
  } catch (error) {
    console.error('Failed to seed sample materials:', error);
    return { seeded: false, error: error.message };
  }
}
