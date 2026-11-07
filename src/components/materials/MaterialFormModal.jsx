import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Building2, 
  IndianRupee, 
  Save, 
  AlertCircle,
  Boxes,
  Truck,
  UserCheck,
  Scale,
  FileText,
  Tag,
  CheckCircle2
} from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { 
  COMMON_MATERIAL_ITEMS, 
  MATERIAL_UNITS, 
  COMMON_MATERIAL_AGENTS 
} from '../../utils/constants.js';
import { formatIndianCurrency } from '../../utils/formatters.js';

export function MaterialFormModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  projects = [],
  nextSuggestedId = 'MAT-101'
}) {
  const isEditMode = !!initialData;
  const activeProjects = projects.filter((p) => !p.isArchived);

  const [formData, setFormData] = useState({
    materialId: '',
    date: new Date().toISOString().split('T')[0],
    projectId: '',
    projectName: '',
    item: '',
    quantity: '',
    unit: 'Tons',
    agent: '',
    amount: '',
    vehicleNumber: '',
    challanNo: '',
    status: 'Received',
    notes: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        materialId: initialData.materialId || '',
        date: initialData.date || new Date().toISOString().split('T')[0],
        projectId: initialData.projectId || '',
        projectName: initialData.projectName || '',
        item: initialData.item || '',
        quantity: initialData.quantity || '',
        unit: initialData.unit || 'Tons',
        agent: initialData.agent || '',
        amount: String(initialData.amount !== undefined ? initialData.amount : ''),
        vehicleNumber: initialData.vehicleNumber || '',
        challanNo: initialData.challanNo || '',
        status: initialData.status || 'Received',
        notes: initialData.notes || ''
      });
    } else {
      const defaultProj = activeProjects[0] || null;
      setFormData({
        materialId: nextSuggestedId || 'MAT-101',
        date: new Date().toISOString().split('T')[0],
        projectId: defaultProj ? defaultProj.projectId : '',
        projectName: defaultProj ? defaultProj.projectName : '',
        item: '',
        quantity: '',
        unit: 'Tons',
        agent: '',
        amount: '',
        vehicleNumber: '',
        challanNo: '',
        status: 'Received',
        notes: ''
      });
    }
    setValidationErrors({});
  }, [initialData, nextSuggestedId, isOpen]);

  const handleProjectChange = (projId) => {
    const proj = projects.find((p) => p.projectId === projId);
    if (proj) {
      setFormData((prev) => ({
        ...prev,
        projectId: proj.projectId,
        projectName: proj.projectName
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        projectId: projId,
        projectName: 'General Project'
      }));
    }
  };

  const handleQuickItemSelect = (itemName) => {
    setFormData((prev) => ({
      ...prev,
      item: itemName
    }));
    if (validationErrors.item) {
      setValidationErrors((prev) => ({ ...prev, item: null }));
    }
  };

  const handleQuickAgentSelect = (agentName) => {
    setFormData((prev) => ({
      ...prev,
      agent: agentName
    }));
    if (validationErrors.agent) {
      setValidationErrors((prev) => ({ ...prev, agent: null }));
    }
  };

  const validate = () => {
    const errors = {};

    if (!formData.date) {
      errors.date = 'Date is required';
    }

    if (!formData.projectId) {
      errors.projectId = 'Please select a project';
    }

    if (!formData.item || !formData.item.trim()) {
      errors.item = 'Material item name is required';
    }

    if (!formData.quantity || !String(formData.quantity).trim()) {
      errors.quantity = 'Quantity is required';
    }

    if (!formData.agent || !formData.agent.trim()) {
      errors.agent = 'Agent / supplier / quarry name is required';
    }

    const amt = Number(formData.amount);
    if (formData.amount === '' || formData.amount === null || isNaN(amt)) {
      errors.amount = 'Amount is required and must be a number';
    } else if (amt < 0) {
      errors.amount = 'Amount cannot be negative';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        ...formData,
        amount: Number(formData.amount) || 0
      });
      onClose();
    } catch (err) {
      console.error('Error saving material:', err);
      setValidationErrors((prev) => ({
        ...prev,
        submit: err.message || 'Failed to save material record.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? `Edit Material Entry: ${formData.materialId}` : 'Add Material Procurement Entry'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {validationErrors.submit && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-[#DC5353] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#DC5353]" />
            <span>{validationErrors.submit}</span>
          </div>
        )}

        {/* Top Info Bar */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-[#E2E8F0] text-xs">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-[#0F8B78]" />
            <span className="font-semibold text-[#172B4D]">
              {isEditMode ? 'Editing Material Record' : 'New Material Inflow'}
            </span>
          </div>
          <span className="font-mono font-bold text-[#0F8B78] px-2.5 py-0.5 rounded bg-white border border-[#E2E8F0]">
            {formData.materialId || nextSuggestedId}
          </span>
        </div>

        {/* Date and Project Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#172B4D] mb-1.5">
              Receipt Date <span className="text-[#DC5353]">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border bg-white text-[#172B4D] focus:outline-none focus:ring-2 transition-all ${
                  validationErrors.date
                    ? 'border-rose-300 focus:ring-rose-500/20'
                    : 'border-[#E2E8F0] focus:border-[#0F8B78] focus:ring-[#0F8B78]/20'
                }`}
                required
              />
            </div>
            {validationErrors.date && (
              <p className="text-[11px] text-[#DC5353] mt-1">{validationErrors.date}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B4D] mb-1.5">
              Assigned Project <span className="text-[#DC5353]">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <select
                value={formData.projectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                className={`w-full pl-9 pr-8 py-2 text-sm rounded-xl border bg-white text-[#172B4D] focus:outline-none focus:ring-2 transition-all truncate ${
                  validationErrors.projectId
                    ? 'border-rose-300 focus:ring-rose-500/20'
                    : 'border-[#E2E8F0] focus:border-[#0F8B78] focus:ring-[#0F8B78]/20'
                }`}
                required
              >
                <option value="" disabled>Select Road Project</option>
                {activeProjects.map((p) => (
                  <option key={p.projectId} value={p.projectId}>
                    {p.projectId} - {p.projectName}
                  </option>
                ))}
              </select>
            </div>
            {validationErrors.projectId && (
              <p className="text-[11px] text-[#DC5353] mt-1">{validationErrors.projectId}</p>
            )}
          </div>
        </div>

        {/* Material Item */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-[#172B4D]">
              Material Item <span className="text-[#DC5353]">*</span>
            </label>
            <span className="text-[10px] text-[#64748B]">Click quick tag or type custom</span>
          </div>

          <div className="relative mb-2">
            <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              placeholder="e.g. Bitumen VG-30, M-Sand, 20mm Aggregates, Cement 53"
              value={formData.item}
              onChange={(e) => setFormData({ ...formData, item: e.target.value })}
              className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border bg-white text-[#172B4D] focus:outline-none focus:ring-2 transition-all ${
                validationErrors.item
                  ? 'border-rose-300 focus:ring-rose-500/20'
                  : 'border-[#E2E8F0] focus:border-[#0F8B78] focus:ring-[#0F8B78]/20'
              }`}
              required
            />
          </div>
          {validationErrors.item && (
            <p className="text-[11px] text-[#DC5353] mb-2">{validationErrors.item}</p>
          )}

          {/* Quick select tags */}
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-[#E2E8F0]">
            {COMMON_MATERIAL_ITEMS.slice(0, 10).map((mat) => (
              <button
                type="button"
                key={mat}
                onClick={() => handleQuickItemSelect(mat)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all text-left truncate ${
                  formData.item === mat
                    ? 'bg-[#0F8B78] text-white border-[#0F8B78] font-semibold shadow-2xs'
                    : 'bg-white hover:bg-[#0F8B78]/10 text-[#172B4D] border-[#E2E8F0]'
                }`}
              >
                {mat}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity and Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#172B4D] mb-1.5">
              Quantity <span className="text-[#DC5353]">*</span>
            </label>
            <div className="relative">
              <Scale className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                placeholder="e.g. 18 Tons, 4 Loads, 350 Bags"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border bg-white text-[#172B4D] focus:outline-none focus:ring-2 transition-all ${
                  validationErrors.quantity
                    ? 'border-rose-300 focus:ring-rose-500/20'
                    : 'border-[#E2E8F0] focus:border-[#0F8B78] focus:ring-[#0F8B78]/20'
                }`}
                required
              />
            </div>
            {validationErrors.quantity && (
              <p className="text-[11px] text-[#DC5353] mt-1">{validationErrors.quantity}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B4D] mb-1.5">
              Unit of Measure
            </label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#E2E8F0] bg-white text-[#172B4D] focus:outline-none focus:border-[#0F8B78] focus:ring-2 focus:ring-[#0F8B78]/20 transition-all"
            >
              {MATERIAL_UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Agent / Supplier */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-[#172B4D]">
              Agent / Supplier / Quarry <span className="text-[#DC5353]">*</span>
            </label>
            <span className="text-[10px] text-[#64748B]">Vendor or quarry source</span>
          </div>
          <div className="relative mb-2">
            <UserCheck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              placeholder="e.g. Malabar Bitumen Distributors, Kozhikode"
              value={formData.agent}
              onChange={(e) => setFormData({ ...formData, agent: e.target.value })}
              className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border bg-white text-[#172B4D] focus:outline-none focus:ring-2 transition-all ${
                validationErrors.agent
                  ? 'border-rose-300 focus:ring-rose-500/20'
                  : 'border-[#E2E8F0] focus:border-[#0F8B78] focus:ring-[#0F8B78]/20'
              }`}
              required
            />
          </div>
          {validationErrors.agent && (
            <p className="text-[11px] text-[#DC5353] mb-2">{validationErrors.agent}</p>
          )}

          {/* Quick select suppliers */}
          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-[#E2E8F0]">
            {COMMON_MATERIAL_AGENTS.slice(0, 5).map((agt) => (
              <button
                type="button"
                key={agt}
                onClick={() => handleQuickAgentSelect(agt)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all text-left truncate ${
                  formData.agent === agt
                    ? 'bg-[#0F8B78] text-white border-[#0F8B78] font-semibold shadow-2xs'
                    : 'bg-white hover:bg-[#0F8B78]/10 text-[#172B4D] border-[#E2E8F0]'
                }`}
              >
                {agt}
              </button>
            ))}
          </div>
        </div>

        {/* Amount & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#172B4D] mb-1.5">
              Total Amount (₹) <span className="text-[#DC5353]">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#64748B]">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={`w-full pl-9 pr-3 py-2 text-sm font-mono tabular-nums font-bold rounded-xl border bg-white text-[#172B4D] focus:outline-none focus:ring-2 transition-all ${
                  validationErrors.amount
                    ? 'border-rose-300 focus:ring-rose-500/20'
                    : 'border-[#E2E8F0] focus:border-[#0F8B78] focus:ring-[#0F8B78]/20'
                }`}
                required
              />
            </div>
            {formData.amount && !isNaN(Number(formData.amount)) && Number(formData.amount) > 0 && (
              <p className="text-[11px] text-[#0F8B78] font-semibold mt-1">
                Amount: {formatIndianCurrency(Number(formData.amount))}
              </p>
            )}
            {validationErrors.amount && (
              <p className="text-[11px] text-[#DC5353] mt-1">{validationErrors.amount}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B4D] mb-1.5">
              Delivery / Payment Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#E2E8F0] bg-white text-[#172B4D] focus:outline-none focus:border-[#0F8B78] focus:ring-2 focus:ring-[#0F8B78]/20 transition-all font-medium"
            >
              <option value="Received">Received / Delivered</option>
              <option value="Paid">Paid in Full</option>
              <option value="Pending Payment">Pending Payment</option>
              <option value="In Transit">In Transit / Dispatched</option>
            </select>
          </div>
        </div>

        {/* Site Delivery Tracking (Vehicle No & Challan No) */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0] space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#172B4D]">
            <Truck className="w-4 h-4 text-[#0F8B78]" />
            <span>Site Logistics & Challan Details (Optional)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                Lorry / Tipper Registration No.
              </label>
              <input
                type="text"
                placeholder="e.g. KL-11-BH-9821"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                className="w-full px-3 py-1.5 text-xs uppercase font-mono rounded-lg border border-[#E2E8F0] bg-white text-[#172B4D] focus:outline-none focus:border-[#0F8B78]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                Delivery Challan / Bill No.
              </label>
              <input
                type="text"
                placeholder="e.g. CH-2026/891"
                value={formData.challanNo}
                onChange={(e) => setFormData({ ...formData, challanNo: e.target.value })}
                className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-[#E2E8F0] bg-white text-[#172B4D] focus:outline-none focus:border-[#0F8B78]"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-[#172B4D] mb-1.5">
            Supervisor Notes / Remarks (Optional)
          </label>
          <textarea
            rows="2"
            placeholder="e.g. Tested sample at hot mix plant; quality approved by site engineer."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-white text-[#172B4D] focus:outline-none focus:border-[#0F8B78] focus:ring-2 focus:ring-[#0F8B78]/20 transition-all resize-none"
          />
        </div>

        {/* Modal Action Buttons */}
        <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-bold text-[#172B4D] hover:bg-slate-100 border border-[#E2E8F0] rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-bold text-white bg-[#0F8B78] hover:bg-[#0d7867] disabled:opacity-50 rounded-xl transition-colors shadow-2xs flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : isEditMode ? 'Update Material' : 'Save Material Entry'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
