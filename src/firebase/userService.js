/**
 * User & Sub-Admin RBAC Service (Phase 8 Settings)
 * Manages Super Admin credentials (Muhammad Aslam / Muhammad@2003 / aslamka.2k3@gmail.com),
 * email-verified password resets, and granular module access control for Sub-Admins.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './config.js';
import { DEFAULT_SUPER_ADMIN, SYSTEM_MODULES } from '../utils/constants.js';

const USERS_COLLECTION = 'systemUsers';

/**
 * Initializes and ensures the default Super Admin exists in Firestore.
 */
export async function initializeSuperAdminIfMissing() {
  try {
    const adminRef = doc(db, USERS_COLLECTION, DEFAULT_SUPER_ADMIN.userId);
    const snap = await getDoc(adminRef);

    if (!snap.exists()) {
      const now = new Date().toISOString();
      await setDoc(adminRef, {
        ...DEFAULT_SUPER_ADMIN,
        createdAt: now,
        updatedAt: now
      });
      return DEFAULT_SUPER_ADMIN;
    }
    return snap.data();
  } catch (error) {
    console.warn('Super Admin init check:', error.message);
    return DEFAULT_SUPER_ADMIN;
  }
}

/**
 * Subscribes to all system users in real-time
 * @param {Function} onUpdate - callback
 * @param {Function} onError - error callback
 */
export function subscribeToSystemUsers(onUpdate, onError) {
  const usersQuery = query(collection(db, USERS_COLLECTION), orderBy('createdAt', 'asc'));

  return onSnapshot(
    usersQuery,
    (snapshot) => {
      let users = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));

      // If collection is empty, include the default Super Admin in the list
      const hasSuperAdmin = users.some(
        (u) => u.username?.toLowerCase() === DEFAULT_SUPER_ADMIN.username.toLowerCase()
      );
      if (!hasSuperAdmin) {
        users = [DEFAULT_SUPER_ADMIN, ...users];
      }

      onUpdate(users);
    },
    (error) => {
      console.error('Error in subscribeToSystemUsers:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, USERS_COLLECTION);
    }
  );
}

/**
 * Authenticates a user with username (or email) and password
 * @param {string} usernameOrEmail 
 * @param {string} password 
 * @returns {Promise<Object>}
 */
export async function authenticateSystemUser(usernameOrEmail, password) {
  const cleanInput = (usernameOrEmail || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  if (!cleanInput || !cleanPass) {
    throw new Error('Please enter both username and password.');
  }

  // 1. Check in Firestore collection
  try {
    const snap = await getDocs(collection(db, USERS_COLLECTION));
    let matchedUser = null;

    snap.docs.forEach((d) => {
      const u = d.data();
      const uName = (u.username || '').trim().toLowerCase();
      const uEmail = (u.email || '').trim().toLowerCase();
      if (uName === cleanInput || uEmail === cleanInput) {
        matchedUser = { id: d.id, ...u };
      }
    });

    if (matchedUser) {
      if (matchedUser.status === 'Disabled') {
        throw new Error('This account has been disabled. Please contact the Super Admin.');
      }
      if (matchedUser.password === cleanPass) {
        return matchedUser;
      }
      throw new Error('Invalid username or password.');
    }
  } catch (error) {
    if (error.message.includes('disabled') || error.message.includes('Invalid')) {
      throw error;
    }
    console.warn('Firestore user fetch failed, checking fallback super admin:', error.message);
  }

  // 2. Fallback check for Default Super Admin
  const adminName = DEFAULT_SUPER_ADMIN.username.toLowerCase();
  const adminEmail = DEFAULT_SUPER_ADMIN.email.toLowerCase();

  if ((cleanInput === adminName || cleanInput === adminEmail) && cleanPass === DEFAULT_SUPER_ADMIN.password) {
    return DEFAULT_SUPER_ADMIN;
  }

  throw new Error('Invalid username or password.');
}

/**
 * Verifies if the email ID belongs to any registered user (Super Admin or Sub Admin)
 * @param {string} email 
 * @returns {Promise<Object>} The matched user record
 */
export async function verifyResetEmail(email) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) {
    throw new Error('Please enter your registered email ID.');
  }

  // Check default Super Admin
  if (cleanEmail === DEFAULT_SUPER_ADMIN.email.toLowerCase()) {
    try {
      const snap = await getDoc(doc(db, USERS_COLLECTION, DEFAULT_SUPER_ADMIN.userId));
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() };
      }
    } catch {
      // fallback
    }
    return DEFAULT_SUPER_ADMIN;
  }

  // Check in Firestore
  try {
    const snap = await getDocs(collection(db, USERS_COLLECTION));
    let matchedUser = null;

    snap.docs.forEach((d) => {
      const u = d.data();
      if ((u.email || '').trim().toLowerCase() === cleanEmail) {
        matchedUser = { id: d.id, ...u };
      }
    });

    if (matchedUser) {
      return matchedUser;
    }
  } catch (err) {
    console.error('Error verifying email:', err);
  }

  throw new Error(`Email "${email}" is not registered. Please enter the email registered with this account (e.g. aslamka.2k3@gmail.com).`);
}

