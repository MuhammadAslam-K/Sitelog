import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X, Sparkles } from 'lucide-react';

export function PWAUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        console.log('SW Registered: ', r);
      }
    },
    onRegisterError(error) {
      console.warn('SW registration error', error);
    },
  });

  if (!needRefresh) {
    return null;
  }

  return (
    <div 
      role="alert"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-3 p-3.5 rounded-2xl bg-[#172B4D] text-white shadow-2xl border border-[#213963] max-w-sm animate-in slide-in-from-bottom-2 duration-300"
    >
      <div className="w-8 h-8 rounded-xl bg-[#0F8B78] flex items-center justify-center shrink-0 text-white shadow-2xs">
        <Sparkles className="w-4 h-4 text-amber-300" />
      </div>

      <div className="flex-1 min-w-0 text-xs">
        <p className="font-bold text-white">App Update Available</p>
        <p className="text-slate-300 text-[11px] truncate">New version ready for Kerala Roadways PMS.</p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => updateServiceWorker(true)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0F8B78] hover:bg-[#0d7867] text-white font-bold text-xs transition-colors shadow-2xs"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Update</span>
        </button>
        <button
          onClick={() => setNeedRefresh(false)}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#213963] transition-colors"
          title="Dismiss update notice"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
