import React, { useState } from 'react';
import { Trash2, AlertTriangle, Building2, Calendar, IndianRupee } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { formatIndianCurrency } from '../../utils/formatters.js';

export function DeleteExpenseModal({
  isOpen,
  onClose,
  onConfirm,
  expenseEntry
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!expenseEntry) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(expenseEntry);
      onClose();
    } catch (err) {
      console.error('Delete expense error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Daily Expense"
      subtitle="Confirm permanent removal of this site expenditure record"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-[#DC5353]">
          <AlertTriangle className="w-5 h-5 text-[#DC5353] shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-[#172B4D]">Are you sure you want to delete this expense record?</p>
            <p className="text-[#64748B]">
              This action cannot be undone. The project's overall expense metrics will automatically adjust.
            </p>
          </div>
        </div>

        {/* Expense Detail Summary */}
        <div className="bg-slate-50 rounded-xl p-4 border border-[#E2E8F0] text-xs space-y-2">
          <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
            <span className="text-[#0F8B78] font-mono font-bold">{expenseEntry.expenseId}</span>
            <span className="font-semibold text-[#172B4D] capitalize bg-white px-2 py-0.5 rounded border border-[#E2E8F0]">
              {expenseEntry.category}
            </span>
          </div>

          <div className="pt-1">
            <div className="text-xs text-[#64748B]">Item Description:</div>
            <div className="text-sm font-bold text-[#172B4D]">{expenseEntry.item}</div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-[#64748B]">
            <div>
              <span className="text-slate-400">Date:</span> {expenseEntry.date}
            </div>
            <div>
              <span className="text-slate-400">Project:</span> {expenseEntry.projectName || expenseEntry.projectId}
            </div>
            {expenseEntry.quantity && (
              <div>
                <span className="text-slate-400">Quantity:</span> {expenseEntry.quantity}
              </div>
            )}
            {expenseEntry.agent && (
              <div>
                <span className="text-slate-400">Agent:</span> {expenseEntry.agent}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-[#E2E8F0] flex justify-between items-center">
            <span className="text-[#172B4D] font-semibold">Amount to Remove:</span>
            <span className="text-base font-extrabold text-[#DC5353] font-mono tabular-nums">
              {formatIndianCurrency(Number(expenseEntry.amount) || 0)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-[#172B4D] hover:bg-slate-50 border border-[#E2E8F0] rounded-xl transition-colors bg-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#DC5353] hover:bg-[#c94040] rounded-xl transition-colors shadow-2xs disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? 'Deleting...' : 'Delete Expense'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
