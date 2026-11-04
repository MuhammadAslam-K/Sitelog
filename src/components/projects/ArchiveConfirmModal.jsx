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
          isArchiving ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          {isArchiving ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          )}
          <div className="text-xs leading-relaxed">
            <p className="font-bold text-sm mb-1">
              {isArchiving ? 'Soft Archive Action' : 'Reactivate Project'}
            </p>
            <p>
              {isArchiving ? (
                <>
                  Project <strong className="font-mono">{project.projectId} - {project.projectName}</strong> will be moved to the archive list.
                  Permanent deletion is prohibited to protect historical and future linked wage, expense, and material ledger records.
                </>
              ) : (
                <>
                  Project <strong className="font-mono">{project.projectId}</strong> will be restored to active projects and recalculate into standard dashboard metrics.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">Local Body:</span>
            <span className="font-semibold text-slate-800">{project.localBody}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Work Type:</span>
            <span className="font-semibold text-slate-800">{project.workType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Status:</span>
            <span className="font-semibold text-slate-800">{project.status}</span>
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
            {isLoading ? 'Processing...' : isArchiving ? 'Archive Project' : 'Restore to Active'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
