import React from 'react';
import { Archive, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';

export function ArchiveEmployeeModal({
  isOpen,
  onClose,
  onConfirm,
  employee,
  isArchiving = true,
  isLoading = false
}) {
  if (!employee) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isArchiving ? `Archive Employee ${employee.employeeId}` : `Restore Employee ${employee.employeeId}`}
      subtitle="Payroll & Workforce Record Preservation"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className={`p-4 rounded-xl border flex items-start gap-3 ${
          isArchiving ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          {isArchiving ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          )}
          <div className="text-xs leading-relaxed">
            <p className="font-bold text-sm mb-1">
              {isArchiving ? 'Archive Employee Record' : 'Reactivate Employee Record'}
            </p>
            <p>
              {isArchiving ? (
                <>
                  Employee <strong className="font-mono">{employee.employeeId} - {employee.name}</strong> will be moved to the archive list.
                  Permanent deletion is disabled to preserve past wage payments and audit history.
                </>
              ) : (
                <>
                  Employee <strong className="font-mono">{employee.employeeId}</strong> will be reactivated in the active workforce directory.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">Role:</span>
            <span className="font-semibold text-slate-800">{employee.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Phone:</span>
            <span className="font-mono font-semibold text-slate-800">{employee.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Total Wages:</span>
            <span className="font-mono font-bold text-emerald-900">₹{employee.totalWages?.toLocaleString('en-IN') || 0}</span>
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
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-xs ${
              isArchiving
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-emerald-700 hover:bg-emerald-800'
            }`}
          >
            {isArchiving ? <Archive className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
            {isLoading ? 'Processing...' : isArchiving ? 'Archive Employee' : 'Restore Employee'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
