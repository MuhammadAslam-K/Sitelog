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
  ShieldCheck,
  Building2,
  FileCheck2,
  Cpu,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { COMPANY_NAME, COMPANY_TAGLINE } from '../../utils/constants.js';

export function LoginPage({ onOpenPasswordReset }) {
  const { loginWithCredentials, loginWithGoogle } = useAuth();

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
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your username and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillSuperAdmin = () => {
    setUsername('Muhammad Aslam');
    setPassword('Muhammad@2003');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8 select-none">
      <div className="w-full max-w-md">
        {/* Brand Banner Card */}
        <div className="bg-[#172B4D] rounded-2xl p-6 text-white text-center shadow-lg border border-[#213963] mb-5">
          <div className="w-14 h-14 rounded-2xl bg-[#0F8B78] flex items-center justify-center mx-auto mb-3 text-white shadow-md">
            <HardHat className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-white">{COMPANY_NAME}</h1>
          <p className="text-xs text-teal-200 font-medium mt-0.5">{COMPANY_TAGLINE}</p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#213963] text-[11px] font-semibold text-teal-100 border border-[#2c4b82]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0F8B78]" />
            <span>Enterprise Access Control • Authentication Required</span>
          </div>
        </div>

        {/* Login Form Panel */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 sm:p-7 space-y-5">
          <div className="border-b border-[#E2E8F0] pb-3 text-left">
            <h2 className="text-base font-bold text-[#172B4D]">Authorized Personnel Sign In</h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Sign in with your registered credentials to access projects and workforce ledgers.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-[#DC5353] text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#DC5353] shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold block">Access Denied (401)</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Email */}
            <div>
              <label className="block text-xs font-bold text-[#172B4D] mb-1.5">
                Username or Registered Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. Muhammad Aslam or email"
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] focus:bg-white text-[#172B4D] focus:border-[#0F8B78] focus:outline-hidden focus:ring-2 focus:ring-[#0F8B78]/20 transition-all font-medium"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#172B4D]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={onOpenPasswordReset}
                  className="text-[11px] font-bold text-[#0F8B78] hover:text-[#0d7867] underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secure password"
                  className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm font-mono rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] focus:bg-white text-[#172B4D] focus:border-[#0F8B78] focus:outline-hidden focus:ring-2 focus:ring-[#0F8B78]/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#172B4D] p-1 rounded-md"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Super Admin Quick Autofill Helper */}
            <div className="p-3 rounded-xl bg-slate-50 border border-[#E2E8F0] flex items-center justify-between gap-2">
              <div className="text-[11px] text-[#64748B]">
                <span className="font-semibold text-[#172B4D] block">Super Admin Account</span>
                <span>Muhammad Aslam</span>
              </div>
              <button
                type="button"
                onClick={handleFillSuperAdmin}
                className="text-[11px] font-bold text-[#0F8B78] hover:text-[#0d7867] bg-white px-2.5 py-1 rounded-lg border border-[#E2E8F0] shadow-2xs transition-colors shrink-0"
              >
                Autofill Credentials
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#0F8B78] hover:bg-[#0d7867] disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Verifying Credentials...' : 'Sign In as System User'}</span>
            </button>
          </form>

          {/* Alternative Google Sign-in */}
          <div className="pt-3 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={async () => {
                try {
                  setIsLoading(true);
                  await loginWithGoogle();
                } catch (e) {
                  setErrorMessage(e.message || 'Google sign in failed');
                } finally {
                  setIsLoading(false);
                }
              }}
              className="w-full py-2.5 px-3 bg-white hover:bg-slate-50 border border-[#E2E8F0] text-[#172B4D] font-bold text-xs sm:text-sm rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        </div>

        {/* Security Notice Footer */}
        <div className="mt-6 text-center text-xs text-[#64748B] space-y-1">
          <p className="flex items-center justify-center gap-1.5 font-medium">
            <Lock className="w-3.5 h-3.5 text-[#0F8B78]" />
            <span>End-to-End Encrypted Session Verification</span>
          </p>
          <p className="text-[11px] text-slate-400">
            Kerala Infrastructure Road Works PMS • All operations are logged and audited
          </p>
        </div>
      </div>
    </div>
  );
}