/**
 * Resets password for a verified email account
 * @param {string} email 
 * @param {string} newPassword 
 * @returns {Promise<Object>}
 */
export async function resetPasswordByEmail(email, newPassword) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (newPassword || '').trim();

  if (!cleanPass || cleanPass.length < 4) {
    throw new Error('New password must be at least 4 characters long.');
  }

  const user = await verifyResetEmail(cleanEmail);
  const userDocId = user.userId || user.id || DEFAULT_SUPER_ADMIN.userId;

  const now = new Date().toISOString();
  const userRef = doc(db, USERS_COLLECTION, userDocId);

  try {
    await setDoc(
      userRef,
      {
        ...user,
        password: cleanPass,
        updatedAt: now
      },
      { merge: true }
    );

    return {
      ...user,
      password: cleanPass,
      updatedAt: now
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${USERS_COLLECTION}/${userDocId}`);
    throw error;
  }
}

/**
 * Creates a new Sub Admin with granular module permissions
 * @param {Object} userData 
 * @returns {Promise<Object>}
 */
export async function createSubAdmin(userData) {
  const username = (userData.username || '').trim();
  const name = (userData.name || '').trim();
  const email = (userData.email || '').trim();
  const password = (userData.password || '').trim();

  if (!name || name.length < 2) throw new Error('Full Name is required (minimum 2 characters).');
  if (!username || username.length < 2) throw new Error('Username is required (minimum 2 characters).');
  if (!email || !email.includes('@')) throw new Error('A valid email address is required.');
  if (!password || password.length < 4) throw new Error('Password must be at least 4 characters long.');

  // Check username uniqueness
  const snap = await getDocs(collection(db, USERS_COLLECTION));
  for (const d of snap.docs) {
    const existing = d.data();
    if ((existing.username || '').toLowerCase() === username.toLowerCase()) {
      throw new Error(`Username "${username}" is already taken. Please choose another.`);
    }
    if ((existing.email || '').toLowerCase() === email.toLowerCase()) {
      throw new Error(`Email "${email}" is already in use by another staff account.`);
    }
  }

  // Build default permissions if not passed
  const permissions = userData.permissions || {};
  SYSTEM_MODULES.forEach((mod) => {
    if (!permissions[mod.id]) {
      permissions[mod.id] = 'view'; // default to view
    }
  });

  const userId = `usr-sub-${Date.now().toString().slice(-6)}`;
  const now = new Date().toISOString();

  const payload = {
    userId,
    username,
    name,
    email,
    password,
    role: 'Sub Admin',
    designation: (userData.designation || 'Site Supervisor').trim(),
    status: userData.status || 'Active',
    permissions,
    createdAt: now,
    updatedAt: now
  };

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await setDoc(userRef, payload);
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${USERS_COLLECTION}/${userId}`);
    throw error;
  }
}

/**
 * Updates an existing Sub Admin record and module permissions
 * @param {string} userId 
 * @param {Object} updates 
 * @returns {Promise<Object>}
 */
export async function updateSubAdmin(userId, updates) {
  if (!userId) throw new Error('User ID is required');

  const now = new Date().toISOString();
  const payload = {
    updatedAt: now
  };

  if (updates.name) payload.name = updates.name.trim();
  if (updates.email) payload.email = updates.email.trim();
  if (updates.designation) payload.designation = updates.designation.trim();
  if (updates.status) payload.status = updates.status;
  if (updates.password && updates.password.trim()) payload.password = updates.password.trim();
  if (updates.permissions) payload.permissions = updates.permissions;

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, payload);
    return { userId, ...payload };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${USERS_COLLECTION}/${userId}`);
    throw error;
  }
}

/**
 * Deletes a Sub Admin record (prevents deleting Super Admin)
 * @param {string} userId 
 */
export async function deleteSubAdmin(userId) {
  if (!userId) throw new Error('User ID is required');
  if (userId === DEFAULT_SUPER_ADMIN.userId) {
    throw new Error('The primary Super Admin account cannot be deleted.');
  }

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await deleteDoc(userRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${USERS_COLLECTION}/${userId}`);
    throw error;
  }
}
