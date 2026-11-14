/**
 * Daily Wages Service - Firestore Database Operations
 * Implements atomic sequential WAG-101 ID generation, validation, CRUD, attendance tracking, leave advances,
 * and automatic synchronization with the Employee wage ledger.
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
  where,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './config.js';
import { getWagePaidAmount } from '../utils/wageCalculator.js';

const WAGES_COLLECTION = 'dailyWages';
const EMPLOYEES_COLLECTION = 'employees';
const PROJECTS_COLLECTION = 'projects';
const COUNTERS_COLLECTION = 'counters';
const WAGE_COUNTER_DOC = 'wages';

/**
 * Safely generates the next sequential Wage Entry ID (e.g. WAG-101, WAG-102)
 * using an atomic Firestore transaction.
 * @returns {Promise<string>}
 */
export async function getNextWageId() {
  const counterRef = doc(db, COUNTERS_COLLECTION, WAGE_COUNTER_DOC);

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

      let candidateId = `WAG-${nextSeq}`;
      let exists = true;
      let checkSeq = nextSeq;

      while (exists) {
        candidateId = `WAG-${checkSeq}`;
        const wageRef = doc(db, WAGES_COLLECTION, candidateId);
        const wageSnap = await transaction.get(wageRef);
        if (!wageSnap.exists()) {
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
    handleFirestoreError(error, OperationType.WRITE, `${COUNTERS_COLLECTION}/${WAGE_COUNTER_DOC}`);
    return `WAG-${Date.now().toString().slice(-4)}`;
  }
}

/**
 * Recalculates and updates an employee's pendingWages, paidWages, and totalWages
 * in Firestore based on all their daily wage entries.
 * @param {string} employeeId
 */
export async function syncEmployeeWages(employeeId) {
  if (!employeeId) return;

  try {
    const wageSnap = await getDocs(
      query(collection(db, WAGES_COLLECTION), where('employeeId', '==', employeeId))
    );

    let totalEarned = 0;
    let totalPaid = 0;
    let netPending = 0;

    wageSnap.docs.forEach((d) => {
      const entry = d.data();
      const wages = Number(entry.wages) || 0;
      const advance = Number(entry.advance) || 0;
      const balance = Number(entry.balance) !== undefined ? Number(entry.balance) : (wages - advance);
      const isLeave = entry.attendance === 'Absent / On Leave';
      const status = entry.status;

      if (isLeave) {
        totalPaid += advance;
        if (status !== 'Paid') {
          netPending -= advance;
        }
      } else if (status === 'Paid') {
        totalEarned += wages;
        totalPaid += wages;
      } else if (status === 'Pending') {
        totalEarned += wages;
        netPending += wages;
      } else {
        totalEarned += wages;
        totalPaid += advance;
        netPending += balance;
      }
    });

    const pendingWages = Math.max(0, Math.round(netPending * 100) / 100);
    const paidWages = Math.round(totalPaid * 100) / 100;
    const totalWages = Math.round(totalEarned * 100) / 100;

    const empRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
    const empSnap = await getDoc(empRef);

    if (empSnap.exists()) {
      await updateDoc(empRef, {
        pendingWages,
        paidWages,
        totalWages,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (err) {
    console.error(`Failed to sync wages for employee ${employeeId}:`, err);
  }
}

/**
 * Recalculates totalLabourExpenses and totalBudget for a specific project
 * based on all paid daily wages (status === 'Paid' or site advances) recorded in Firestore.
 * @param {string} projectId
 */
export async function syncProjectLabourExpenses(projectId) {
  if (!projectId || projectId === 'GENERAL') return;

  try {
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    const projSnap = await getDoc(projectRef);
    if (!projSnap.exists()) return;

    const wageSnap = await getDocs(
      query(collection(db, WAGES_COLLECTION), where('projectId', '==', projectId))
    );

    let totalLabourPaid = 0;
    wageSnap.docs.forEach((d) => {
      const entry = d.data();
      totalLabourPaid += getWagePaidAmount(entry);
    });

    const projectData = projSnap.data();
    const otherExp = Number(projectData.otherTotalExpenses) || 0;
    const totalBudget = otherExp + totalLabourPaid;

    await updateDoc(projectRef, {
      totalLabourExpenses: totalLabourPaid,
      totalBudget: totalBudget,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.warn(`Could not sync project labour expenses for ${projectId}:`, error);
  }
}

/**
 * Creates a new Daily Wage entry in Firestore
 * Automatically synchronizes with the Employee's wage totals
 * @param {Object} wageData
 * @param {Object|null} user
 * @returns {Promise<Object>}
 */
export async function createDailyWage(wageData, user = null) {
  try {
    let wageId = wageData.wageId?.trim();
    if (!wageId) {
      wageId = await getNextWageId();
    }

    const attendance = wageData.attendance || 'Present';
    let wages = Number(wageData.wages) || 0;
    if (attendance === 'Absent / On Leave') {
      wages = 0;
    }

    const advance = Number(wageData.advance) || 0;
    const balance = Math.round((wages - advance) * 100) / 100;

    // Automatic status determination if not specified
    let status = wageData.status;
    if (!status) {
      if (attendance === 'Absent / On Leave') {
        status = advance > 0 ? 'Advance on Leave' : 'Pending';
      } else if (balance <= 0) {
        status = 'Paid';
      } else if (advance > 0) {
        status = 'Partial';
      } else {
        status = 'Pending';
      }
    }

    const newWageEntry = {
      wageId,
      date: wageData.date,
      employeeId: wageData.employeeId,
      employeeName: wageData.employeeName.trim(),
      employeeRole: wageData.employeeRole || 'Worker',
      projectId: wageData.projectId || 'GENERAL',
      projectName: wageData.projectName.trim(),
      attendance,
      wages,
      advance,
      balance,
      status,
      notes: wageData.notes?.trim() || '',
      createdBy: user?.email || user?.uid || 'Site Supervisor',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = doc(db, WAGES_COLLECTION, wageId);
    await setDoc(docRef, newWageEntry);

    // Sync employee wage totals in background
    syncEmployeeWages(wageData.employeeId);

    // Sync project total labour expenses if linked to a project
    if (wageData.projectId && wageData.projectId !== 'GENERAL') {
      syncProjectLabourExpenses(wageData.projectId);
    }

    return { id: wageId, ...newWageEntry };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, WAGES_COLLECTION);
    throw error;
  }
}

/**
 * Updates an existing Daily Wage entry in Firestore
 * @param {string} wageId
 * @param {Object} wageData
 * @param {Object|null} user
 * @returns {Promise<void>}
 */
export async function updateDailyWage(wageId, wageData, user = null) {
  try {
    const docRef = doc(db, WAGES_COLLECTION, wageId);
    const existingSnap = await getDoc(docRef);
    const prevProjectId = existingSnap.exists() ? existingSnap.data().projectId : null;

    const attendance = wageData.attendance || 'Present';
    let wages = Number(wageData.wages) || 0;
    if (attendance === 'Absent / On Leave') {
      wages = 0;
    }

    const advance = Number(wageData.advance) || 0;
    const balance = Math.round((wages - advance) * 100) / 100;

    let status = wageData.status;
    if (!status) {
      if (attendance === 'Absent / On Leave') {
        status = advance > 0 ? 'Advance on Leave' : 'Pending';
      } else if (balance <= 0) {
        status = 'Paid';
      } else if (advance > 0) {
        status = 'Partial';
      } else {
        status = 'Pending';
      }
    }

    const updatePayload = {
      date: wageData.date,
      employeeId: wageData.employeeId,
      employeeName: wageData.employeeName.trim(),
      employeeRole: wageData.employeeRole || 'Worker',
      projectId: wageData.projectId || 'GENERAL',
      projectName: wageData.projectName.trim(),
      attendance,
      wages,
      advance,
      balance,
      status,
      notes: wageData.notes?.trim() || '',
      updatedAt: new Date().toISOString()
    };

    if (user?.email) {
      updatePayload.updatedBy = user.email;
    }

    await updateDoc(docRef, updatePayload);

    // Sync employee wage totals
    syncEmployeeWages(wageData.employeeId);

    // Sync project total labour expenses
    if (wageData.projectId && wageData.projectId !== 'GENERAL') {
      syncProjectLabourExpenses(wageData.projectId);
    }
    if (prevProjectId && prevProjectId !== wageData.projectId && prevProjectId !== 'GENERAL') {
      syncProjectLabourExpenses(prevProjectId);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${WAGES_COLLECTION}/${wageId}`);
    throw error;
  }
}

/**
 * Marks a wage record as fully Settled / Paid
 * @param {string} wageId
 * @param {Object|null} user
 */
export async function settleDailyWage(wageId, user = null) {
  try {
    const docRef = doc(db, WAGES_COLLECTION, wageId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;

    const data = snap.data();

    // Only update status to Paid - do NOT overwrite advance or balance
    await updateDoc(docRef, {
      status: 'Paid',
      updatedAt: new Date().toISOString(),
      settledBy: user?.email || 'Supervisor'
    });

    syncEmployeeWages(data.employeeId);
    if (data.projectId && data.projectId !== 'GENERAL') {
      syncProjectLabourExpenses(data.projectId);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${WAGES_COLLECTION}/${wageId}`);
    throw error;
  }
}

/**
 * Deletes a Daily Wage entry
 * @param {string} wageId
 * @returns {Promise<void>}
 */
export async function deleteDailyWage(wageId) {
  try {
    const docRef = doc(db, WAGES_COLLECTION, wageId);
    const snap = await getDoc(docRef);
    const employeeId = snap.exists() ? snap.data().employeeId : null;
    const projectId = snap.exists() ? snap.data().projectId : null;

    await deleteDoc(docRef);

    if (employeeId) {
      syncEmployeeWages(employeeId);
    }
    if (projectId && projectId !== 'GENERAL') {
      syncProjectLabourExpenses(projectId);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${WAGES_COLLECTION}/${wageId}`);
    throw error;
  }
}

/**
 * Subscribes to real-time updates on the dailyWages collection
 * @param {Function} onWagesUpdated
 * @param {Function} onError
 * @returns {Function} Unsubscribe function
 */
export function subscribeToDailyWages(onWagesUpdated, onError) {
  const wagesRef = collection(db, WAGES_COLLECTION);
  const q = query(wagesRef, orderBy('date', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const wageEntries = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      onWagesUpdated(wageEntries);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, WAGES_COLLECTION);
      if (onError) onError(error);
    }
  );
}

/**
 * Seeds initial Kerala construction daily wage muster entries if empty.
 * @param {Array} employees
 * @param {Array} projects
 * @param {Object|null} user
 */
export async function seedSampleDailyWagesIfEmpty(employees = [], projects = [], user = null) {
  try {
    const snap = await getDocs(collection(db, WAGES_COLLECTION));
    if (!snap.empty) {
      return false;
    }

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const p1 = projects[0] || { projectId: 'PRJ-101', projectName: 'Aluva - Perumbavoor Road Widening & BMBC Tarring' };
    const p2 = projects[1] || { projectId: 'PRJ-102', projectName: 'Angamaly Bypass Stormwater Concrete Drainage & Culverts' };

    const initialWages = [
      {
        wageId: 'WAG-101',
        date: today,
        employeeId: 'EMP-101',
        employeeName: 'Suresh Kumar K.',
        employeeRole: 'Supervisor',
        projectId: p1.projectId,
        projectName: p1.projectName,
        attendance: 'Present',
        wages: 1200,
        advance: 200,
        balance: 1000,
        status: 'Partial',
        notes: 'Full shift supervision on Aluva chainage 0/400. Site advance ₹200 paid.',
        createdBy: user?.email || 'Site Supervisor',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        wageId: 'WAG-102',
        date: today,
        employeeId: 'EMP-102',
        employeeName: 'Manoj Varghese',
        employeeRole: 'Driver',
        projectId: p1.projectId,
        projectName: p1.projectName,
        attendance: 'Present',
        wages: 1000,
        advance: 1000,
        balance: 0,
        status: 'Paid',
        notes: 'Tipper truck bitumen transportation from quarry. Wage settled in full.',
        createdBy: user?.email || 'Site Supervisor',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        wageId: 'WAG-103',
        date: today,
        employeeId: 'EMP-103',
        employeeName: 'Abdul Rasheed',
        employeeRole: 'Heavy Machinery Operator',
        projectId: p2.projectId,
        projectName: p2.projectName,
        attendance: 'Half Day',
        wages: 700,
        advance: 200,
        balance: 500,
        status: 'Partial',
        notes: 'Morning shift excavator trenching for culvert box. Half day worked.',
        createdBy: user?.email || 'Site Supervisor',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        // Special scenario: absent worker given an advance of ₹300!
        wageId: 'WAG-104',
        date: today,
        employeeId: 'EMP-105',
        employeeName: 'Vijayan P.K.',
        employeeRole: 'Paver Operator',
        projectId: p1.projectId,
        projectName: p1.projectName,
        attendance: 'Absent / On Leave',
        wages: 0,
        advance: 300,
        balance: -300,
        status: 'Advance on Leave',
        notes: 'Worker on leave today (family illness). Requested ₹300 emergency site advance, approved and paid.',
        createdBy: user?.email || 'Site Supervisor',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        wageId: 'WAG-105',
        date: yesterday,
        employeeId: 'EMP-104',
        employeeName: 'Pradeep Chandran',
        employeeRole: 'Site Engineer',
        projectId: p2.projectId,
        projectName: p2.projectName,
        attendance: 'Present',
        wages: 1800,
        advance: 0,
        balance: 1800,
        status: 'Pending',
        notes: 'Levels checking and concrete slump test inspection. Full wage pending settlement.',
        createdBy: user?.email || 'Site Supervisor',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      // 6 Days for employee Babu
      {
        wageId: 'WAG-106',
        date: '2026-11-01',
        employeeId: 'EMP-106',
        employeeName: 'Babu',
        employeeRole: 'Mason & Road Worker',
        projectId: p1.projectId,
        projectName: p1.projectName,
        attendance: 'Present',
        wages: 1000,
        advance: 0,
        balance: 1000,
        status: 'Pending',
        notes: 'Road base leveling and grading on chainage 1/200.',
        createdBy: user?.email || 'Site Supervisor',
        createdAt: new Date('2026-11-01T08:00:00Z').toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        wageId: 'WAG-107',
        date: '2026-11-02',
        employeeId: 'EMP-106',
        employeeName: 'Babu',
        employeeRole: 'Mason & Road Worker',
        projectId: p1.projectId,
        projectName: p1.projectName,
        attendance: 'Present',
        wages: 1000,
        advance: 200,
        balance: 800,
        status: 'Partial',
        notes: 'Curb stone laying work. Took ₹200 site cash advance.',
        createdBy: user?.email || 'Site Supervisor',
        createdAt: new Date('2026-11-02T08:00:00Z').toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        wageId: 'WAG-108',
        date: '2026-11-03',
        employeeId: 'EMP-106',
        employeeName: 'Babu',
        employeeRole: 'Mason & Road Worker',
        projectId: p1.projectId,
        projectName: p1.projectName,
        attendance: 'Present',
        wages: 1000,
        advance: 0,
        balance: 1000,
        status: 'Pending',
        notes: 'Bitumen emulsion tack coat spraying assistance.',
        createdBy: user?.email || 'Site Supervisor',
        createdAt: new Date('2026-11-03T08:00:00Z').toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        wageId: 'WAG-109',
        date: '2026-11-04',
        employeeId: 'EMP-106',
        employeeName: 'Babu',
        employeeRole: 'Mason & Road Worker',
        projectId: p1.projectId,
        projectName: p1.projectName,
        attendance: 'Present',
        wages: 1000,
        advance: 0,
        balance: 1000,
        status: 'Pending',
        notes: 'Drainage slab shuttering and concrete pouring.',
        createdBy: user?.email || 'Site Supervisor',
        createdAt: new Date('2026-11-04T08:00:00Z').toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        wageId: 'WAG-110',
        date: '2026-11-05',
        employeeId: 'EMP-106',
        employeeName: 'Babu',
        employeeRole: 'Mason & Road Worker',
        projectId: p1.projectId,
        projectName: p1.projectName,
        attendance: 'Half Day',
        wages: 500,
        advance: 0,
        balance: 500,
        status: 'Pending',
        notes: 'Morning half day shift worked on pedestrian walkway.',
        createdBy: user?.email || 'Site Supervisor',
        createdAt: new Date('2026-11-05T08:00:00Z').toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        wageId: 'WAG-111',
        date: '2026-11-06',
        employeeId: 'EMP-106',
        employeeName: 'Babu',
        employeeRole: 'Mason & Road Worker',
        projectId: p1.projectId,
        projectName: p1.projectName,
        attendance: 'Present',
        wages: 1000,
        advance: 300,
        balance: 700,
        status: 'Partial',
        notes: 'Culvert wing wall plastering. Took ₹300 advance.',
        createdBy: user?.email || 'Site Supervisor',
        createdAt: new Date('2026-11-06T08:00:00Z').toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const wage of initialWages) {
      await setDoc(doc(db, WAGES_COLLECTION, wage.wageId), wage);
      await syncEmployeeWages(wage.employeeId);
    }

    const counterRef = doc(db, COUNTERS_COLLECTION, WAGE_COUNTER_DOC);
    await setDoc(counterRef, {
      currentSeq: 111,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return true;
  } catch (error) {
    console.error('Error seeding initial daily wages:', error);
    return false;
  }
}
