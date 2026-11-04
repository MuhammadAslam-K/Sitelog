/**
 * Project Service - Firestore Database Operations
 * Implements atomic sequential ID generation, schema validation, CRUD, and realtime subscriptions.
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
import { calculateTotalBudget } from '../utils/formatters.js';

const PROJECTS_COLLECTION = 'projects';
const COUNTERS_COLLECTION = 'counters';
const PROJECT_COUNTER_DOC = 'projects';

/**
 * Safely generates the next sequential Project ID (e.g. PRJ-101, PRJ-102)
 * using an atomic Firestore transaction.
 * @returns {Promise<string>}
 */
export async function getNextProjectId() {
  const counterRef = doc(db, COUNTERS_COLLECTION, PROJECT_COUNTER_DOC);

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

      // Check if project with generated ID already exists, if so increment until free
      let candidateId = `PRJ-${nextSeq}`;
      let exists = true;
      let checkSeq = nextSeq;

      while (exists) {
        candidateId = `PRJ-${checkSeq}`;
        const projRef = doc(db, PROJECTS_COLLECTION, candidateId);
        const projSnap = await transaction.get(projRef);
        if (!projSnap.exists()) {
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
    handleFirestoreError(error, OperationType.WRITE, `${COUNTERS_COLLECTION}/${PROJECT_COUNTER_DOC}`);
    // Fallback if transaction fails
    return `PRJ-${Date.now().toString().slice(-4)}`;
  }
}

/**
 * Creates a new construction project in Firestore
 * @param {Object} projectData
 * @param {Object|null} user
 * @returns {Promise<Object>}
 */
export async function createProject(projectData, user = null) {
  try {
    let projectId = projectData.projectId?.trim();
    if (!projectId) {
      projectId = await getNextProjectId();
    }

    const otherExp = Number(projectData.otherTotalExpenses) || 0;
    const labourExp = Number(projectData.totalLabourExpenses) || 0;
    const totalBudget = calculateTotalBudget(otherExp, labourExp);
    const contractValue = Number(projectData.contractValue) || 0;

    const newProject = {
      projectId,
      projectName: projectData.projectName.trim(),
      localBody: projectData.localBody,
      workType: projectData.workType,
      startDate: projectData.startDate,
      contractValue,
      status: projectData.status || 'Ongoing',
      isArchived: false,
      otherTotalExpenses: otherExp,
      totalLabourExpenses: labourExp,
      totalBudget,
      createdBy: user?.email || user?.uid || 'Field Engineer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    await setDoc(docRef, newProject);

    return { id: projectId, ...newProject };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, PROJECTS_COLLECTION);
    throw error;
  }
}

/**
 * Updates an existing project in Firestore
 * @param {string} projectId
 * @param {Object} projectData
 * @param {Object|null} user
 * @returns {Promise<void>}
 */
export async function updateProject(projectId, projectData, user = null) {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    const otherExp = Number(projectData.otherTotalExpenses) || 0;
    const labourExp = Number(projectData.totalLabourExpenses) || 0;
    const totalBudget = calculateTotalBudget(otherExp, labourExp);
    const contractValue = Number(projectData.contractValue) || 0;

    const updatePayload = {
      projectName: projectData.projectName.trim(),
      localBody: projectData.localBody,
      workType: projectData.workType,
      startDate: projectData.startDate,
      contractValue,
      status: projectData.status,
      otherTotalExpenses: otherExp,
      totalLabourExpenses: labourExp,
      totalBudget,
      updatedAt: new Date().toISOString()
    };

    if (user?.email) {
      updatePayload.updatedBy = user.email;
    }

    await updateDoc(docRef, updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${PROJECTS_COLLECTION}/${projectId}`);
    throw error;
  }
}

/**
 * Archives or restores a project (soft delete to preserve future wage & expense linkages)
 * @param {string} projectId
 * @param {boolean} isArchived
 * @param {Object|null} user
 * @returns {Promise<void>}
 */
export async function toggleArchiveProject(projectId, isArchived, user = null) {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    await updateDoc(docRef, {
      isArchived,
      updatedAt: new Date().toISOString(),
      archivedBy: isArchived ? (user?.email || 'Admin') : null
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${PROJECTS_COLLECTION}/${projectId}`);
    throw error;
  }
}

