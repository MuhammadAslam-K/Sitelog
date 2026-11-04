import React, { useState } from 'react';
import { 
  Mail, 
  KeyRound, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RotateCcw,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export function PasswordResetModal({ isOpen, onClose }) {
  const { verifyResetEmail, handlePasswordReset, setIsLoginModalOpen } = useAuth();

  const [emailInput, setEmailInput] = useState('aslamka.2k3@gmail.com');
  const [verifiedUser, setVerifiedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Step 1: Verify Email
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsVerifying(true);

    try {
      const user = await verifyResetEmail(emailInput);
      setVerifiedUser(user);
    } catch (err) {
      setErrorMessage(err.message || 'Email verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Step 2: Save New Password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!newPassword || newPassword.length < 4) {
      setErrorMessage('New password must be at least 4 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please retype identical passwords.');
      return;
    }

    setIsUpdating(true);
    try {
      await handlePasswordReset(verifiedUser.email, newPassword);
      setSuccessMessage(`Password successfully reset for ${verifiedUser.name} (${verifiedUser.email})! You can now log in.`);
      setTimeout(() => {
        handleClose();
        setIsLoginModalOpen(true);
      }, 2000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update password.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    setVerifiedUser(null);
    setNewPassword('');
    setConfirmPassword('');
    setErrorMessage('');
    setSuccessMessage('');
    if (onClose) onClose();
  };

  const handleBackToLogin = () => {
    handleClose();
    setIsLoginModalOpen(true);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reset Account Password"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Error notification */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success notification */}
        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {!verifiedUser ? (
          /* STEP 1: Email Verification */
          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs leading-relaxed">
              <p className="font-bold flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Security Verification Required
              </p>
              To reset your password, please provide your registered email address. For Super Admin Muhammad Aslam, enter <strong>aslamka.2k3@gmail.com</strong>.
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Registered Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="aslamka.2k3@gmail.com"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setEmailInput('aslamka.2k3@gmail.com')}
                className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold underline"
              >
                Use aslamka.2k3@gmail.com
              </button>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="text-xs font-bold text-slate-600 hover:text-slate-800"
              >
                Back to Login
              </button>

              <button
                type="submit"
                disabled={isVerifying}
                className="py-2 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
              >
                <span>{isVerifying ? 'Verifying Email...' : 'Verify Email ID'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        ) : (
          /* STEP 2: Enter New Password */
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span className="font-bold">Identity Verified Successfully</span>
              </div>
              <p className="text-emerald-800">
                User: <strong>{verifiedUser.name}</strong> ({verifiedUser.role})<br />
                Email: <span className="font-mono">{verifiedUser.email}</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm font-mono rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-mono rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setVerifiedUser(null)}
                className="text-xs font-bold text-slate-600 hover:text-slate-800"
              >
                Change Email
              </button>

              <button
                type="submit"
                disabled={isUpdating}
                className="py-2 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{isUpdating ? 'Saving Password...' : 'Save New Password'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
