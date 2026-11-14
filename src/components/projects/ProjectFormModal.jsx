import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  IndianRupee, 
  Calendar, 
  Calculator, 
  Save, 
  Sparkles, 
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { DateInput } from '../common/DateInput.jsx';
import { LOCAL_BODIES, WORK_TYPES, PROJECT_STATUSES } from '../../utils/constants.js';
import { formatIndianCurrency, formatIndianCompact, calculateTotalBudget } from '../../utils/formatters.js';

export function ProjectFormModal({
  isOpen,
  onClose,
  onSave,
  initialData = null, // If provided, Edit mode; else Add mode
  nextSuggestedId = 'PRJ-101'
}) {
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    projectId: '',
    projectName: '',
    localBody: LOCAL_BODIES[0],
    customLocalBody: '',
    workType: WORK_TYPES[0],
    customWorkType: '',
    startDate: new Date().toISOString().split('T')[0],
    contractValue: '',
    status: 'Ongoing',
    otherTotalExpenses: '0',
    totalLabourExpenses: '0'
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        projectId: initialData.projectId || '',
        projectName: initialData.projectName || '',
        localBody: LOCAL_BODIES.includes(initialData.localBody) ? initialData.localBody : 'Other',
        customLocalBody: LOCAL_BODIES.includes(initialData.localBody) ? '' : (initialData.localBody || ''),
        workType: WORK_TYPES.includes(initialData.workType) ? initialData.workType : 'Other',
        customWorkType: WORK_TYPES.includes(initialData.workType) ? '' : (initialData.workType || ''),
        startDate: initialData.startDate || new Date().toISOString().split('T')[0],
        contractValue: initialData.contractValue !== undefined ? String(initialData.contractValue) : '',
        status: initialData.status === 'On Hold' ? 'Pending' : (initialData.status || 'Ongoing'),
        otherTotalExpenses: initialData.otherTotalExpenses !== undefined ? String(initialData.otherTotalExpenses) : '0',
        totalLabourExpenses: initialData.totalLabourExpenses !== undefined ? String(initialData.totalLabourExpenses) : '0'
      });
    } else {
      setFormData({
        projectId: nextSuggestedId || 'PRJ-101',
        projectName: '',
        localBody: LOCAL_BODIES[0],
        customLocalBody: '',
        workType: WORK_TYPES[0],
        customWorkType: '',
        startDate: new Date().toISOString().split('T')[0],
        contractValue: '',
        status: 'Ongoing',
        otherTotalExpenses: '0',
        totalLabourExpenses: '0'
      });
    }
    setValidationErrors({});
  }, [initialData, nextSuggestedId, isOpen]);

  // Derived Total Budget calculation: Other Total Exp + Total Labour Exp
  const currentOtherExp = parseFloat(formData.otherTotalExpenses) || 0;
  const currentLabourExp = parseFloat(formData.totalLabourExpenses) || 0;
  const currentTotalBudget = calculateTotalBudget(currentOtherExp, currentLabourExp);
  const currentContractValue = parseFloat(formData.contractValue) || 0;

  const validate = () => {
    const errors = {};
    if (!formData.projectName || formData.projectName.trim().length < 3) {
      errors.projectName = 'Project name is required (minimum 3 characters)';
    }

    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }

    if (formData.contractValue === '' || isNaN(currentContractValue) || currentContractValue < 0) {
      errors.contractValue = 'Valid non-negative contract value is required';
    }

    if (formData.localBody === 'Other' && !formData.customLocalBody.trim()) {
      errors.localBody = 'Please specify the custom local body';
    }

    if (formData.workType === 'Other' && !formData.customWorkType.trim()) {
      errors.workType = 'Please specify the custom work type';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const finalLocalBody = formData.localBody === 'Other' ? formData.customLocalBody.trim() : formData.localBody;
      const finalWorkType = formData.workType === 'Other' ? formData.customWorkType.trim() : formData.workType;

      const payload = {
        projectId: formData.projectId || nextSuggestedId,
        projectName: formData.projectName.trim(),
        localBody: finalLocalBody,
        workType: finalWorkType,
        startDate: formData.startDate,
        contractValue: currentContractValue,
        status: formData.status,
        otherTotalExpenses: currentOtherExp,
        totalLabourExpenses: currentLabourExp,
        totalBudget: currentTotalBudget
      };

      await onSave(payload, isEditMode ? initialData.id || initialData.projectId : null);
      onClose();
    } catch (err) {
      console.error('Save project error:', err);
      setValidationErrors((prev) => ({
        ...prev,
        submit: err.message || 'Failed to save project. Please verify database connection.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? `Edit Project: ${formData.projectId}` : 'Add New Road Project'}
      subtitle={
        isEditMode
          ? 'Modify project parameters and financial allocations'
          : 'Sequential ID starting from PRJ-101 will be safely registered in Firestore'
      }
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {validationErrors.submit && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-[#DC5353]">
            <AlertTriangle className="w-4 h-4 text-[#DC5353] shrink-0 mt-0.5" />
            <span>{validationErrors.submit}</span>
          </div>
        )}

        {/* Section A: Project Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
            <span className="w-5 h-5 rounded-full bg-[#172B4D] text-white text-[11px] font-bold flex items-center justify-center">
              A
            </span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#172B4D]">
              Project Information
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Project ID */}
            <div>
              <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                Project ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.projectId}
                  disabled={isEditMode}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-slate-100 font-mono font-bold text-[#0F8B78] text-xs sm:text-sm rounded-xl border border-[#E2E8F0] focus:bg-white focus:border-[#0F8B78] focus:outline-hidden"
                />
              </div>
              <p className="text-[10px] text-[#64748B] mt-1">
                {isEditMode ? 'Sequential ID immutable' : 'Auto-generated counter sequence'}
              </p>
            </div>

            {/* Project Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                Project Name <span className="text-[#DC5353]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Aluva - Perumbavoor Road Widening & Tarring"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                className={`w-full px-3 py-2 text-xs sm:text-sm text-[#172B4D] rounded-xl border ${
                  validationErrors.projectName ? 'border-rose-400 bg-rose-50/40' : 'border-[#E2E8F0]'
                } focus:border-[#0F8B78] focus:outline-hidden focus:ring-2 focus:ring-[#0F8B78]/15`}
              />
              {validationErrors.projectName && (
                <p className="text-[11px] text-[#DC5353] mt-1">{validationErrors.projectName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Local Body */}
            <div>
              <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                Local Body
              </label>
              <select
                value={formData.localBody}
                onChange={(e) => setFormData({ ...formData, localBody: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm text-[#172B4D] bg-white rounded-xl border border-[#E2E8F0] focus:border-[#0F8B78] focus:outline-hidden"
              >
                {LOCAL_BODIES.map((lb) => (
                  <option key={lb} value={lb}>{lb}</option>
                ))}
              </select>

              {formData.localBody === 'Other' && (
                <input
                  type="text"
                  placeholder="Specify Custom Local Body (e.g. Special Development Authority)"
                  value={formData.customLocalBody}
                  onChange={(e) => setFormData({ ...formData, customLocalBody: e.target.value })}
                  className="w-full mt-2 px-3 py-1.5 text-xs text-[#172B4D] rounded-xl border border-[#E2E8F0] focus:border-[#0F8B78] focus:outline-hidden"
                />
              )}
            </div>

            {/* Work Type */}
            <div>
              <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                Work Type
              </label>
              <select
                value={formData.workType}
                onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm text-[#172B4D] bg-white rounded-xl border border-[#E2E8F0] focus:border-[#0F8B78] focus:outline-hidden"
              >
                {WORK_TYPES.map((wt) => (
                  <option key={wt} value={wt}>{wt}</option>
                ))}
              </select>

              {formData.workType === 'Other' && (
                <input
                  type="text"
                  placeholder="Specify Custom Work Type (e.g. Bridge Approach Slab)"
                  value={formData.customWorkType}
                  onChange={(e) => setFormData({ ...formData, customWorkType: e.target.value })}
                  className="w-full mt-2 px-3 py-1.5 text-xs text-[#172B4D] rounded-xl border border-[#E2E8F0] focus:border-[#0F8B78] focus:outline-hidden"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                Start Date <span className="text-[#DC5353]">*</span>
              </label>
              <DateInput
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                showIcon
                wrapperClassName="w-full"
                className="w-full px-3 py-2 text-xs sm:text-sm text-[#172B4D] bg-white rounded-xl border border-[#E2E8F0] peer-focus:border-[#0F8B78]"
              />
            </div>

            {/* Contract Value */}
            <div>
              <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                Contract Value (₹) <span className="text-[#DC5353]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 12500000"
                  value={formData.contractValue}
                  onChange={(e) => setFormData({ ...formData, contractValue: e.target.value })}
                  className={`w-full pl-7 pr-3 py-2 text-xs sm:text-sm rounded-xl border font-mono tabular-nums text-[#172B4D] ${
                    validationErrors.contractValue ? 'border-rose-400 bg-rose-50/40' : 'border-[#E2E8F0]'
                  } focus:border-[#0F8B78] focus:outline-hidden`}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-1 font-medium">
                <span>Indian Format:</span>
                <span className="font-bold text-[#0F8B78] font-mono tabular-nums">
                  {formatIndianCurrency(currentContractValue)} {currentContractValue > 0 ? `(${formatIndianCompact(currentContractValue)})` : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section B: Project Status */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
            <span className="w-5 h-5 rounded-full bg-[#172B4D] text-white text-[11px] font-bold flex items-center justify-center">
              B
            </span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#172B4D]">
              Project Status
            </h4>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {PROJECT_STATUSES.map((statusOption) => (
              <label
                key={statusOption}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                  formData.status === statusOption
                    ? statusOption === 'Ongoing'
                      ? 'bg-[#0F8B78]/10 border-[#0F8B78] text-[#0F8B78] shadow-2xs ring-2 ring-[#0F8B78]/20'
                      : statusOption === 'Completed'
                      ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-2xs ring-2 ring-blue-500/20'
                      : 'bg-amber-50 border-amber-500 text-amber-900 shadow-2xs ring-2 ring-amber-500/20'
                    : 'bg-slate-50 border-[#E2E8F0] text-[#64748B] hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={statusOption}
                  checked={formData.status === statusOption}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="sr-only"
                />
                <span>{statusOption}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Section C: Expense Summary */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#172B4D] text-white text-[11px] font-bold flex items-center justify-center">
                C
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#172B4D]">
                Expense Summary
              </h4>
            </div>
            <span className="text-[11px] font-semibold text-[#64748B] flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5 text-[#0F8B78]" />
              Auto Budget Calculation
            </span>
          </div>

          <p className="text-[11px] text-[#64748B] leading-relaxed">
            Enter project initial expense rollups. These totals will aggregate live entries from the <em>Daily Wages</em> and <em>Daily Expenses</em> modules without requiring schema changes.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Other Total Exp */}
            <div>
              <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                Other Total Exp (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.otherTotalExpenses}
                  onChange={(e) => setFormData({ ...formData, otherTotalExpenses: e.target.value })}
                  className="w-full pl-7 pr-3 py-2 text-xs sm:text-sm font-mono tabular-nums text-[#172B4D] rounded-xl border border-[#E2E8F0] focus:border-[#0F8B78] focus:outline-hidden"
                />
              </div>
              <p className="text-[10px] text-[#64748B] mt-1 font-mono tabular-nums">
                {formatIndianCurrency(currentOtherExp)}
              </p>
            </div>

            {/* Total Labour Exp */}
            <div>
              <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                Total Labour Exp (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.totalLabourExpenses}
                  onChange={(e) => setFormData({ ...formData, totalLabourExpenses: e.target.value })}
                  className="w-full pl-7 pr-3 py-2 text-xs sm:text-sm font-mono tabular-nums text-[#172B4D] rounded-xl border border-[#E2E8F0] focus:border-[#0F8B78] focus:outline-hidden"
                />
              </div>
              <p className="text-[10px] text-[#64748B] mt-1 font-mono tabular-nums">
                {formatIndianCurrency(currentLabourExp)}
              </p>
            </div>

            {/* Total Budget (Auto Computed: Other + Labour) */}
            <div>
              <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                Total Budget (₹) <span className="text-[#0F8B78] text-[10px]">(Auto)</span>
              </label>
              <div className="px-3 py-2 bg-slate-50 rounded-xl border border-[#E2E8F0] font-mono font-bold text-[#172B4D] tabular-nums text-xs sm:text-sm flex items-center justify-between">
                <span>{formatIndianCurrency(currentTotalBudget)}</span>
                <span className="text-[10px] font-sans font-semibold text-[#0F8B78] bg-[#0F8B78]/10 px-1.5 py-0.5 rounded">
                  Sum
                </span>
              </div>
              <p className="text-[10px] text-[#64748B] mt-1 font-mono tabular-nums">
                = Other ({formatIndianCompact(currentOtherExp)}) + Labour ({formatIndianCompact(currentLabourExp)})
              </p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm font-semibold text-[#172B4D] bg-white hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F8B78] hover:bg-[#0D7A69] text-xs sm:text-sm font-bold text-white shadow-2xs hover:shadow-xs transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Saving to Firestore...' : isEditMode ? 'Update Project' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
