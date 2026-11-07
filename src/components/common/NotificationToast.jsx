import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function NotificationToast({ notification, onDismiss }) {
  if (!notification) return null;

  const { type = 'success', message, title } = notification;

  const typeConfig = {
    success: {
      bg: 'bg-[#0F8B78] text-white border-[#0d7867]',
      icon: <CheckCircle2 className="w-5 h-5 text-teal-100 shrink-0" />
    },
    error: {
      bg: 'bg-[#DC5353] text-white border-red-700',
      icon: <AlertCircle className="w-5 h-5 text-rose-100 shrink-0" />
    },
    info: {
      bg: 'bg-[#172B4D] text-white border-[#213963]',
      icon: <Info className="w-5 h-5 text-teal-300 shrink-0" />
    }
  };

  const current = typeConfig[type] || typeConfig.info;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-300">
      <div className={`flex items-start gap-3 p-4 rounded-xl shadow-xl border ${current.bg}`}>
        {current.icon}
        <div className="flex-1 text-sm">
          {title && <p className="font-semibold text-white mb-0.5">{title}</p>}
          <p className="text-slate-200 text-xs leading-relaxed">{message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
