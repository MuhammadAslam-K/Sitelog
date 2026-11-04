import React, { useState } from 'react';
import { AlertTriangle, Trash2, User } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';

export function DeleteSubAdminModal({
  isOpen,
  onClose,
  onConfirm,
  subAdmin
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!subAdmin) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(subAdmin.userId || subAdmin.id);
      onClose();
    } catch (err) {
      console.error('Failed to delete sub-admin:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Sub-Admin Account"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-rose-900">Revoke access and delete account?</p>
            <p className="text-rose-700">
              This will permanently delete this sub-admin account. They will no longer be able to log in or access any PMS modules.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Name:</span>
            <span className="font-bold text-slate-800">{subAdmin.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Username:</span>
            <span className="font-mono font-bold text-slate-800">{subAdmin.username}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Email:</span>
            <span className="font-medium text-slate-700">{subAdmin.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Role & Designation:</span>
            <span className="font-semibold text-emerald-800">{subAdmin.designation || subAdmin.role}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
