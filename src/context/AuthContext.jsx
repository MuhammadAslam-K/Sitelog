/**
 * Authentication Context for Kerala Roadways PMS (Phase 8 Settings & RBAC)
 * Supports:
 * - Super Admin (Muhammad Aslam / Muhammad@2003 / aslamka.2k3@gmail.com)
 * - Sub-Admin accounts with granular module permission enforcement (none, view, edit)
 * - Email-verified password reset workflow
 * - Persistent session in localStorage across app/browser close & reopen until explicit Logout
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  signOut,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config.js';
import { DEFAULT_SUPER_ADMIN } from '../utils/constants.js';
import {
  authenticateSystemUser,
  resetPasswordByEmail,
  initializeSuperAdminIfMissing,
  verifyResetEmail,
  verifyUserSession
} from '../firebase/userService.js';

const AuthContext = createContext(null);
const PERSISTENT_SESSION_KEY = 'kerala_roadways_auth_session';
const LEGACY_SESSION_KEYS = ['kerala_roadways_auth_user', 'kerala_roadways_window_session'];

function readStoredSession() {
  try {
    const raw = localStorage.getItem(PERSISTENT_SESSION_KEY);
    if (raw) return JSON.parse(raw);

    // Migrate any active sessionStorage entry from earlier tab session
    const legacySession = sessionStorage.getItem('kerala_roadways_window_session');
    if (legacySession) {
      localStorage.setItem(PERSISTENT_SESSION_KEY, legacySession);
      sessionStorage.removeItem('kerala_roadways_window_session');
      return JSON.parse(legacySession);
    }
  } catch (e) {
    console.warn('Persistent session read notice:', e);
  }
  return null;
}

function savePersistentSession(sessionUser) {
  try {
    localStorage.setItem(PERSISTENT_SESSION_KEY, JSON.stringify(sessionUser));
    LEGACY_SESSION_KEYS.forEach((key) => {
      try {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      } catch {}
    });
  } catch (e) {
    console.warn('Persistent session write notice:', e);
  }
}

function clearPersistentSession() {
  try {
    localStorage.removeItem(PERSISTENT_SESSION_KEY);
    sessionStorage.removeItem(PERSISTENT_SESSION_KEY);
    LEGACY_SESSION_KEYS.forEach((key) => {
      try {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      } catch {}
    });
  } catch {}
}

export function AuthProvider({ children }) {
  // Current authenticated user (Super Admin or Sub Admin) - persisted across close/reopen until Logout
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] = useState(false);

  // Initialize Super Admin in Firestore and restore persistent login session
  useEffect(() => {
    let isMounted = true;

    async function initAndRestoreSession() {
      try {
        await setPersistence(auth, browserLocalPersistence).catch(() => {});

        initializeSuperAdminIfMissing().catch((err) => {
          console.warn('Super admin initialization check:', err);
        });

        const parsed = readStoredSession();

        if (parsed && parsed.userId) {
          // Restore immediately so reopening offline or in PWA works seamlessly
          if (isMounted) setCurrentUser(parsed);

          // Skip systemUsers lookup for Google Sign-In sessions (managed via Google Auth)
          const isGoogleSession =
            parsed.authProvider === 'google' ||
            (typeof parsed.sessionToken === 'string' && parsed.sessionToken.startsWith('kr_goog_'));

          if (!isGoogleSession) {
            const verification = await verifyUserSession(parsed.userId);
            if (!isMounted) return;

            if (!verification.valid) {
              // Explicitly disabled or deleted in Firestore
              console.warn('Stored user account was disabled or deleted:', verification.reason);
              clearPersistentSession();
              setCurrentUser(null);
            } else if (verification.user) {
              const refreshedUser = {
                ...verification.user,
                sessionToken: parsed.sessionToken,
                loginTimestamp: parsed.loginTimestamp
              };
              setCurrentUser(refreshedUser);
              savePersistentSession(refreshedUser);
            }
          }
        } else {
          if (isMounted) setCurrentUser(null);
        }
      } catch (e) {
        console.warn('Session restoration exception:', e);
        if (isMounted) setCurrentUser(null);
      } finally {
        if (isMounted) setIsAuthChecking(false);
      }
    }

    initAndRestoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Keep active credentials-based user's permissions & status synced in real-time
  useEffect(() => {
    if (!currentUser?.userId) return;
    const isGoogleSession =
      currentUser.authProvider === 'google' ||
      (typeof currentUser.sessionToken === 'string' && currentUser.sessionToken.startsWith('kr_goog_'));
    if (isGoogleSession) return;

    const userDocRef = doc(db, 'systemUsers', currentUser.userId);
    const unsubscribe = onSnapshot(
      userDocRef,
      (snap) => {
        if (!snap.exists()) {
          // Only log out non-super-admin accounts if explicitly removed from Firestore
          if (currentUser.userId !== DEFAULT_SUPER_ADMIN.userId) {
            clearPersistentSession();
            setCurrentUser(null);
          }
          return;
        }
        const data = snap.data();
        if (data.status === 'Disabled') {
          clearPersistentSession();
          setCurrentUser(null);
          return;
        }
        const { password: _, ...safeUser } = data;
        setCurrentUser((prev) => {
          if (!prev) return prev;
          const updated = {
            ...prev,
            ...safeUser,
            id: snap.id
          };
          savePersistentSession(updated);
          return updated;
        });
      },
      (err) => {
        // Ignore transient offline/permission listener notices so user is never unexpectedly logged out
        console.warn('Live user profile sync notice:', err?.message);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.userId, currentUser?.sessionToken, currentUser?.authProvider]);

  /**
   * Username / Password Login (Super Admin or Sub Admin)
   * Persisted across app/browser closes until explicit Logout
   */
  const loginWithCredentials = async (usernameOrEmail, password) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const user = await authenticateSystemUser(usernameOrEmail, password);
      const sessionUser = {
        ...user,
        authProvider: 'credentials',
        sessionToken: `kr_sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        loginTimestamp: new Date().toISOString()
      };

      setCurrentUser(sessionUser);
      savePersistentSession(sessionUser);
      setIsLoginModalOpen(false);
      return sessionUser;
    } catch (error) {
      console.error('Credentials login error:', error);
      setAuthError(error.message);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  /**
   * Google Sign-In fallback
   * Persisted across app/browser closes until explicit Logout
   */
  const loginWithGoogle = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await setPersistence(auth, browserLocalPersistence).catch(() => {});
      const result = await signInWithPopup(auth, googleProvider);
      const isSuper = result.user.email === 'aslamka.2k3@gmail.com';
      const googleUser = {
        userId: result.user.uid,
        name: result.user.displayName || (isSuper ? 'Muhammad Aslam' : 'Google User'),
        username: result.user.email?.split('@')[0] || 'admin',
        email: result.user.email,
        role: isSuper ? 'Super Admin' : 'Sub Admin',
        designation: isSuper ? 'Managing Director' : 'Site Operations',
        photoURL: result.user.photoURL,
        authProvider: 'google',
        permissions: DEFAULT_SUPER_ADMIN.permissions,
        sessionToken: `kr_goog_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        loginTimestamp: new Date().toISOString()
      };
      setCurrentUser(googleUser);
      savePersistentSession(googleUser);
      setIsLoginModalOpen(false);
      return googleUser;
    } catch (error) {
      console.error('Google Sign-in failed:', error);
      setAuthError(error.message);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  /**
   * Logs out the current user and clears persistent session ONLY when explicitly triggered
   */
  const logout = async () => {
    try {
      await signOut(auth).catch(() => {});
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
    setCurrentUser(null);
    clearPersistentSession();
    try {
      sessionStorage.clear();
    } catch {}
    setIsLoginModalOpen(false);
    try {
      window.history.replaceState({}, '', '/');
    } catch {}
  };

  /**
   * Verifies an email and resets the password
   */
  const handlePasswordReset = async (email, newPassword) => {
    setAuthLoading(true);
    try {
      const updatedUser = await resetPasswordByEmail(email, newPassword);
      if (currentUser && currentUser.email?.toLowerCase() === email.toLowerCase()) {
        const { password: _, ...safeUpdated } = updatedUser;
        const refreshed = { ...currentUser, ...safeUpdated };
        setCurrentUser(refreshed);
        savePersistentSession(refreshed);
      }
      return updatedUser;
    } finally {
      setAuthLoading(false);
    }
  };

  /**
   * Check permissions for a module:
   * Level can be 'view' or 'edit'
   */
  const hasModuleAccess = (moduleId, requiredLevel = 'view') => {
    if (!currentUser) return false;
    // Super Admin has full unrestricted access
    if (currentUser.role === 'Super Admin') return true;

    const userPerm = currentUser.permissions?.[moduleId] || 'none';
    if (userPerm === 'none') return false;
    if (requiredLevel === 'view') {
      return userPerm === 'view' || userPerm === 'edit';
    }
    if (requiredLevel === 'edit') {
      return userPerm === 'edit';
    }
    return false;
  };

  const canEditModule = (moduleId) => hasModuleAccess(moduleId, 'edit');
  const canViewModule = (moduleId) => hasModuleAccess(moduleId, 'view');
  const isSuperAdmin = currentUser?.role === 'Super Admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthChecking,
        authLoading,
        authError,
        isAuthenticated: !!currentUser,
        isSuperAdmin,
        loginWithCredentials,
        loginWithGoogle,
        logout,
        verifyResetEmail,
        handlePasswordReset,
        hasModuleAccess,
        canEditModule,
        canViewModule,
        isLoginModalOpen,
        setIsLoginModalOpen,
        isPasswordResetModalOpen,
        setIsPasswordResetModalOpen
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