/**
 * Fetches single project by ID
 * @param {string} projectId
 * @returns {Promise<Object|null>}
 */
export async function getProjectById(projectId) {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${PROJECTS_COLLECTION}/${projectId}`);
    return null;
  }
}

/**
 * Sets up a real-time snapshot listener on the projects collection
 * @param {Function} onProjectsUpdated
 * @param {Function} onError
 * @returns {Function} Unsubscribe function
 */
export function subscribeToProjects(onProjectsUpdated, onError) {
  const projectsRef = collection(db, PROJECTS_COLLECTION);
  const q = query(projectsRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const projects = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      onProjectsUpdated(projects);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, PROJECTS_COLLECTION);
      if (onError) onError(error);
    }
  );
}

/**
 * Seeds initial Kerala roadwork projects into live Firestore if the collection is empty.
 * Ensures the user experiences live database records on first boot.
 * @param {Object|null} user
 */
export async function seedSampleProjectsIfEmpty(user = null) {
  try {
    const snap = await getDocs(collection(db, PROJECTS_COLLECTION));
    if (!snap.empty) {
      return false; // Already has records
    }

    const initialProjects = [
      {
        projectId: 'PRJ-101',
        projectName: 'Aluva - Perumbavoor Road Widening & BMBC Tarring',
        localBody: 'Municipality',
        workType: 'Tarring',
        startDate: '2026-01-15',
        contractValue: 12500000, // ₹1.25 Crore
        status: 'Ongoing',
        isArchived: false,
        otherTotalExpenses: 1840000,
        totalLabourExpenses: 1420000,
        totalBudget: 3260000,
        createdBy: user?.email || 'Executive Engineer',
        createdAt: new Date('2026-01-15T09:00:00Z').toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        projectId: 'PRJ-102',
        projectName: 'Angamaly Bypass Stormwater Concrete Drainage & Culverts',
        localBody: 'Block Panchayat',
        workType: 'Drainage Work',
        startDate: '2026-02-01',
        contractValue: 4800000, // ₹48 Lakhs
        status: 'Ongoing',
        isArchived: false,
        otherTotalExpenses: 820000,
        totalLabourExpenses: 690000,
        totalBudget: 1510000,
        createdBy: user?.email || 'Assistant Engineer',
        createdAt: new Date('2026-02-01T10:30:00Z').toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        projectId: 'PRJ-103',
        projectName: 'Kozhikode Beach Road Rigid Concrete Pavement',
        localBody: 'Corporation',
        workType: 'Concrete Road',
        startDate: '2025-11-10',
        contractValue: 24000000, // ₹2.40 Crore
        status: 'Completed',
        isArchived: false,
        otherTotalExpenses: 9400000,
        totalLabourExpenses: 8100000,
        totalBudget: 17500000,
        createdBy: user?.email || 'Superintending Engineer',
        createdAt: new Date('2025-11-10T08:00:00Z').toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        projectId: 'PRJ-104',
        projectName: 'Vazhakkulam Grama Panchayat Link Road Resurfacing',
        localBody: 'Grama Panchayat',
        workType: 'Road Maintenance',
        startDate: '2026-02-20',
        contractValue: 1850000, // ₹18.5 Lakhs
        status: 'Pending',
        isArchived: false,
        otherTotalExpenses: 210000,
        totalLabourExpenses: 150000,
        totalBudget: 360000,
        createdBy: user?.email || 'Section Officer',
        createdAt: new Date('2026-02-20T11:00:00Z').toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Seed projects and update counter
    for (const proj of initialProjects) {
      await setDoc(doc(db, PROJECTS_COLLECTION, proj.projectId), proj);
    }

    const counterRef = doc(db, COUNTERS_COLLECTION, PROJECT_COUNTER_DOC);
    await setDoc(counterRef, {
      currentSeq: 104,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return true;
  } catch (error) {
    console.error('Error seeding initial records:', error);
    return false;
  }
}
