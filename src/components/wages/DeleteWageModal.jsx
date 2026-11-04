import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { formatIndianCurrency, formatDate } from '../../utils/formatters.js';

export function DeleteWageModal({
  isOpen,
  onClose,
  onConfirm,
  wageEntry,
  isLoading = false
}) {
  if (!wageEntry) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Delete Wage Entry: ${wageEntry.wageId}`}
      subtitle="Remove Daily Muster Record"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <p className="font-bold text-sm mb-1">Confirm Wage Entry Removal</p>
            <p>
              Are you sure you want to delete this muster entry for{' '}
              <strong className="text-rose-950">{wageEntry.employeeName}</strong> on{' '}
              <strong className="font-mono text-rose-950">{formatDate(wageEntry.date)}</strong>? This action will remove the record from the daily ledger.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500">Employee:</span>
            <span className="font-bold text-slate-800">{wageEntry.employeeName} ({wageEntry.employeeRole})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Project Site:</span>
            <span className="font-semibold text-slate-800 truncate max-w-[200px]">{wageEntry.projectName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Attendance:</span>
            <span className="font-semibold text-slate-800">{wageEntry.attendance}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Advance Given:</span>
            <span className="font-mono font-bold text-amber-800">{formatIndianCurrency(wageEntry.advance)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Earned Wage:</span>
            <span className="font-mono font-bold text-slate-800">{formatIndianCurrency(wageEntry.wages)}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-xs"
          >
            <Trash2 className="w-4 h-4" />
            {isLoading ? 'Deleting...' : 'Delete Wage Record'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
