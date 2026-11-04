/**
 * Employee Service - Firestore Database Operations
 * Implements atomic sequential EMP-101 ID generation, validation, CRUD, and realtime subscriptions.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  runTransaction,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './config.js';

const EMPLOYEES_COLLECTION = 'employees';
const COUNTERS_COLLECTION = 'counters';
const EMPLOYEE_COUNTER_DOC = 'employees';

/**
 * Safely generates the next sequential Employee ID (e.g. EMP-101, EMP-102)
 * using an atomic Firestore transaction.
 * @returns {Promise<string>}
 */
export async function getNextEmployeeId() {
  const counterRef = doc(db, COUNTERS_COLLECTION, EMPLOYEE_COUNTER_DOC);

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

      // Check if employee with candidate ID already exists, if so increment
      let candidateId = `EMP-${nextSeq}`;
      let exists = true;
      let checkSeq = nextSeq;

      while (exists) {
        candidateId = `EMP-${checkSeq}`;
        const empRef = doc(db, EMPLOYEES_COLLECTION, candidateId);
        const empSnap = await transaction.get(empRef);
        if (!empSnap.exists()) {
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
    handleFirestoreError(error, OperationType.WRITE, `${COUNTERS_COLLECTION}/${EMPLOYEE_COUNTER_DOC}`);
    return `EMP-${Date.now().toString().slice(-4)}`;
  }
}

/**
 * Creates a new Employee record in Firestore
 * @param {Object} employeeData
 * @param {Object|null} user
 * @returns {Promise<Object>}
 */
export async function createEmployee(employeeData, user = null) {
  try {
    let employeeId = employeeData.employeeId?.trim();
    if (!employeeId) {
      employeeId = await getNextEmployeeId();
    }

    const pending = Number(employeeData.pendingWages) || 0;
    const paid = Number(employeeData.paidWages) || 0;
    const total = Math.round((pending + paid) * 100) / 100;
    const dailyWageRate = Number(employeeData.dailyWageRate) || 0;

    const newEmployee = {
      employeeId,
      name: employeeData.name.trim(),
      phone: employeeData.phone.trim(),
      role: employeeData.role,
      joiningDate: employeeData.joiningDate,
      dailyWageRate,
      status: employeeData.status || 'Active',
      pendingWages: pending,
      paidWages: paid,
      totalWages: total,
      isArchived: false,
      createdBy: user?.email || user?.uid || 'HR Admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
    await setDoc(docRef, newEmployee);

    return { id: employeeId, ...newEmployee };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, EMPLOYEES_COLLECTION);
    throw error;
  }
}

/**
 * Updates an existing employee in Firestore
 * @param {string} employeeId
 * @param {Object} employeeData
 * @param {Object|null} user
 * @returns {Promise<void>}
 */
export async function updateEmployee(employeeId, employeeData, user = null) {
  try {
    const docRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
    const pending = Number(employeeData.pendingWages) || 0;
    const paid = Number(employeeData.paidWages) || 0;
    const total = Math.round((pending + paid) * 100) / 100;
    const dailyWageRate = Number(employeeData.dailyWageRate) || 0;

    const updatePayload = {
      name: employeeData.name.trim(),
      phone: employeeData.phone.trim(),
      role: employeeData.role,
      joiningDate: employeeData.joiningDate,
      dailyWageRate,
      status: employeeData.status,
      pendingWages: pending,
      paidWages: paid,
      totalWages: total,
      updatedAt: new Date().toISOString()
    };

    if (user?.email) {
      updatePayload.updatedBy = user.email;
    }

    await updateDoc(docRef, updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${EMPLOYEES_COLLECTION}/${employeeId}`);
    throw error;
  }
}

/**
 * Toggles an employee's archive status (soft delete to preserve future wage linkages)
 * @param {string} employeeId
 * @param {boolean} isArchived
 * @param {Object|null} user
 * @returns {Promise<void>}
 */
export async function toggleArchiveEmployee(employeeId, isArchived, user = null) {
  try {
    const docRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
    await updateDoc(docRef, {
      isArchived,
      updatedAt: new Date().toISOString(),
      archivedBy: isArchived ? (user?.email || 'Admin') : null
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${EMPLOYEES_COLLECTION}/${employeeId}`);
    throw error;
  }
}

/**
 * Subscribes to real-time updates on the employees collection
 * @param {Function} onEmployeesUpdated
 * @param {Function} onError
 * @returns {Function} Unsubscribe function
 */
export function subscribeToEmployees(onEmployeesUpdated, onError) {
  const employeesRef = collection(db, EMPLOYEES_COLLECTION);
  const q = query(employeesRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const employees = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      onEmployeesUpdated(employees);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, EMPLOYEES_COLLECTION);
      if (onError) onError(error);
    }
  );
}

