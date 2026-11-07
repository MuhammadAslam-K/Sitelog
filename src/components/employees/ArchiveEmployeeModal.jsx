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
          isArchiving ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-[#0F8B78]/10 border-[#0F8B78]/30 text-[#0F8B78]'
        }`}>
          {isArchiving ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-[#0F8B78] shrink-0 mt-0.5" />
          )}
          <div className="text-xs leading-relaxed">
            <p className="font-bold text-sm mb-1 text-[#172B4D]">
              {isArchiving ? 'Archive Employee Record' : 'Reactivate Employee Record'}
            </p>
            <p className="text-[#64748B]">
              {isArchiving ? (
                <>
                  Employee <strong className="font-mono text-[#172B4D]">{employee.employeeId} - {employee.name}</strong> will be moved to the archive list.
                  Permanent deletion is disabled to preserve past wage payments and audit history.
                </>
              ) : (
                <>
                  Employee <strong className="font-mono text-[#0F8B78]">{employee.employeeId}</strong> will be reactivated in the active workforce directory.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-[#E2E8F0] text-xs text-[#64748B] space-y-1">
          <div className="flex justify-between">
            <span className="text-[#64748B]">Role:</span>
            <span className="font-semibold text-[#172B4D]">{employee.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#64748B]">Phone:</span>
            <span className="font-mono font-semibold text-[#172B4D]">{employee.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#64748B]">Total Wages:</span>
            <span className="font-mono font-bold text-[#172B4D] tabular-nums">₹{employee.totalWages?.toLocaleString('en-IN') || 0}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#172B4D] bg-white hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-2xs ${
              isArchiving
                ? 'bg-[#F4B740] hover:bg-[#e0a32d] text-slate-900'
                : 'bg-[#0F8B78] hover:bg-[#0D7A69]'
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
