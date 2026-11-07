import React, { useState } from 'react';
import { AlertTriangle, Trash2, Boxes } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { formatIndianCurrency } from '../../utils/formatters.js';

export function DeleteMaterialModal({
  isOpen,
  onClose,
  onConfirm,
  material
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!material) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(material.materialId || material.id);
      onClose();
    } catch (err) {
      console.error('Failed to delete material record:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Material Record"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-[#DC5353] text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-[#DC5353] mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-rose-950">Are you sure you want to delete this material entry?</p>
            <p className="text-rose-800">
              This action cannot be undone. The material supply record and procurement value will be permanently removed.
            </p>
          </div>
        </div>

        {/* Material Summary Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0] text-xs space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <span className="text-[#64748B] font-medium">Material Entry ID:</span>
            <span className="font-mono font-bold text-[#0F8B78] bg-white px-2 py-0.5 rounded border border-[#E2E8F0]">
              {material.materialId}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#64748B]">Item:</span>
            <span className="font-bold text-[#172B4D]">{material.item}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#64748B]">Quantity:</span>
            <span className="font-semibold text-[#172B4D] font-mono tabular-nums">{material.quantity}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#64748B]">Project:</span>
            <span className="font-medium text-[#172B4D] truncate max-w-[200px]">
              {material.projectName || material.projectId}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#64748B]">Agent / Supplier:</span>
            <span className="font-medium text-[#172B4D]">{material.agent}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
            <span className="text-[#64748B] font-semibold">Total Amount:</span>
            <span className="font-bold font-mono tabular-nums text-[#DC5353] text-sm">
              {formatIndianCurrency(material.amount)}
            </span>
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
