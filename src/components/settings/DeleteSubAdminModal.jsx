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
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-[#DC5353] text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-[#DC5353] mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-rose-950">Revoke access and delete account?</p>
            <p className="text-rose-800">
              This will permanently delete this sub-admin account. They will no longer be able to log in or access any PMS modules.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0] text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[#64748B]">Name:</span>
            <span className="font-bold text-[#172B4D]">{subAdmin.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#64748B]">Username:</span>
            <span className="font-mono font-bold text-[#172B4D]">{subAdmin.username}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#64748B]">Email:</span>
            <span className="font-medium text-[#172B4D]">{subAdmin.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#64748B]">Role & Designation:</span>
            <span className="font-semibold text-[#0F8B78]">{subAdmin.designation || subAdmin.role}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-bold text-[#172B4D] hover:bg-slate-100 border border-[#E2E8F0] rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-bold text-white bg-[#DC5353] hover:bg-red-700 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
