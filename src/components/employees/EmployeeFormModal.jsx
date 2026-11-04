import React, { useState, useEffect } from 'react';
import { 
  User, 
  Phone, 
  Briefcase, 
  Calendar, 
  IndianRupee, 
  Calculator, 
  Save, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { EMPLOYEE_ROLES, EMPLOYEE_STATUSES } from '../../utils/constants.js';
import { formatIndianCurrency, calculateTotalBudget } from '../../utils/formatters.js';

export function EmployeeFormModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  nextSuggestedId = 'EMP-101'
}) {
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    phone: '',
    role: EMPLOYEE_ROLES[0],
    customRole: '',
    joiningDate: new Date().toISOString().split('T')[0],
    dailyWageRate: '1000',
    status: 'Active',
    pendingWages: '0',
    paidWages: '0'
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        employeeId: initialData.employeeId || '',
        name: initialData.name || '',
        phone: initialData.phone || '',
        role: EMPLOYEE_ROLES.includes(initialData.role) ? initialData.role : 'Other',
        customRole: EMPLOYEE_ROLES.includes(initialData.role) ? '' : (initialData.role || ''),
        joiningDate: initialData.joiningDate || new Date().toISOString().split('T')[0],
        dailyWageRate: initialData.dailyWageRate !== undefined ? String(initialData.dailyWageRate) : '1000',
        status: initialData.status || 'Active',
        pendingWages: initialData.pendingWages !== undefined ? String(initialData.pendingWages) : '0',
        paidWages: initialData.paidWages !== undefined ? String(initialData.paidWages) : '0'
      });
    } else {
      setFormData({
        employeeId: nextSuggestedId || 'EMP-101',
        name: '',
        phone: '',
        role: EMPLOYEE_ROLES[0],
        customRole: '',
        joiningDate: new Date().toISOString().split('T')[0],
        dailyWageRate: '1000',
        status: 'Active',
        pendingWages: '0',
        paidWages: '0'
      });
    }
    setValidationErrors({});
  }, [initialData, nextSuggestedId, isOpen]);

  // Derived Total Wages calculation: pendingWages + paidWages
  const currentPending = parseFloat(formData.pendingWages) || 0;
  const currentPaid = parseFloat(formData.paidWages) || 0;
  const currentTotal = calculateTotalBudget(currentPending, currentPaid);
  const currentRate = parseFloat(formData.dailyWageRate) || 0;

  const validate = () => {
    const errors = {};
    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = 'Full name is required (minimum 2 characters)';
    }

    if (!formData.phone || formData.phone.trim().length < 7) {
      errors.phone = 'Valid phone number is required';
    }

    if (!formData.joiningDate) {
      errors.joiningDate = 'Date / Joining date is required';
    }

    if (formData.role === 'Other' && !formData.customRole.trim()) {
      errors.role = 'Please specify the custom role';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const finalRole = formData.role === 'Other' ? formData.customRole.trim() : formData.role;

      const payload = {
        employeeId: formData.employeeId || nextSuggestedId,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        role: finalRole,
        joiningDate: formData.joiningDate,
        dailyWageRate: currentRate,
        status: formData.status,
        pendingWages: currentPending,
        paidWages: currentPaid,
        totalWages: currentTotal
      };

      await onSave(payload, isEditMode ? initialData.id || initialData.employeeId : null);
      onClose();
    } catch (err) {
      console.error('Save employee error:', err);
      setValidationErrors((prev) => ({
        ...prev,
        submit: err.message || 'Failed to save employee. Please verify database connection.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? `Edit Employee: ${formData.employeeId}` : 'Add New Employee'}
      subtitle={
        isEditMode
          ? 'Modify workforce profile, trade role, and wage records'
          : 'Sequential Employee ID (e.g. EMP-101) will be registered in Firestore'
      }
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {validationErrors.submit && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{validationErrors.submit}</span>
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Employee ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Employee ID
              </label>
              <input
                type="text"
                value={formData.employeeId}
                disabled={isEditMode}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-slate-100 font-mono font-bold text-emerald-900 text-xs sm:text-sm rounded-xl border border-slate-300 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                {isEditMode ? 'Identifier locked' : 'Auto-assigned sequence'}
              </p>
            </div>

            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Suresh Kumar K."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 text-xs sm:text-sm rounded-xl border ${
                  validationErrors.name ? 'border-rose-400 bg-rose-50/40' : 'border-slate-300'
                } focus:border-emerald-600 focus:outline-hidden`}
              />
              {validationErrors.name && (
                <p className="text-[11px] text-rose-600 mt-1">{validationErrors.name}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone No */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone No <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  placeholder="+91 94471 23456"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border font-mono ${
                    validationErrors.phone ? 'border-rose-400 bg-rose-50/40' : 'border-slate-300'
                  } focus:border-emerald-600 focus:outline-hidden`}
                />
              </div>
              {validationErrors.phone && (
                <p className="text-[11px] text-rose-600 mt-1">{validationErrors.phone}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Role / Designation <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-hidden"
              >
                {EMPLOYEE_ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              {formData.role === 'Other' && (
                <input
                  type="text"
                  placeholder="Specify Custom Role (e.g. Grader Operator)"
                  value={formData.customRole}
                  onChange={(e) => setFormData({ ...formData, customRole: e.target.value })}
                  className="w-full mt-2 px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-hidden"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date / Joining Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date / Joining Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            {/* Daily Wage Rate */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Standard Daily Wage Rate (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={formData.dailyWageRate}
                  onChange={(e) => setFormData({ ...formData, dailyWageRate: e.target.value })}
                  className="w-full pl-7 pr-3 py-2 text-xs sm:text-sm font-mono rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Base per-day muster roll allowance: {formatIndianCurrency(currentRate)}/day
              </p>
            </div>
          </div>

          {/* Status Radio */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Employment Status
            </label>
            <div className="grid grid-cols-2 gap-3">
              {EMPLOYEE_STATUSES.map((st) => (
                <label
                  key={st}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    formData.status === st
                      ? st === 'Active'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'bg-slate-100 border-slate-400 text-slate-800 ring-2 ring-slate-400/20'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="employeeStatus"
                    value={st}
                    checked={formData.status === st}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="sr-only"
                  />
                  <span>{st}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Wage Section */}
        <div className="pt-3 border-t border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Wage Ledger Initial Balances
            </h4>
            <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5" />
              Auto Total Calculation
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              When the <strong>Daily Wages</strong> module is integrated in the next phase, these amounts will calculate automatically from project muster roll records.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Pending Wages */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pending Wages (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.pendingWages}
                  onChange={(e) => setFormData({ ...formData, pendingWages: e.target.value })}
                  className="w-full pl-7 pr-3 py-2 text-xs sm:text-sm font-mono rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
              <p className="text-[10px] text-amber-700 mt-1 font-semibold">
                {formatIndianCurrency(currentPending)}
              </p>
            </div>

            {/* Paid Wages */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Paid Wages (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.paidWages}
                  onChange={(e) => setFormData({ ...formData, paidWages: e.target.value })}
                  className="w-full pl-7 pr-3 py-2 text-xs sm:text-sm font-mono rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
              <p className="text-[10px] text-emerald-800 mt-1 font-semibold">
                {formatIndianCurrency(currentPaid)}
              </p>
            </div>

            {/* Total Wages */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Wages (₹) <span className="text-emerald-700 text-[10px]">(Auto)</span>
              </label>
              <div className="px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-200 font-mono font-bold text-emerald-950 text-xs sm:text-sm flex items-center justify-between">
                <span>{formatIndianCurrency(currentTotal)}</span>
                <span className="text-[10px] font-sans font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                  Sum
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                = Pending + Paid
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-xs sm:text-sm font-bold text-white shadow-xs hover:shadow transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Saving to Firestore...' : isEditMode ? 'Update Employee' : 'Register Employee'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
