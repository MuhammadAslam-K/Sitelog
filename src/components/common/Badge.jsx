import React from 'react';

export function StatusBadge({ status, isArchived = false }) {
  if (isArchived) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-[#64748B] border border-[#E2E8F0]">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
        Archived
      </span>
    );
  }

  switch (status) {
    case 'Ongoing':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0F8B78]/10 text-[#0F8B78] border border-[#0F8B78]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0F8B78] animate-pulse"></span>
          Ongoing
        </span>
      );
    case 'Completed':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          Completed
        </span>
      );
    case 'Pending':
    case 'On Hold':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F4B740]"></span>
          Pending
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-[#172B4D] border border-[#E2E8F0]">
          {status || 'Unknown'}
        </span>
      );
  }
}

export function TagBadge({ text, variant = 'slate' }) {
  const styles = {
    slate: 'bg-slate-100 text-[#172B4D] border-[#E2E8F0]',
    teal: 'bg-[#0F8B78]/10 text-[#0F8B78] border-[#0F8B78]/30',
    green: 'bg-[#0F8B78]/10 text-[#0F8B78] border-[#0F8B78]/30',
    navy: 'bg-[#172B4D]/10 text-[#172B4D] border-[#172B4D]/25',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-[#DC5353] border-rose-200'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[variant] || styles.slate}`}>
      {text}
    </span>
  );
}
