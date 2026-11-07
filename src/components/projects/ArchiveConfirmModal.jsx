import React from 'react';
import { Archive, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';

export function ArchiveConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  project,
  isArchiving = true,
  isLoading = false
}) {
  if (!project) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isArchiving ? `Archive Project ${project.projectId}` : `Restore Project ${project.projectId}`}
      subtitle="Data Preservation & Integrity Assurance"
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
              {isArchiving ? 'Soft Archive Action' : 'Reactivate Project'}
            </p>
            <p className="text-[#64748B]">
              {isArchiving ? (
                <>
                  Project <strong className="font-mono text-[#172B4D]">{project.projectId} - {project.projectName}</strong> will be moved to the archive list.
                  Permanent deletion is prohibited to protect historical and future linked wage, expense, and material ledger records.
                </>
              ) : (
                <>
                  Project <strong className="font-mono text-[#0F8B78]">{project.projectId}</strong> will be restored to active projects and recalculate into standard dashboard metrics.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-[#E2E8F0] text-xs text-[#64748B] space-y-1">
          <div className="flex justify-between">
            <span className="text-[#64748B]">Local Body:</span>
            <span className="font-semibold text-[#172B4D]">{project.localBody}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#64748B]">Work Type:</span>
            <span className="font-semibold text-[#172B4D]">{project.workType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#64748B]">Status:</span>
            <span className="font-semibold text-[#172B4D]">{project.status}</span>
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
            {isLoading ? 'Processing...' : isArchiving ? 'Archive Project' : 'Restore to Active'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
