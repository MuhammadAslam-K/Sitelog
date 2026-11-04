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
  verifyResetEmail 
} from '../firebase/userService.js';

const AuthContext = createContext(null);
const SESSION_STORAGE_KEY = 'kerala_roadways_auth_user';

export function AuthProvider({ children }) {
  // Current authenticated user (Super Admin or Sub Admin)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    // Default logged in as Super Admin Muhammad Aslam
    return DEFAULT_SUPER_ADMIN;
  });

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] = useState(false);

  // Initialize Super Admin in Firestore on application boot
  useEffect(() => {
    initializeSuperAdminIfMissing().catch((err) => {
      console.warn('Super admin initialization error:', err);
    });
  }, []);

  // Save session when user changes
  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentUser));
      } catch (e) {
        console.warn('Could not save auth session:', e);
      }
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [currentUser]);

  /**
   * Username / Password Login (Super Admin or Sub Admin)
   */
  const loginWithCredentials = async (usernameOrEmail, password) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const user = await authenticateSystemUser(usernameOrEmail, password);
      setCurrentUser(user);
      setIsLoginModalOpen(false);
      return user;
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
      const googleUser = {
        userId: result.user.uid,
        name: result.user.displayName || 'Google User',
        username: result.user.email?.split('@')[0] || 'admin',
        email: result.user.email,
        role: result.user.email === 'aslamka.2k3@gmail.com' ? 'Super Admin' : 'Sub Admin',
        designation: 'Site Operations',
        photoURL: result.user.photoURL,
        permissions: DEFAULT_SUPER_ADMIN.permissions
      };
      setCurrentUser(googleUser);
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
   * Logs out the current user and clears session
   */
  const logout = async () => {
    try {
      await signOut(auth).catch(() => {});
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
    setCurrentUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setIsLoginModalOpen(true);
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