/**
 * Seeds initial Kerala construction roadwork employees if collection is empty
 * @param {Object|null} user
 */
export async function seedSampleEmployeesIfEmpty(user = null) {
  try {
    const snap = await getDocs(collection(db, EMPLOYEES_COLLECTION));
    if (!snap.empty) {
      return false;
    }

    const initialEmployees = [
      {
        employeeId: 'EMP-101',
        name: 'Suresh Kumar K.',
        phone: '+91 94471 23456',
        role: 'Supervisor',
        joiningDate: '2025-06-01',
        dailyWageRate: 1200,
        status: 'Active',
        pendingWages: 14400,
        paidWages: 180000,
        totalWages: 194400,
        isArchived: false,
        createdBy: user?.email || 'HR Admin',
        createdAt: new Date('2025-06-01T09:00:00Z').toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        employeeId: 'EMP-102',
        name: 'Manoj Varghese',
        phone: '+91 98460 78912',
        role: 'Driver',
        joiningDate: '2025-08-15',
        dailyWageRate: 1000,
        status: 'Active',
        pendingWages: 8000,
        paidWages: 142000,
        totalWages: 150000,
        isArchived: false,
        createdBy: user?.email || 'HR Admin',
        createdAt: new Date('2025-08-15T09:00:00Z').toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        employeeId: 'EMP-103',
        name: 'Abdul Rasheed',
        phone: '+91 97455 33211',
        role: 'Heavy Machinery Operator',
        joiningDate: '2025-09-10',
        dailyWageRate: 1400,
        status: 'Active',
        pendingWages: 11200,
        paidWages: 168000,
        totalWages: 179200,
        isArchived: false,
        createdBy: user?.email || 'HR Admin',
        createdAt: new Date('2025-09-10T09:00:00Z').toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        employeeId: 'EMP-104',
        name: 'Pradeep Chandran',
        phone: '+91 94950 44556',
        role: 'Site Engineer',
        joiningDate: '2025-05-10',
        dailyWageRate: 1800,
        status: 'Active',
        pendingWages: 18000,
        paidWages: 270000,
        totalWages: 288000,
        isArchived: false,
        createdBy: user?.email || 'HR Admin',
        createdAt: new Date('2025-05-10T09:00:00Z').toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        employeeId: 'EMP-105',
        name: 'Vijayan P.K.',
        phone: '+91 96055 88990',
        role: 'Paver Operator',
        joiningDate: '2025-10-01',
        dailyWageRate: 1100,
        status: 'Active',
        pendingWages: 0,
        paidWages: 99000,
        totalWages: 99000,
        isArchived: false,
        createdBy: user?.email || 'HR Admin',
        createdAt: new Date('2025-10-01T09:00:00Z').toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        employeeId: 'EMP-106',
        name: 'Babu',
        phone: '+91 98472 55667',
        role: 'Mason & Road Worker',
        joiningDate: '2025-11-01',
        dailyWageRate: 1000,
        status: 'Active',
        pendingWages: 5000,
        paidWages: 1000,
        totalWages: 6000,
        isArchived: false,
        createdBy: user?.email || 'HR Admin',
        createdAt: new Date('2025-11-01T09:00:00Z').toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const emp of initialEmployees) {
      await setDoc(doc(db, EMPLOYEES_COLLECTION, emp.employeeId), emp);
    }

    const counterRef = doc(db, COUNTERS_COLLECTION, EMPLOYEE_COUNTER_DOC);
    await setDoc(counterRef, {
      currentSeq: 106,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return true;
  } catch (error) {
    console.error('Error seeding initial employees:', error);
    return false;
  }
}
