import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Building2, 
  IndianRupee, 
  Save, 
  AlertCircle,
  Truck,
  Package,
  Fuel,
  Utensils,
  MoreHorizontal,
  FileText,
  UserCheck,
  Scale
} from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { EXPENSE_CATEGORIES } from '../../utils/constants.js';
import { formatIndianCurrency } from '../../utils/formatters.js';

export function ExpenseFormModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  projects = [],
  nextSuggestedId = 'EXP-101'
}) {
  const isEditMode = !!initialData;
  const activeProjects = projects.filter((p) => !p.isArchived);

  const [formData, setFormData] = useState({
    expenseId: '',
    date: new Date().toISOString().split('T')[0],
    projectId: '',
    projectName: '',
    category: 'fuel',
    item: '',
    amount: '',
    quantity: '',
    agent: '',
    notes: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        expenseId: initialData.expenseId || '',
        date: initialData.date || new Date().toISOString().split('T')[0],
        projectId: initialData.projectId || '',
        projectName: initialData.projectName || '',
        category: initialData.category || 'fuel',
        item: initialData.item || '',
        amount: String(initialData.amount !== undefined ? initialData.amount : ''),
        quantity: initialData.quantity || '',
        agent: initialData.agent || '',
        notes: initialData.notes || ''
      });
    } else {
      const defaultProj = activeProjects[0] || null;
      setFormData({
        expenseId: nextSuggestedId || 'EXP-101',
        date: new Date().toISOString().split('T')[0],
        projectId: defaultProj ? defaultProj.projectId : 'GENERAL',
        projectName: defaultProj ? defaultProj.projectName : 'General Site Overhead',
        category: 'fuel',
        item: '',
        amount: '',
        quantity: '',
        agent: '',
        notes: ''
      });
    }
    setValidationErrors({});
  }, [initialData, nextSuggestedId, isOpen]);

  // Handle project selection change
  const handleProjectChange = (projId) => {
    if (projId === 'GENERAL') {
      setFormData((prev) => ({
        ...prev,
        projectId: 'GENERAL',
        projectName: 'General Site Overhead'
      }));
      return;
    }

    const proj = projects.find((p) => p.projectId === projId);
    if (proj) {
      setFormData((prev) => ({
        ...prev,
        projectId: proj.projectId,
        projectName: proj.projectName
      }));
    }
  };

  const getCategoryIcon = (catId) => {
    switch (catId) {
      case 'vehicle': return <Truck className="w-4 h-4" />;
      case 'material': return <Package className="w-4 h-4" />;
      case 'fuel': return <Fuel className="w-4 h-4" />;
      case 'food': return <Utensils className="w-4 h-4" />;
      default: return <MoreHorizontal className="w-4 h-4" />;
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
    if (!formData.category) {
      errors.category = 'Category is required';
    }
    if (!formData.item.trim()) {
      errors.item = 'Expense item description is required';
    }
    const numAmount = Number(formData.amount);
    if (!formData.amount || isNaN(numAmount) || numAmount <= 0) {
      errors.amount = 'Please enter a valid amount greater than 0';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        expenseId: formData.expenseId || nextSuggestedId,
        date: formData.date,
        projectId: formData.projectId,
        projectName: formData.projectName,
        category: formData.category,
        item: formData.item.trim(),
        amount: Number(formData.amount),
        quantity: formData.quantity.trim(),
        agent: formData.agent.trim(),
        notes: formData.notes.trim()
      };

      await onSave(payload, isEditMode ? initialData.id || initialData.expenseId : null);
      onClose();
    } catch (err) {
      console.error('Save expense error:', err);
      setValidationErrors({ submit: err.message || 'Failed to save expense' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? `Edit Daily Expense: ${formData.expenseId}` : 'Add Daily Site Expense'}
      subtitle="Record operational costs for vehicle maintenance, materials, fuel, food and site consumables"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {validationErrors.submit && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-[#DC5353] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#DC5353] shrink-0" />
            <span>{validationErrors.submit}</span>
          </div>
        )}

        {/* Expense ID & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1">
              Expense Entry ID
            </label>
            <input
              type="text"
              value={formData.expenseId}
              disabled
              className="w-full px-3 py-2 text-sm bg-slate-100 text-[#0F8B78] font-mono font-bold border border-[#E2E8F0] rounded-xl cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#0F8B78]" />
              Expense Date <span className="text-[#DC5353]">*</span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className={`w-full px-3 py-2 text-sm bg-white border rounded-xl focus:border-[#0F8B78] focus:outline-none text-[#172B4D] font-mono ${
                validationErrors.date ? 'border-rose-400' : 'border-[#E2E8F0]'
              }`}
            />
            {validationErrors.date && (
              <p className="text-xs text-[#DC5353] mt-1">{validationErrors.date}</p>
            )}
          </div>
        </div>

        {/* Project Selection */}
        <div>
          <label className="block text-xs font-semibold text-[#172B4D] mb-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#0F8B78]" />
            Project Name <span className="text-[#DC5353]">*</span>
          </label>
          <select
            value={formData.projectId}
            onChange={(e) => handleProjectChange(e.target.value)}
            className={`w-full px-3 py-2.5 text-sm bg-white border rounded-xl focus:border-[#0F8B78] focus:outline-none text-[#172B4D] ${
              validationErrors.projectId ? 'border-rose-400' : 'border-[#E2E8F0]'
            }`}
          >
            <option value="" disabled>-- Select Road Construction Project --</option>
            {activeProjects.map((p) => (
              <option key={p.projectId} value={p.projectId}>
                {p.projectId} - {p.projectName} ({p.workType || 'Roadwork'})
              </option>
            ))}
            <option value="GENERAL">General Overhead / Company Site Expenses</option>
          </select>
          {validationErrors.projectId && (
            <p className="text-xs text-[#DC5353] mt-1">{validationErrors.projectId}</p>
          )}
        </div>

        {/* Expense Category Picker */}
        <div>
          <label className="block text-xs font-semibold text-[#172B4D] mb-1.5">
            Expense Category <span className="text-[#DC5353]">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {EXPENSE_CATEGORIES.map((cat) => {
              const isSelected = formData.category === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setFormData({ ...formData, category: cat.id })}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'border-[#0F8B78] bg-[#0F8B78]/10 text-[#0F8B78] shadow-2xs ring-1 ring-[#0F8B78]'
                      : 'border-[#E2E8F0] bg-white hover:border-slate-300 text-[#172B4D] hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg mb-1.5 ${isSelected ? 'bg-[#0F8B78] text-white' : 'bg-slate-100 text-[#64748B]'}`}>
                    {getCategoryIcon(cat.id)}
                  </div>
                  <span className="text-xs font-bold capitalize">{cat.label}</span>
                </button>
              );
            })}
          </div>
          {validationErrors.category && (
            <p className="text-xs text-[#DC5353] mt-1">{validationErrors.category}</p>
          )}
        </div>

        {/* Expense Item & Amount */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#172B4D] mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#64748B]" />
              Expense Item Description <span className="text-[#DC5353]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Diesel for Tipper Truck, VG-30 Bitumen drum, Labour tea & snacks"
              value={formData.item}
              onChange={(e) => setFormData({ ...formData, item: e.target.value })}
              className={`w-full px-3 py-2 text-sm bg-white border rounded-xl focus:border-[#0F8B78] focus:outline-none text-[#172B4D] ${
                validationErrors.item ? 'border-rose-400 bg-rose-50/30' : 'border-[#E2E8F0]'
              }`}
            />
            {validationErrors.item && (
              <p className="text-xs text-[#DC5353] mt-1">{validationErrors.item}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-[#0F8B78]" />
              Amount (₹) <span className="text-[#DC5353]">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-sm font-semibold">
                ₹
              </span>
              <input
                type="number"
                min="1"
                step="any"
                placeholder="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={`w-full pl-8 pr-3 py-2 text-sm bg-white font-bold text-[#172B4D] font-mono tabular-nums border rounded-xl focus:border-[#0F8B78] focus:outline-none ${
                  validationErrors.amount ? 'border-rose-400 bg-rose-50/30' : 'border-[#E2E8F0]'
                }`}
              />
            </div>
            {validationErrors.amount && (
              <p className="text-xs text-[#DC5353] mt-1">{validationErrors.amount}</p>
            )}
          </div>
        </div>

        {/* Optional Fields: Quantity & Agent */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50/70 rounded-xl border border-[#E2E8F0]">
          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-[#64748B]" />
                Quantity
              </span>
              <span className="text-[11px] font-normal text-[#64748B] italic">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 50 Litres, 2 Loads, 10 Bags, 4 Nos"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-xl focus:border-[#0F8B78] focus:outline-none text-[#172B4D]"
            />
            <p className="text-[11px] text-[#64748B] mt-1">Units or measurement if applicable</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#64748B]" />
                Agent / Vendor / Payee
              </span>
              <span className="text-[11px] font-normal text-[#64748B] italic">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. IOCL Pump Aluva, Hotel Saravana, PeeKay Spares"
              value={formData.agent}
              onChange={(e) => setFormData({ ...formData, agent: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-xl focus:border-[#0F8B78] focus:outline-none text-[#172B4D]"
            />
            <p className="text-[11px] text-[#64748B] mt-1">Supplier, contractor or agent name</p>
          </div>
        </div>

        {/* Notes (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-[#172B4D] mb-1 flex items-center justify-between">
            <span>Additional Remarks / Bill No.</span>
            <span className="text-[11px] font-normal text-[#64748B] italic">(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Bill #1042, Site chainage 1+800, Approved by Site Engineer"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-xl focus:border-[#0F8B78] focus:outline-none text-[#172B4D]"
          />
        </div>

        {/* Live Preview Box */}
        {Number(formData.amount) > 0 && (
          <div className="bg-slate-50 border border-[#E2E8F0] rounded-xl p-3 flex items-center justify-between">
            <div className="text-xs text-[#172B4D]">
              <span className="font-bold">Expense Preview:</span>{' '}
              {formData.item || 'New Expense'} ({formData.category.toUpperCase()})
              {formData.quantity ? ` • ${formData.quantity}` : ''}
              {formData.agent ? ` • Via ${formData.agent}` : ''}
            </div>
            <div className="text-sm font-extrabold text-[#0F8B78] font-mono tabular-nums">
              {formatIndianCurrency(Number(formData.amount))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-[#172B4D] hover:bg-slate-50 border border-[#E2E8F0] rounded-xl transition-colors bg-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#0F8B78] hover:bg-[#0D7A69] rounded-xl shadow-2xs transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Saving...' : isEditMode ? 'Update Expense' : 'Save Expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
