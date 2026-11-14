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
import { DateInput } from '../common/DateInput.jsx';
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
      title={isEditMode ? `Edit Employee: ${formData.employeeId}` : 'Register New Employee'}
      subtitle={
        isEditMode
          ? 'Modify employee details and initial balances'
          : 'Sequential ID starting from EMP-101 will be registered'
      }
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {validationErrors.submit && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-[#DC5353]">
            <AlertTriangle className="w-4 h-4 text-[#DC5353] shrink-0 mt-0.5" />
            <span>{validationErrors.submit}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Employee ID */}
          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1">
              Employee ID
            </label>
            <input
              type="text"
              value={formData.employeeId}
              disabled={isEditMode}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 bg-slate-100 font-mono font-bold text-[#0F8B78] text-xs sm:text-sm rounded-xl border border-[#E2E8F0] focus:bg-white focus:border-[#0F8B78] focus:outline-hidden"
            />
            <p className="text-[10px] text-[#64748B] mt-1">
              {isEditMode ? 'Sequential ID immutable' : 'Auto-assigned sequence'}
            </p>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1">
              Full Name <span className="text-[#DC5353]">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. Suresh Kumar"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm text-[#172B4D] rounded-xl border ${
                  validationErrors.name ? 'border-rose-400 bg-rose-50/40' : 'border-[#E2E8F0]'
                } focus:border-[#0F8B78] focus:outline-hidden focus:ring-2 focus:ring-[#0F8B78]/15`}
              />
            </div>
            {validationErrors.name && (
              <p className="text-[11px] text-[#DC5353] mt-1">{validationErrors.name}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1">
              Phone Number <span className="text-[#DC5353]">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                placeholder="+91 98470 12345"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm text-[#172B4D] font-mono rounded-xl border ${
                  validationErrors.phone ? 'border-rose-400 bg-rose-50/40' : 'border-[#E2E8F0]'
                } focus:border-[#0F8B78] focus:outline-hidden focus:ring-2 focus:ring-[#0F8B78]/15`}
              />
            </div>
            {validationErrors.phone && (
              <p className="text-[11px] text-[#DC5353] mt-1">{validationErrors.phone}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1">
              Role / Designation
            </label>
            <div className="relative">
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm text-[#172B4D] bg-white rounded-xl border border-[#E2E8F0] focus:border-[#0F8B78] focus:outline-hidden"
              >
                {EMPLOYEE_ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            {formData.role === 'Other' && (
              <input
                type="text"
                placeholder="Specify custom role (e.g. Electrician)"
                value={formData.customRole}
                onChange={(e) => setFormData({ ...formData, customRole: e.target.value })}
                className="w-full mt-2 px-3 py-1.5 text-xs text-[#172B4D] rounded-xl border border-[#E2E8F0] focus:border-[#0F8B78] focus:outline-hidden"
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Joining Date */}
          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1">
              Date / Joining Date <span className="text-[#DC5353]">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 z-20 pointer-events-none" />
              <DateInput
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                wrapperClassName="w-full"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm text-[#172B4D] bg-white rounded-xl border border-[#E2E8F0] peer-focus:border-[#0F8B78]"
              />
            </div>
          </div>

          {/* Status Radio */}
          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1">
              Employee Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {EMPLOYEE_STATUSES.map((st) => (
                <label
                  key={st}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                    formData.status === st
                      ? st === 'Active'
                        ? 'bg-[#0F8B78]/10 border-[#0F8B78] text-[#0F8B78] ring-2 ring-[#0F8B78]/20'
                        : 'bg-slate-200 border-slate-400 text-slate-800 ring-2 ring-slate-300'
                      : 'bg-slate-50 border-[#E2E8F0] text-[#64748B] hover:bg-slate-100'
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
        <div className="pt-3 border-t border-[#E2E8F0] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#172B4D]">
              Wage Ledger Initial Balances
            </h4>
            <span className="text-[11px] text-[#0F8B78] font-medium flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5" />
              Auto Total Calculation
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs text-[#64748B] flex items-start gap-2">
            <Info className="w-4 h-4 text-[#0F8B78] shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              When <strong>Daily Wages</strong> are logged, these amounts will calculate automatically from project muster roll records.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Pending Wages */}
            <div>
              <label className="block text-xs font-semibold text-[#172B4D] mb-1">
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
                  className="w-full pl-7 pr-3 py-2 text-xs sm:text-sm font-mono tabular-nums text-[#172B4D] rounded-xl border border-[#E2E8F0] focus:border-[#0F8B78] focus:outline-hidden"
                />
              </div>
              <p className="text-[10px] text-amber-700 mt-1 font-semibold font-mono tabular-nums">
                {formatIndianCurrency(currentPending)}
              </p>
            </div>

            {/* Paid Wages */}
            <div>
              <label className="block text-xs font-semibold text-[#172B4D] mb-1">
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
                  className="w-full pl-7 pr-3 py-2 text-xs sm:text-sm font-mono tabular-nums text-[#172B4D] rounded-xl border border-[#E2E8F0] focus:border-[#0F8B78] focus:outline-hidden"
                />
              </div>
              <p className="text-[10px] text-[#0F8B78] mt-1 font-semibold font-mono tabular-nums">
                {formatIndianCurrency(currentPaid)}
              </p>
            </div>

            {/* Total Wages */}
            <div>
              <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                Total Wages (₹) <span className="text-[#0F8B78] text-[10px]">(Auto)</span>
              </label>
              <div className="px-3 py-2 bg-slate-50 rounded-xl border border-[#E2E8F0] font-mono font-bold text-[#172B4D] tabular-nums text-xs sm:text-sm flex items-center justify-between">
                <span>{formatIndianCurrency(currentTotal)}</span>
                <span className="text-[10px] font-sans font-semibold text-[#0F8B78] bg-[#0F8B78]/10 px-1.5 py-0.5 rounded">
                  Sum
                </span>
              </div>
              <p className="text-[10px] text-[#64748B] mt-1 font-mono tabular-nums">
                = Pending + Paid
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
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
            {isSubmitting ? 'Saving to Firestore...' : isEditMode ? 'Update Employee' : 'Register Employee'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
