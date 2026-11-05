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
      className="fixed bottom-4 left-4 z-50 flex items-center gap-3 p-3.5 rounded-2xl bg-[#172B3A] text-white shadow-2xl border border-emerald-500/40 max-w-sm animate-in slide-in-from-bottom-2 duration-300"
    >
      <div className="w-8 h-8 rounded-xl bg-emerald-700/80 flex items-center justify-center shrink-0 text-emerald-300">
        <Sparkles className="w-4 h-4 text-amber-400" />
      </div>

      <div className="flex-1 min-w-0 text-xs">
        <p className="font-bold text-slate-100">App Update Available</p>
        <p className="text-slate-400 text-[11px] truncate">New version ready for Kerala Roadways PMS.</p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => updateServiceWorker(true)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-xs"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Update</span>
        </button>
        <button
          onClick={() => setNeedRefresh(false)}
          className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          title="Dismiss update notice"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
