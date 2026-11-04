import React from 'react';
import { 
  Menu, 
  Search, 
  LogOut, 
  LogIn, 
  User, 
  Database,
  Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { COMPANY_NAME } from '../../utils/constants.js';

export function TopNav({ 
  pageTitle, 
  pageSubtitle,
  searchQuery, 
  onSearchChange, 
  onOpenMobileSidebar 
}) {
  const { currentUser, loginWithGoogle, logout, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 py-3.5 shadow-xs">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-700 hidden sm:inline-flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {COMPANY_NAME}
              </span>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate tracking-tight">
                {pageTitle}
              </h2>
            </div>
            {pageSubtitle && (
              <p className="text-xs text-slate-500 truncate hidden md:block">
                {pageSubtitle}
              </p>
            )}
          </div>
        </div>

        {/* Center: Search input */}
        <div className="flex-1 max-w-md mx-2 hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search projects by ID (e.g. PRJ-101) or name..."
              className="w-full pl-9 pr-4 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 rounded-xl border border-transparent focus:border-emerald-600 focus:outline-hidden focus:ring-3 focus:ring-emerald-500/15 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-1 py-0.5 rounded"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right: Database Status & User Profile / Logout */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Live Firestore DB Indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-semibold text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Firestore Live</span>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">
                {currentUser?.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.name || currentUser.displayName || 'User'}
                    className="w-6 h-6 rounded-full object-cover border border-slate-300"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold">
                    {(currentUser?.name || currentUser?.username || 'M')[0].toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col text-left leading-tight hidden md:block">
                  <span className="text-xs font-bold text-slate-800 max-w-[130px] truncate block">
                    {currentUser?.name || currentUser?.username || 'Muhammad Aslam'}
                  </span>
                  <span className={`text-[9px] font-extrabold uppercase tracking-wider ${
                    currentUser?.role === 'Super Admin' ? 'text-amber-700' : 'text-emerald-700'
                  }`}>
                    {currentUser?.role || 'Super Admin'}
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                title="Log out of system"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 hover:border-rose-200 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-emerald-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-2xs transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="mt-2.5 sm:hidden">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search PRJ-101 or project..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-100 text-xs text-slate-900 rounded-lg border border-transparent focus:border-emerald-600 focus:bg-white focus:outline-hidden"
          />
        </div>
      </div>
    </header>
  );
}
