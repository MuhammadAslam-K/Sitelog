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
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-rose-900">Are you sure you want to delete this material entry?</p>
            <p className="text-rose-700">
              This action cannot be undone. The material supply record and procurement value will be permanently removed.
            </p>
          </div>
        </div>

        {/* Material Summary Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Material Entry ID:</span>
            <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
              {material.materialId}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Item:</span>
            <span className="font-bold text-slate-800">{material.item}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Quantity:</span>
            <span className="font-semibold text-slate-800 font-mono">{material.quantity}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Project:</span>
            <span className="font-medium text-slate-700 truncate max-w-[200px]">
              {material.projectName || material.projectId}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Agent / Supplier:</span>
            <span className="font-medium text-slate-700">{material.agent}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <span className="text-slate-500 font-semibold">Total Amount:</span>
            <span className="font-bold font-mono text-rose-700 text-sm">
              {formatIndianCurrency(material.amount)}
            </span>
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
