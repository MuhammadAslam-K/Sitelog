import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  User, 
  Building2, 
  IndianRupee, 
  Calculator, 
  Save, 
  AlertTriangle,
  Info,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { DateInput } from '../common/DateInput.jsx';
import { ATTENDANCE_STATUSES, WAGE_PAYMENT_STATUSES } from '../../utils/constants.js';
import { formatIndianCurrency } from '../../utils/formatters.js';

export function DailyWageFormModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  employees = [],
  projects = [],
  nextSuggestedId = 'WAG-101'
}) {
  const isEditMode = !!initialData;

  // Active employees and projects
  const activeEmployees = employees.filter((e) => !e.isArchived && e.status === 'Active');
  const activeProjects = projects.filter((p) => !p.isArchived);

  const [formData, setFormData] = useState({
    wageId: '',
    date: new Date().toISOString().split('T')[0],
    employeeId: '',
    employeeName: '',
    employeeRole: '',
    projectId: '',
    projectName: '',
    attendance: 'Present',
    wages: '1000',
    advance: '0',
    status: 'Pending',
    notes: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        wageId: initialData.wageId || '',
        date: initialData.date || new Date().toISOString().split('T')[0],
        employeeId: initialData.employeeId || '',
        employeeName: initialData.employeeName || '',
        employeeRole: initialData.employeeRole || '',
        projectId: initialData.projectId || '',
        projectName: initialData.projectName || '',
        attendance: initialData.attendance || 'Present',
        wages: String(initialData.wages !== undefined ? initialData.wages : '1000'),
        advance: String(initialData.advance !== undefined ? initialData.advance : '0'),
        status: initialData.status || (initialData.attendance === 'Absent / On Leave' ? 'Advance on Leave' : initialData.advance > 0 ? (initialData.balance > 0 ? 'Partial' : 'Paid') : 'Pending'),
        notes: initialData.notes || ''
      });
    } else {
      const defaultEmp = activeEmployees[0] || null;
      const defaultProj = activeProjects[0] || null;
      const defaultRate = defaultEmp ? String(defaultEmp.dailyWageRate || 1000) : '1000';

      setFormData({
        wageId: nextSuggestedId || 'WAG-101',
        date: new Date().toISOString().split('T')[0],
        employeeId: defaultEmp?.employeeId || '',
        employeeName: defaultEmp?.name || '',
        employeeRole: defaultEmp?.role || '',
        projectId: defaultProj?.projectId || 'PRJ-101',
        projectName: defaultProj?.projectName || 'General Road Maintenance',
        attendance: 'Present',
        wages: defaultRate,
        advance: '0',
        status: 'Pending',
        notes: ''
      });
    }
    setValidationErrors({});
  }, [initialData, nextSuggestedId, isOpen]);

  // When employee dropdown changes, auto-fill details and wage rate
  const handleEmployeeChange = (empId) => {
    const emp = employees.find((e) => e.employeeId === empId);
    if (!emp) return;

    let wageForAttendance = emp.dailyWageRate || 1000;
    if (formData.attendance === 'Half Day') {
      wageForAttendance = Math.round(wageForAttendance / 2);
    } else if (formData.attendance === 'Absent / On Leave') {
      wageForAttendance = 0;
    }

    setFormData((prev) => ({
      ...prev,
      employeeId: emp.employeeId,
      employeeName: emp.name,
      employeeRole: emp.role,
      wages: String(wageForAttendance)
    }));
  };

  // When project dropdown changes
  const handleProjectChange = (projId) => {
    if (projId === 'GENERAL') {
      setFormData((prev) => ({
        ...prev,
        projectId: 'GENERAL',
        projectName: 'Central Depot / Machinery Yard / General'
      }));
      return;
    }
    const proj = projects.find((p) => p.projectId === projId);
    if (!proj) return;
    setFormData((prev) => ({
      ...prev,
      projectId: proj.projectId,
      projectName: proj.projectName
    }));
  };

  // When attendance status changes (Present, Half Day, Absent)
  const handleAttendanceChange = (newStatus) => {
    const selectedEmp = employees.find((e) => e.employeeId === formData.employeeId);
    const baseRate = selectedEmp ? Number(selectedEmp.dailyWageRate || 1000) : 1000;

    let newWages = '0';
    let suggestedStatus = formData.status;

    if (newStatus === 'Present') {
      newWages = String(baseRate);
      const adv = parseFloat(formData.advance) || 0;
      suggestedStatus = adv >= baseRate ? 'Paid' : adv > 0 ? 'Partial' : 'Pending';
    } else if (newStatus === 'Half Day') {
      const halfRate = Math.round(baseRate / 2);
      newWages = String(halfRate);
      const adv = parseFloat(formData.advance) || 0;
      suggestedStatus = adv >= halfRate ? 'Paid' : adv > 0 ? 'Partial' : 'Pending';
    } else if (newStatus === 'Absent / On Leave') {
      newWages = '0';
      const adv = parseFloat(formData.advance) || 0;
      suggestedStatus = adv > 0 ? 'Advance on Leave' : 'Pending';
    }

    setFormData((prev) => ({
      ...prev,
      attendance: newStatus,
      wages: newWages,
      status: suggestedStatus
    }));
  };

  // When advance amount changes
  const handleAdvanceChange = (val) => {
    const adv = parseFloat(val) || 0;
    const wage = parseFloat(formData.wages) || 0;
    let suggestedStatus = formData.status;

    if (formData.attendance === 'Absent / On Leave') {
      suggestedStatus = adv > 0 ? 'Advance on Leave' : 'Pending';
    } else {
      if (adv >= wage && wage > 0) {
        suggestedStatus = 'Paid';
      } else if (adv > 0) {
        suggestedStatus = 'Partial';
      } else {
        suggestedStatus = 'Pending';
      }
    }

    setFormData((prev) => ({
      ...prev,
      advance: val,
      status: suggestedStatus
    }));
  };

  // Auto-calculated Balance Amount: Wages - Advance
  const currentWage = parseFloat(formData.wages) || 0;
  const currentAdvance = parseFloat(formData.advance) || 0;
  const currentBalance = currentWage - currentAdvance;

  const validate = () => {
    const errors = {};
    if (!formData.employeeId) {
      errors.employeeId = 'Please select an employee';
    }
    if (!formData.date) {
      errors.date = 'Date is required';
    }
    if (isNaN(currentWage) || currentWage < 0) {
      errors.wages = 'Valid non-negative wage is required';
    }
    if (isNaN(currentAdvance) || currentAdvance < 0) {
      errors.advance = 'Valid non-negative advance amount is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        wageId: formData.wageId || nextSuggestedId,
        date: formData.date,
        employeeId: formData.employeeId,
        employeeName: formData.employeeName,
        employeeRole: formData.employeeRole,
        projectId: formData.projectId || 'GENERAL',
        projectName: formData.projectName || 'General Road Maintenance',
        attendance: formData.attendance,
        wages: currentWage,
        advance: currentAdvance,
        balance: currentBalance,
        status: formData.status,
        notes: formData.notes.trim()
      };

      await onSave(payload, isEditMode ? initialData.id || initialData.wageId : null);
      onClose();
    } catch (err) {
      console.error('Save wage error:', err);
      setValidationErrors((prev) => ({
        ...prev,
        submit: err.message || 'Failed to save wage entry. Please check database connection.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? `Edit Daily Wage: ${formData.wageId}` : 'Add Daily Wage / Site Advance'}
      subtitle={
        isEditMode
          ? 'Update muster roll attendance, wage, or advance settlement'
          : 'Log worker shift or record advance disbursed directly on site'
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

        {/* Section 1: Worker & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Employee Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1">
              Select Employee <span className="text-[#DC5353]">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.employeeId}
                onChange={(e) => handleEmployeeChange(e.target.value)}
                className={`w-full px-3 py-2 text-xs sm:text-sm text-[#172B4D] bg-white rounded-xl border ${
                  validationErrors.employeeId ? 'border-rose-400 bg-rose-50/40' : 'border-[#E2E8F0]'
                } focus:border-[#0F8B78] focus:outline-hidden`}
              >
                <option value="">-- Select Worker --</option>
                {employees.map((emp) => (
                  <option key={emp.employeeId} value={emp.employeeId}>
                    {emp.name} ({emp.role} • {emp.employeeId})
                  </option>
                ))}
              </select>
            </div>
            {validationErrors.employeeId && (
              <p className="text-[11px] text-[#DC5353] mt-1">{validationErrors.employeeId}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1">
              Date <span className="text-[#DC5353]">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 z-20 pointer-events-none" />
              <DateInput
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                wrapperClassName="w-full"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm text-[#172B4D] bg-white rounded-xl border border-[#E2E8F0] peer-focus:border-[#0F8B78] font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Project Allocation */}
        <div>
          <label className="block text-xs font-semibold text-[#172B4D] mb-1">
            Allocated Road Project Site
          </label>
          <div className="relative">
            <select
              value={formData.projectId}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm text-[#172B4D] bg-white rounded-xl border border-[#E2E8F0] focus:border-[#0F8B78] focus:outline-hidden"
            >
              <option value="GENERAL">General Road Maintenance / Central Yard (No Specific PRJ)</option>
              {projects.map((p) => (
                <option key={p.projectId} value={p.projectId}>
                  {p.projectId} - {p.projectName} ({p.localBody})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section 3: Attendance Radio Buttons */}
        <div>
          <label className="block text-xs font-semibold text-[#172B4D] mb-1.5">
            Shift Attendance Status
          </label>
          <div className="grid grid-cols-3 gap-2">
            {ATTENDANCE_STATUSES.map((att) => {
              const isSelected = formData.attendance === att;
              return (
                <label
                  key={att}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    isSelected
                      ? att === 'Present'
                        ? 'bg-[#0F8B78]/10 border-[#0F8B78] text-[#0F8B78] ring-2 ring-[#0F8B78]/20'
                        : att === 'Half Day'
                        ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20'
                        : 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20'
                      : 'bg-slate-50 border-[#E2E8F0] text-[#64748B] hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="attendanceStatus"
                    value={att}
                    checked={isSelected}
                    onChange={() => handleAttendanceChange(att)}
                    className="sr-only"
                  />
                  <span>{att}</span>
                </label>
              );
            })}
          </div>
          {formData.attendance === 'Absent / On Leave' && (
            <div className="p-2.5 mt-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Worker on Leave:</strong> Wages earned is set to ₹0. Any advance entered below will be recorded as cash owed by the worker.
              </span>
            </div>
          )}
        </div>

        {/* Section 4: Wages, Advance, and Auto Computed Balance */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#E2E8F0]">
          {/* Wages */}
          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1">
              Wages Earned (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                min="0"
                step="50"
                disabled={formData.attendance === 'Absent / On Leave'}
                value={formData.attendance === 'Absent / On Leave' ? '0' : formData.wages}
                onChange={(e) => setFormData({ ...formData, wages: e.target.value })}
                className={`w-full pl-7 pr-3 py-2 text-xs sm:text-sm font-mono tabular-nums text-[#172B4D] rounded-xl border ${
                  formData.attendance === 'Absent / On Leave'
                    ? 'bg-slate-100 text-slate-400 border-[#E2E8F0]'
                    : 'border-[#E2E8F0] focus:border-[#0F8B78] focus:outline-hidden'
                }`}
              />
            </div>
            <p className="text-[10px] text-[#64748B] mt-1 font-mono tabular-nums">
              {formData.attendance === 'Absent / On Leave' ? '₹0 (No work done)' : 'Earned for day shift'}
            </p>
          </div>

          {/* Advance */}
          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1">
              Advance Disbursed (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                min="0"
                step="50"
                placeholder="e.g. 300"
                value={formData.advance}
                onChange={(e) => handleAdvanceChange(e.target.value)}
                className="w-full pl-7 pr-3 py-2 text-xs sm:text-sm font-mono tabular-nums text-[#172B4D] rounded-xl border border-[#E2E8F0] focus:border-[#0F8B78] focus:outline-hidden"
              />
            </div>
            <p className="text-[10px] text-amber-700 font-medium mt-1">
              Site cash advance given today
            </p>
          </div>

          {/* Balance Amount (Auto Computed) */}
          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1">
              Balance Amount (₹) <span className="text-[#0F8B78] text-[10px]">(Auto)</span>
            </label>
            <div className={`px-3 py-2 rounded-xl border font-mono font-bold text-xs sm:text-sm flex items-center justify-between tabular-nums ${
              currentBalance < 0
                ? 'bg-rose-50 text-[#DC5353] border-rose-200'
                : 'bg-slate-50 text-[#172B4D] border-[#E2E8F0]'
            }`}>
              <span>{formatIndianCurrency(currentBalance)}</span>
              <span className="text-[10px] font-sans font-semibold px-1.5 py-0.5 rounded bg-white border border-[#E2E8F0]">
                Wages - Adv
              </span>
            </div>
            <p className="text-[10px] text-[#64748B] mt-1 font-mono tabular-nums">
              {currentBalance < 0
                ? `Advance owed: ${formatIndianCurrency(Math.abs(currentBalance))}`
                : `Net payable: ${formatIndianCurrency(currentBalance)}`}
            </p>
          </div>
        </div>

        {/* Payment Status Dropdown */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-[#172B4D] mb-1">
            Payment Status <span className="text-[#0F8B78] text-[10px] font-normal">(Reflects in Employee Table)</span>
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 text-xs sm:text-sm text-[#172B4D] bg-white rounded-xl border border-[#E2E8F0] focus:border-[#0F8B78] focus:outline-hidden"
          >
            {WAGE_PAYMENT_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st} {st === 'Pending' ? '(Full wage pending settlement in employee ledger)' : st === 'Paid' ? '(Wage fully paid / settled)' : st === 'Partial' ? '(Advance paid, balance pending in employee ledger)' : '(Absent worker advance to recover)'}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-[#64748B] mt-1">
            Controls whether earned wages are logged as Pending, Paid, or Advance Owed in the Employee directory.
          </p>
        </div>

        {/* Notes / Remarks */}
        <div>
          <label className="block text-xs font-semibold text-[#172B4D] mb-1">
            Notes / Reason / Remarks
          </label>
          <input
            type="text"
            placeholder="e.g. Worker absent today, requested ₹300 cash advance for medical expenses"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 text-xs sm:text-sm text-[#172B4D] rounded-xl border border-[#E2E8F0] focus:border-[#0F8B78] focus:outline-hidden"
          />
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
            {isSubmitting ? 'Saving to Firestore...' : isEditMode ? 'Update Wage Entry' : 'Save Wage Record'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
