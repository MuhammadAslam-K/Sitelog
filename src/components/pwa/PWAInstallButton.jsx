import React, { useState } from 'react';
import { Download, Share, PlusSquare, X, Smartphone, CheckCircle } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall.js';

export function PWAInstallButton({ className = '', variant = 'navbar' }) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // Suppress button if already running as an installed standalone PWA
  if (isInstalled) {
    return null;
  }

  // Desktop Chromium / Android native prompt
  if (isInstallable) {
    if (variant === 'sidebar') {
      return (
        <button
          onClick={install}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-[#0F8B78] hover:bg-[#0d7867] text-white transition-all shadow-2xs ${className}`}
          title="Install Kerala Roadways PMS as a desktop or mobile application"
        >
          <Download className="w-4 h-4 text-amber-300 shrink-0" />
          <span className="truncate">Install App</span>
        </button>
      );
    }

    return (
      <button
        onClick={install}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#0F8B78] text-white hover:bg-[#0d7867] shadow-2xs transition-all ${className}`}
        title="Install Kerala Roadways PMS on your device"
      >
        <Download className="w-3.5 h-3.5 text-amber-300" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        {variant === 'sidebar' ? (
          <button
            onClick={() => setShowIOSModal(true)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-[#213963] hover:bg-[#284474] text-slate-100 border border-[#2d4d84] transition-all ${className}`}
          >
            <Smartphone className="w-4 h-4 text-teal-300 shrink-0" />
            <span className="truncate">Install on iPhone</span>
          </button>
        ) : (
          <button
            onClick={() => setShowIOSModal(true)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#172B4D] text-white hover:bg-[#213963] border border-[#213963] shadow-2xs transition-all ${className}`}
          >
            <Smartphone className="w-3.5 h-3.5 text-teal-300" />
            <span>Install App</span>
          </button>
        )}

        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#E2E8F0] text-[#172B4D]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#172B4D] flex items-center justify-center text-[#0F8B78] shadow-2xs">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#172B4D] leading-tight">Install on iOS</h3>
                    <p className="text-xs text-[#64748B]">Kerala Roadways PMS</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSModal(false)}
                  className="p-1.5 text-[#64748B] hover:text-[#172B4D] rounded-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-5 space-y-3.5 text-xs text-[#172B4D]">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-[#E2E8F0]">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[11px] shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-[#172B4D]">Tap the Safari Share Button</p>
                    <p className="text-[#64748B] mt-0.5">Located in the bottom toolbar of Safari (box with upward arrow <Share className="w-3.5 h-3.5 inline text-blue-700" />).</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-[#E2E8F0]">
                  <div className="w-6 h-6 rounded-full bg-[#0F8B78]/15 text-[#0F8B78] flex items-center justify-center font-bold text-[11px] shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-[#172B4D]">Select "Add to Home Screen"</p>
                    <p className="text-[#64748B] mt-0.5">Scroll down in the action sheet and tap <PlusSquare className="w-3.5 h-3.5 inline text-[#0F8B78]" /> <strong>Add to Home Screen</strong>.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#0F8B78]/10 border border-[#0F8B78]/25 text-[#0F8B78] text-[11px]">
                  <CheckCircle className="w-4 h-4 text-[#0F8B78] shrink-0" />
                  <span>Launches in fullscreen standalone mode without browser bars.</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSModal(false)}
                className="mt-5 w-full py-2.5 px-4 rounded-xl bg-[#172B4D] hover:bg-[#213963] text-white font-semibold text-xs transition-colors shadow-2xs"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}
