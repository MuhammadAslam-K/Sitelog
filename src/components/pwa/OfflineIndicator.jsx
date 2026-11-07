import React from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus.js';

export function OfflineIndicator() {
  const { isOnline, showReconnected } = useOnlineStatus();

  if (isOnline && !showReconnected) {
    return null;
  }

  if (!isOnline) {
    return (
      <div 
        role="status"
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#F4B740] text-slate-950 font-semibold text-xs shadow-xl border border-amber-300 animate-in slide-in-from-bottom-2 duration-200"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-950"></span>
        </span>
        <WifiOff className="w-4 h-4 text-slate-950" />
        <div>
          <span className="font-bold">Offline Mode:</span> Working with cached app shell.
        </div>
      </div>
    );
  }

  if (showReconnected) {
    return (
      <div 
        role="status"
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#16A36A] text-white font-semibold text-xs shadow-xl border border-emerald-400 animate-in slide-in-from-bottom-2 duration-200"
      >
        <Wifi className="w-4 h-4 text-white" />
        <div>
          <span className="font-bold">Back Online:</span> Connected to live Firestore server.
        </div>
      </div>
    );
  }

  return null;
}
