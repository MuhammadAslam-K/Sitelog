import React, { useState } from 'react';
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
import { PWAInstallButton } from '../pwa/PWAInstallButton.jsx';
import { LoginModal } from '../auth/LoginModal.jsx';

export function TopNav({ 
  pageTitle, 
  pageSubtitle,
  searchQuery, 
  onSearchChange, 
  onOpenMobileSidebar 
}) {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 sm:px-6 py-3.5 shadow-2xs">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Mobile Toggle & Page Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onOpenMobileSidebar}
              className="lg:hidden p-2 rounded-lg text-[#172B4D] hover:text-[#0F8B78] hover:bg-slate-100 transition-colors"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#0F8B78] hidden sm:inline-flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  {COMPANY_NAME}
                </span>
                <span className="text-[#E2E8F0] hidden sm:inline">/</span>
                <h2 className="text-base sm:text-lg font-bold text-[#172B4D] truncate tracking-tight">
                  {pageTitle}
                </h2>
              </div>
              {pageSubtitle && (
                <p className="text-xs text-[#64748B] truncate hidden md:block">
                  {pageSubtitle}
                </p>
              )}
            </div>
          </div>

          {/* Center: Search input */}
          <div className="flex-1 max-w-md mx-2 hidden sm:block">
            <div className="relative">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search projects by ID (e.g. PRJ-101) or name..."
                className="w-full pl-9 pr-4 py-2 bg-slate-100/70 hover:bg-slate-100 focus:bg-white text-xs sm:text-sm text-[#172B4D] placeholder:text-[#64748B] rounded-xl border border-[#E2E8F0] focus:border-[#0F8B78] focus:outline-hidden focus:ring-2 focus:ring-[#0F8B78]/15 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#64748B] hover:text-[#172B4D] px-1 py-0.5 rounded"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right: Database Status & User Profile / Logout */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* PWA In-App Install Prompt */}
            <PWAInstallButton />

            {/* Live Firestore DB Indicator */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0F8B78]/10 border border-[#0F8B78]/25 text-[11px] font-semibold text-[#0F8B78]">
              <span className="w-2 h-2 rounded-full bg-[#0F8B78] animate-pulse"></span>
              <span>Firestore Live</span>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-50 border border-[#E2E8F0]">
                  {currentUser?.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.name || currentUser.displayName || 'User'}
                      className="w-6 h-6 rounded-full object-cover border border-slate-300"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#172B4D] text-white flex items-center justify-center text-xs font-bold">
                      {(currentUser?.name || currentUser?.username || 'M')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col text-left leading-tight hidden md:block">
                    <span className="text-xs font-bold text-[#172B4D] max-w-[130px] truncate block">
                      {currentUser?.name || currentUser?.username || 'Muhammad Aslam'}
                    </span>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#0F8B78]">
                      {currentUser?.role || 'Super Admin'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Log out of system"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#64748B] hover:text-[#DC5353] hover:bg-rose-50 rounded-lg border border-[#E2E8F0] hover:border-rose-200 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-[#0F8B78] hover:bg-[#0D7A69] rounded-lg shadow-2xs transition-all"
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
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search PRJ-101 or project..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-100/80 text-xs text-[#172B4D] rounded-lg border border-[#E2E8F0] focus:border-[#0F8B78] focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>
      </header>

      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}
    </>
  );
}
