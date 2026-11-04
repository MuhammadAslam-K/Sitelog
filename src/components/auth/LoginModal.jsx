import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  HardHat, 
  LogIn, 
  KeyRound, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { COMPANY_NAME } from '../../utils/constants.js';

export function LoginModal({ isOpen, onClose }) {
  const { loginWithCredentials, loginWithGoogle, setIsPasswordResetModalOpen } = useAuth();

  const [username, setUsername] = useState('Muhammad Aslam');
  const [password, setPassword] = useState('Muhammad@2003');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      await loginWithCredentials(username, password);
      if (onClose) onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your username and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenReset = () => {
    if (onClose) onClose();
    setIsPasswordResetModalOpen(true);
  };

  const handleFillSuperAdmin = () => {
    setUsername('Muhammad Aslam');
    setPassword('Muhammad@2003');
    setErrorMessage('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="System Access Login"
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        {/* Brand Banner */}
        <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-emerald-950 to-slate-900 text-white">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-emerald-500 flex items-center justify-center mx-auto mb-2 text-slate-950 shadow-md">
            <HardHat className="w-7 h-7 text-slate-950" />
          </div>
          <h3 className="text-base font-extrabold tracking-tight text-white">{COMPANY_NAME}</h3>
          <p className="text-[11px] text-emerald-300 font-medium">Kerala Roadways Infrastructure PMS</p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Username or Registered Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Muhammad Aslam"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Password
              </label>
              <button
                type="button"
                onClick={handleOpenReset}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline"
              >
                Reset Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm font-mono rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick autofill helper */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Super Admin: <strong>Muhammad Aslam</strong></span>
            </div>
            <button
              type="button"
              onClick={handleFillSuperAdmin}
              className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 bg-white px-2 py-0.5 rounded border border-slate-200"
            >
              Fill Credentials
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? 'Authenticating...' : 'Sign In as System User'}</span>
          </button>
        </form>

        {/* Alternative Google Sign-in */}
        <div className="pt-3 border-t border-slate-200 text-center">
          <button
            type="button"
            onClick={async () => {
              try {
                await loginWithGoogle();
                if (onClose) onClose();
              } catch (e) {
                setErrorMessage(e.message || 'Google sign in failed');
              }
            }}
            className="w-full py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2"
          >
            <span>Or Continue with Google</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
