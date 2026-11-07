/**
 * Authentication Context for Kerala Roadways PMS (Phase 8 Settings & RBAC)
 * Supports:
 * - Super Admin (Muhammad Aslam / Muhammad@2003 / aslamka.2k3@gmail.com)
 * - Sub-Admin accounts with granular module permission enforcement (none, view, edit)
 * - Email-verified password reset workflow
 * - Session persistence in localStorage
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config.js';
import { 
  DEFAULT_SUPER_ADMIN 
} from '../utils/constants.js';
import { 
  authenticateSystemUser, 
  resetPasswordByEmail, 
  initializeSuperAdminIfMissing,
  verifyResetEmail,
  verifyUserSession
} from '../firebase/userService.js';

const AuthContext = createContext(null);
const SESSION_STORAGE_KEY = 'kerala_roadways_auth_user';
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export function AuthProvider({ children }) {
  // Current authenticated user (Super Admin or Sub Admin) - STRICTLY NULL BY DEFAULT
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] = useState(false);

  // Initialize Super Admin in Firestore and verify any pre-existing session against database
  useEffect(() => {
    let isMounted = true;

    async function initAndVerifySession() {
      try {
        await initializeSuperAdminIfMissing().catch((err) => {
          console.warn('Super admin initialization check:', err);
        });

        // Check if there is an existing stored session
        const rawSession = localStorage.getItem(SESSION_STORAGE_KEY) || sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (rawSession) {
          const parsed = JSON.parse(rawSession);

          // Verify session timestamp expiration
          if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
            console.warn('Session has expired. Re-authentication required.');
            localStorage.removeItem(SESSION_STORAGE_KEY);
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
            if (isMounted) setCurrentUser(null);
          } else if (parsed.userId) {
            // Independently verify user exists and is Active in database
            const verified = await verifyUserSession(parsed.userId);
            if (verified && isMounted) {
              setCurrentUser({
                ...verified,
                sessionToken: parsed.sessionToken,
                expiresAt: parsed.expiresAt
              });
            } else {
              // User disabled or deleted in database - invalidate session
              console.warn('Stored user session failed database verification.');
              localStorage.removeItem(SESSION_STORAGE_KEY);
              sessionStorage.removeItem(SESSION_STORAGE_KEY);
              if (isMounted) setCurrentUser(null);
            }
          }
        }
      } catch (e) {
        console.warn('Session verification exception:', e);
        localStorage.removeItem(SESSION_STORAGE_KEY);
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        if (isMounted) setCurrentUser(null);
      } finally {
        if (isMounted) setIsAuthChecking(false);
      }
    }

    initAndVerifySession();

    // Listen to Firebase Auth state for Google accounts
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (!isMounted) return;
      if (fbUser) {
        const isSuper = fbUser.email === 'aslamka.2k3@gmail.com';
        const googleUser = {
          userId: fbUser.uid,
          name: fbUser.displayName || (isSuper ? 'Muhammad Aslam' : 'Google User'),
          username: fbUser.email?.split('@')[0] || 'admin',
          email: fbUser.email,
          role: isSuper ? 'Super Admin' : 'Sub Admin',
          designation: isSuper ? 'Managing Director' : 'Site Operations',
          photoURL: fbUser.photoURL,
          permissions: DEFAULT_SUPER_ADMIN.permissions,
          sessionToken: `kr_goog_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          expiresAt: Date.now() + SESSION_EXPIRY_MS
        };
        setCurrentUser(googleUser);
        try {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(googleUser));
        } catch {}
      }
    });

    return () => {
      isMounted = false;
      unsubscribeAuth();
    };
  }, []);

  /**
   * Username / Password Login (Super Admin or Sub Admin)
   */
  const loginWithCredentials = async (usernameOrEmail, password) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const user = await authenticateSystemUser(usernameOrEmail, password);
      const sessionUser = {
        ...user,
        sessionToken: `kr_sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        loginTimestamp: new Date().toISOString(),
        expiresAt: Date.now() + SESSION_EXPIRY_MS
      };

      setCurrentUser(sessionUser);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionUser));
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
   */
  const loginWithGoogle = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
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
        permissions: DEFAULT_SUPER_ADMIN.permissions,
        sessionToken: `kr_goog_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        expiresAt: Date.now() + SESSION_EXPIRY_MS
      };
      setCurrentUser(googleUser);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(googleUser));
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
   * Logs out the current user and completely terminates session
   */
  const logout = async () => {
    try {
      await signOut(auth).catch(() => {});
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
    setCurrentUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.clear();
    setIsLoginModalOpen(false);
    // Invalidate browser navigation state to prevent cached back-button history inspection
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
        setCurrentUser(updatedUser);
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedUser));
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
