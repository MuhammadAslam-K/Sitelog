/**
 * Daily Expenses Service - Firestore Database Operations
 * Implements atomic sequential EXP-101 ID generation, validation, CRUD, category breakdown,
 * and project expense aggregations for Kerala Road Infrastructure Operations.
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

const EXPENSES_COLLECTION = 'dailyExpenses';
const PROJECTS_COLLECTION = 'projects';
const COUNTERS_COLLECTION = 'counters';
const EXPENSE_COUNTER_DOC = 'expenses';

export const VALID_EXPENSE_CATEGORIES = ['vehicle', 'material', 'fuel', 'food', 'other'];

/**
 * Safely generates the next sequential Expense ID (e.g. EXP-101, EXP-102)
 * using an atomic Firestore transaction on the counters collection.
 * @returns {Promise<string>}
 */
export async function getNextExpenseId() {
  const counterRef = doc(db, COUNTERS_COLLECTION, EXPENSE_COUNTER_DOC);

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

      let candidateId = `EXP-${nextSeq}`;
      let exists = true;
      let checkSeq = nextSeq;

      while (exists) {
        candidateId = `EXP-${checkSeq}`;
        const expenseRef = doc(db, EXPENSES_COLLECTION, candidateId);
        const expenseSnap = await transaction.get(expenseRef);
        if (!expenseSnap.exists()) {
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
    handleFirestoreError(error, OperationType.WRITE, `${COUNTERS_COLLECTION}/${EXPENSE_COUNTER_DOC}`);
    return `EXP-${Date.now().toString().slice(-4)}`;
  }
}

/**
 * Recalculates otherTotalExpenses for a specific project based on all dailyExpenses recorded.
 * @param {string} projectId
 */
export async function syncProjectExpenses(projectId) {
  if (!projectId || projectId === 'GENERAL') return;

  try {
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    const projSnap = await getDoc(projectRef);
    if (!projSnap.exists()) return;

    const allExpensesSnap = await getDocs(collection(db, EXPENSES_COLLECTION));
    let totalOther = 0;

    allExpensesSnap.docs.forEach((d) => {
      const exp = d.data();
      if (exp.projectId === projectId) {
        totalOther += Number(exp.amount) || 0;
      }
    });

    const projectData = projSnap.data();
    const totalLabour = Number(projectData.totalLabourExpenses) || 0;
    const totalBudget = totalOther + totalLabour;

    await updateDoc(projectRef, {
      otherTotalExpenses: totalOther,
      totalBudget: totalBudget,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.warn(`Could not sync project expenses for ${projectId}:`, error);
  }
}

/**
 * Validates expense payload
 * @param {Object} data
 */
export function validateExpenseData(data) {
  const errors = [];

  if (!data.date || typeof data.date !== 'string') {
    errors.push('A valid date is required.');
  }

  if (!data.projectId || typeof data.projectId !== 'string') {
    errors.push('A project selection is required.');
  }

  // Normalize fuel/fueil
  let normalizedCategory = (data.category || '').toLowerCase().trim();
  if (normalizedCategory === 'fueil') normalizedCategory = 'fuel';

  if (!VALID_EXPENSE_CATEGORIES.includes(normalizedCategory)) {
    errors.push(`Category must be one of: ${VALID_EXPENSE_CATEGORIES.join(', ')}.`);
  }

  if (!data.item || typeof data.item !== 'string' || data.item.trim().length === 0) {
    errors.push('Expense item description is required.');
  }

  const numAmount = Number(data.amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    errors.push('Amount must be a valid positive number greater than 0.');
  }

  // Note: quantity and agent are optional as specified by user
  return {
    isValid: errors.length === 0,
    errors,
    normalizedCategory
  };
}

/**
 * Creates a new daily expense record in Firestore
 * @param {Object} expenseData
 * @param {Object} currentUser
 * @returns {Promise<string>} Created expense ID
 */
export async function createExpense(expenseData, currentUser) {
  const { isValid, errors, normalizedCategory } = validateExpenseData(expenseData);
  if (!isValid) {
    throw new Error(errors.join(' '));
  }

  let finalExpenseId = expenseData.expenseId;
  if (!finalExpenseId || typeof finalExpenseId !== 'string' || !finalExpenseId.startsWith('EXP-')) {
    finalExpenseId = await getNextExpenseId();
  }

  const timestamp = new Date().toISOString();
  const docRef = doc(db, EXPENSES_COLLECTION, finalExpenseId);

  const cleanQuantity = expenseData.quantity !== undefined && expenseData.quantity !== null && String(expenseData.quantity).trim() !== ''
    ? String(expenseData.quantity).trim()
    : null;

  const cleanAgent = expenseData.agent !== undefined && expenseData.agent !== null && String(expenseData.agent).trim() !== ''
    ? String(expenseData.agent).trim()
    : null;

  const payload = {
    expenseId: finalExpenseId,
    date: expenseData.date.trim(),
    projectId: expenseData.projectId.trim(),
    projectName: expenseData.projectName ? expenseData.projectName.trim() : 'General Overhead',
    category: normalizedCategory,
    item: expenseData.item.trim(),
    amount: Math.round(Number(expenseData.amount) * 100) / 100,
    quantity: cleanQuantity,
    agent: cleanAgent,
    notes: expenseData.notes ? expenseData.notes.trim() : '',
    createdBy: currentUser?.email || currentUser?.uid || 'Site Supervisor',
    createdAt: timestamp,
    updatedAt: timestamp
  };

  try {
    await setDoc(docRef, payload);

    // Sync project total other expenses if linked to a project
    if (payload.projectId && payload.projectId !== 'GENERAL') {
      await syncProjectExpenses(payload.projectId);
    }

    return finalExpenseId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${EXPENSES_COLLECTION}/${finalExpenseId}`);
    throw error;
  }
}

/**
 * Updates an existing expense record in Firestore
 * @param {string} expenseId
 * @param {Object} expenseData
 * @param {Object} currentUser
 */
export async function updateExpense(expenseId, expenseData, currentUser) {
  if (!expenseId) throw new Error('Expense ID is required for update.');

  const { isValid, errors, normalizedCategory } = validateExpenseData(expenseData);
  if (!isValid) {
    throw new Error(errors.join(' '));
  }

  const docRef = doc(db, EXPENSES_COLLECTION, expenseId);
  const oldSnap = await getDoc(docRef);
  const oldProjectId = oldSnap.exists() ? oldSnap.data().projectId : null;

  const cleanQuantity = expenseData.quantity !== undefined && expenseData.quantity !== null && String(expenseData.quantity).trim() !== ''
    ? String(expenseData.quantity).trim()
    : null;

  const cleanAgent = expenseData.agent !== undefined && expenseData.agent !== null && String(expenseData.agent).trim() !== ''
    ? String(expenseData.agent).trim()
    : null;

  const payload = {
    expenseId,
    date: expenseData.date.trim(),
    projectId: expenseData.projectId.trim(),
    projectName: expenseData.projectName ? expenseData.projectName.trim() : 'General Overhead',
    category: normalizedCategory,
    item: expenseData.item.trim(),
    amount: Math.round(Number(expenseData.amount) * 100) / 100,
    quantity: cleanQuantity,
    agent: cleanAgent,
    notes: expenseData.notes ? expenseData.notes.trim() : '',
    updatedAt: new Date().toISOString()
  };

  try {
    await updateDoc(docRef, payload);

    // Sync old and new project totals if changed
    if (oldProjectId && oldProjectId !== payload.projectId) {
      await syncProjectExpenses(oldProjectId);
    }
    if (payload.projectId && payload.projectId !== 'GENERAL') {
      await syncProjectExpenses(payload.projectId);
    }

    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${EXPENSES_COLLECTION}/${expenseId}`);
    throw error;
  }
}

/**
 * Deletes an expense entry from Firestore
 * @param {string} expenseId
 */
export async function deleteExpense(expenseId) {
  if (!expenseId) throw new Error('Expense ID is required for deletion.');

  const docRef = doc(db, EXPENSES_COLLECTION, expenseId);

  try {
    const snap = await getDoc(docRef);
    const projectId = snap.exists() ? snap.data().projectId : null;

    await deleteDoc(docRef);

    if (projectId && projectId !== 'GENERAL') {
      await syncProjectExpenses(projectId);
    }

    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${EXPENSES_COLLECTION}/${expenseId}`);
    throw error;
  }
}

/**
 * Sets up a real-time subscription to the dailyExpenses collection
 * @param {Function} onExpensesUpdated
 * @param {Function} onError
 * @returns {Function} Unsubscribe function
 */
export function subscribeToExpenses(onExpensesUpdated, onError) {
  const expensesQuery = query(
    collection(db, EXPENSES_COLLECTION),
    orderBy('date', 'desc')
  );

  return onSnapshot(
    expensesQuery,
    (snapshot) => {
      const expenses = snapshot.docs.map((docSnap) => ({
        ...docSnap.data(),
        id: docSnap.id
      }));
      onExpensesUpdated(expenses);
    },
    (error) => {
      console.error('Realtime Daily Expenses subscription error: ', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Seeds sample daily expenses for realistic Kerala road infrastructure projects
 * @param {Array} projects Available projects
 * @param {Object} currentUser Active user
 */
export async function seedSampleExpensesIfEmpty(projects = [], currentUser = null) {
  try {
    const existingSnap = await getDocs(collection(db, EXPENSES_COLLECTION));
    if (!existingSnap.empty) {
      return 0; // Already has records
    }

    const prj1 = projects[0] || { projectId: 'PRJ-101', projectName: 'Aluva - Perumbavoor Road Tarring' };
    const prj2 = projects[1] || { projectId: 'PRJ-102', projectName: 'Angamaly Bypass Drainage & Metalling' };
    const prj3 = projects[2] || { projectId: 'PRJ-103', projectName: 'Kochi Smart City Link Road Concreting' };

    const today = new Date();
    const getDateStr = (offsetDays) => {
      const d = new Date(today);
      d.setDate(d.getDate() - offsetDays);
      return d.toISOString().split('T')[0];
    };

    const sampleRecords = [
      {
        expenseId: 'EXP-101',
        date: getDateStr(0),
        projectId: prj1.projectId,
        projectName: prj1.projectName,
        category: 'fuel',
        item: 'Diesel for Tata 1618 Tipper (KL-07-CD-4512)',
        amount: 5400,
        quantity: '60 Litres',
        agent: 'IOCL Fuel Station Aluva',
        notes: 'Full tank for morning bitumen haulage'
      },
      {
        expenseId: 'EXP-102',
        date: getDateStr(0),
        projectId: prj1.projectId,
        projectName: prj1.projectName,
        category: 'food',
        item: 'Site workforce lunch, afternoon tea & snacks',
        amount: 2450,
        quantity: '18 Meals',
        agent: 'Hotel Saravana Bhavan',
        notes: '12 labourers + 4 machine operators + 2 supervisors'
      },
      {
        expenseId: 'EXP-103',
        date: getDateStr(1),
        projectId: prj1.projectId,
        projectName: prj1.projectName,
        category: 'material',
        item: 'VG-30 Bulk Bitumen 60/70 Grade',
        amount: 38500,
        quantity: '2 Barrels',
        agent: 'BPCL Kochi Refinery Terminal',
        notes: 'Challan #BPCL-7824 for surface coat'
      },
      {
        expenseId: 'EXP-104',
        date: getDateStr(1),
        projectId: prj2.projectId,
        projectName: prj2.projectName,
        category: 'vehicle',
        item: 'JCB 3DX hydraulic hose replacement & grease',
        amount: 3800,
        quantity: '2 Hoses',
        agent: 'Southern Auto Spares & Hydraulics',
        notes: 'Emergency breakdown repair at chainage 2+400'
      },
      {
        expenseId: 'EXP-105',
        date: getDateStr(2),
        projectId: prj2.projectId,
        projectName: prj2.projectName,
        category: 'material',
        item: '20mm crushed stone aggregate (metal)',
        amount: 18500,
        quantity: '3 Tipper Loads',
        agent: 'Perumbavoor Blue Metal Crusher',
        notes: 'For wet mix macadam sub-base'
      },
      {
        expenseId: 'EXP-106',
        date: getDateStr(2),
        projectId: prj3.projectId,
        projectName: prj3.projectName,
        category: 'other',
        item: 'Reflective traffic cones & hazard warning blinkers',
        amount: 4200,
        quantity: '10 Cones + 2 Lights',
        agent: 'Safety Plus Equipment Kochi',
        notes: 'PWD mandated safety setup for night lane diversion'
      },
      {
        expenseId: 'EXP-107',
        date: getDateStr(3),
        projectId: prj3.projectId,
        projectName: prj3.projectName,
        category: 'fuel',
        item: 'Diesel for Volvo Road Paver & Vibro Roller',
        amount: 7200,
        quantity: '80 Litres',
        agent: 'HPCL Pump Kakkanad',
        notes: 'Paver continuous run for 400m stretch'
      },
      {
        expenseId: 'EXP-108',
        date: getDateStr(4),
        projectId: prj1.projectId,
        projectName: prj1.projectName,
        category: 'vehicle',
        item: 'Tipper truck front left tyre puncture & vulcanizing',
        amount: 950,
        quantity: null,
        agent: 'Kuttan Vulcanizing Works',
        notes: 'Tyre tube patch work'
      }
    ];

    const timestamp = new Date().toISOString();
    let count = 0;

    for (const item of sampleRecords) {
      await setDoc(doc(db, EXPENSES_COLLECTION, item.expenseId), {
        ...item,
        createdBy: currentUser?.email || 'System Seed',
        createdAt: timestamp,
        updatedAt: timestamp
      });
      count++;
    }

    // Set counter to 109
    await setDoc(
      doc(db, COUNTERS_COLLECTION, EXPENSE_COUNTER_DOC),
      {
        currentSeq: 108,
        updatedAt: timestamp
      },
      { merge: true }
    );

    // Sync project totals
    await syncProjectExpenses(prj1.projectId);
    await syncProjectExpenses(prj2.projectId);
    await syncProjectExpenses(prj3.projectId);

    return count;
  } catch (error) {
    console.error('Error seeding sample expenses:', error);
    return 0;
  }
}
