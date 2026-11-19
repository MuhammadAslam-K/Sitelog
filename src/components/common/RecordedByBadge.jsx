import React from 'react';
import { ShieldCheck, User } from 'lucide-react';
import { formatRecordedBy } from '../../utils/formatters.js';

export function RecordedByBadge({ createdBy, updatedBy, settledBy, align = 'left' }) {
  const actor = formatRecordedBy(createdBy);
  const isAdmin = actor === 'Admin';
  const settler = settledBy ? formatRecordedBy(settledBy) : null;
  const updater = updatedBy ? formatRecordedBy(updatedBy) : null;

  return (
    <div
      className={`flex flex-col gap-0.5 ${
        align === 'center' ? 'items-center' : align === 'right' ? 'items-end' : 'items-start'
      }`}
    >
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] border whitespace-nowrap ${
          isAdmin
            ? 'bg-[#0F8B78]/10 text-[#0F8B78] border-[#0F8B78]/25 font-bold'
            : 'bg-blue-50 text-blue-800 border-blue-200 font-semibold'
        }`}
        title={`Added by ${actor}${updater ? ` • Updated by ${updater}` : ''}${settler ? ` • Settled by ${settler}` : ''}`}
      >
        {isAdmin ? (
          <ShieldCheck className="w-3 h-3 text-[#0F8B78] shrink-0" />
        ) : (
          <User className="w-3 h-3 text-blue-600 shrink-0" />
        )}
        <span>{actor}</span>
      </span>
      {settler && settler !== actor && (
        <span className="text-[10px] text-[#64748B] whitespace-nowrap">
          Settled: {settler}
        </span>
      )}
    </div>
  );
}
