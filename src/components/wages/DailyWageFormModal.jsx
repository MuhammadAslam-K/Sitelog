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
      suggestedStatus = parseFloat(formData.advance) > 0 ? 'Partial' : 'Pending';
    } else if (newStatus === 'Half Day') {
      newWages = String(Math.round(baseRate / 2));
      suggestedStatus = parseFloat(formData.advance) > 0 ? 'Partial' : 'Pending';
    } else if (newStatus === 'Absent / On Leave') {
      newWages = '0'; // 0 earned wages on leave
      suggestedStatus = parseFloat(formData.advance) > 0 ? 'Advance on Leave' : 'Pending';
    }

    setFormData((prev) => ({
      ...prev,
      attendance: newStatus,
      wages: newWages,
      status: suggestedStatus
    }));
  };

  // Live Balance calculation: wages - advance
  const currentWages = formData.attendance === 'Absent / On Leave' ? 0 : (parseFloat(formData.wages) || 0);
  const currentAdvance = parseFloat(formData.advance) || 0;
  const currentBalance = Math.round((currentWages - currentAdvance) * 100) / 100;

  const handleAdvanceChange = (val) => {
    const adv = parseFloat(val) || 0;
    let newStatus = formData.status;

    if (formData.attendance === 'Absent / On Leave') {
      newStatus = adv > 0 ? 'Advance on Leave' : 'Pending';
    } else if (adv >= currentWages && currentWages > 0) {
      newStatus = 'Paid';
    } else if (adv > 0) {
      newStatus = 'Partial';
    } else {
      newStatus = 'Pending';
    }

    setFormData((prev) => ({
      ...prev,
      advance: val,
      status: newStatus
    }));
  };

  const validate = () => {
    const errors = {};
    if (!formData.date) {
      errors.date = 'Date is required';
    }
    if (!formData.employeeId || !formData.employeeName) {
      errors.employee = 'Employee must be selected from the workforce registry';
    }
    if (!formData.projectName) {
      errors.project = 'Project or work site assignment is required';
    }
    if (isNaN(currentAdvance) || currentAdvance < 0) {
      errors.advance = 'Advance must be a non-negative number';
    }
    if (isNaN(currentWages) || currentWages < 0) {
      errors.wages = 'Wages must be a non-negative number';
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
        projectName: formData.projectName,
        attendance: formData.attendance,
        wages: currentWages,
        advance: currentAdvance,
        balance: currentBalance,
        status: formData.status,
        notes: formData.notes?.trim() || ''
      };

      await onSave(payload, isEditMode ? initialData.id || initialData.wageId : null);
      onClose();
    } catch (err) {
      console.error('Save wage entry error:', err);
      setValidationErrors((prev) => ({
        ...prev,
        submit: err.message || 'Failed to save wage entry to Firestore.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? `Edit Wage Entry: ${formData.wageId}` : 'Add Daily Wage / Advance Entry'}
      subtitle="Record site attendance, daily earned wages, and cash advances"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {validationErrors.submit && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{validationErrors.submit}</span>
          </div>
        )}

        {/* Date and ID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Entry ID
            </label>
            <input
              type="text"
              value={formData.wageId}
              disabled={isEditMode}
              onChange={(e) => setFormData({ ...formData, wageId: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 bg-slate-100 font-mono font-bold text-emerald-900 text-xs sm:text-sm rounded-xl border border-slate-300 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Work Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Employee and Project Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Employee from employee table */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Employee (from Employee Registry) <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.employeeId}
              onChange={(e) => handleEmployeeChange(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-hidden"
            >
              <option value="">Select Employee...</option>
              {employees.map((emp) => (
                <option key={emp.employeeId} value={emp.employeeId}>
                  {emp.name} ({emp.role} • {formatIndianCurrency(emp.dailyWageRate)}/day)
                </option>
              ))}
            </select>
            {formData.employeeRole && (
              <p className="text-[11px] text-emerald-800 font-medium mt-1">
                Selected: {formData.employeeName} ({formData.employeeRole})
              </p>
            )}
            {validationErrors.employee && (
              <p className="text-[11px] text-rose-600 mt-1">{validationErrors.employee}</p>
            )}
          </div>

          {/* Project from project table */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assigned Road Project <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.projectId}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-hidden"
            >
              <option value="">Select Project Site...</option>
              {projects.map((proj) => (
                <option key={proj.projectId} value={proj.projectId}>
                  {proj.projectId} - {proj.projectName}
                </option>
              ))}
              <option value="GENERAL">General Depot / Equipment Yard Maintenance</option>
            </select>
            {formData.projectName && (
              <p className="text-[11px] text-slate-500 truncate mt-1">
                Site: {formData.projectName}
              </p>
            )}
            {validationErrors.project && (
              <p className="text-[11px] text-rose-600 mt-1">{validationErrors.project}</p>
            )}
          </div>
        </div>

        {/* Attendance Status Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Attendance Standing
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {ATTENDANCE_STATUSES.map((status) => (
              <label
                key={status}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                  formData.attendance === status
                    ? status === 'Present'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                      : status === 'Half Day'
                      ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20'
                      : 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="attendance"
                  value={status}
                  checked={formData.attendance === status}
                  onChange={() => handleAttendanceChange(status)}
                  className="sr-only"
                />
                <span>{status}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Scenario Alert: Absent with Advance */}
        {formData.attendance === 'Absent / On Leave' && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="block text-amber-950">Worker is Absent / On Leave Today:</strong>
              Earned wage is ₹0. If the worker requested an advance today (e.g. <strong>₹300</strong>), enter it into the <em>Advance (₹)</em> box below. The system will record it with negative daily balance (advance owed).
            </div>
          </div>
        )}

        {/* Wage, Advance, and Balance */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200">
          {/* Wages (Earned Wage) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Earned Wages (₹)
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
                className={`w-full pl-7 pr-3 py-2 text-xs sm:text-sm font-mono rounded-xl border ${
                  formData.attendance === 'Absent / On Leave'
                    ? 'bg-slate-100 text-slate-400 border-slate-200'
                    : 'border-slate-300 focus:border-emerald-600 focus:outline-hidden'
                }`}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {formData.attendance === 'Absent / On Leave' ? '₹0 (No work done)' : 'Earned for day shift'}
            </p>
          </div>

          {/* Advance */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                className="w-full pl-7 pr-3 py-2 text-xs sm:text-sm font-mono rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-hidden"
              />
            </div>
            <p className="text-[10px] text-amber-700 font-medium mt-1">
              Site cash advance given today
            </p>
          </div>

          {/* Balance Amount (Auto Computed) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Balance Amount (₹) <span className="text-emerald-700 text-[10px]">(Auto)</span>
            </label>
            <div className={`px-3 py-2 rounded-xl border font-mono font-bold text-xs sm:text-sm flex items-center justify-between ${
              currentBalance < 0
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-emerald-50 text-emerald-950 border-emerald-200'
            }`}>
              <span>{formatIndianCurrency(currentBalance)}</span>
              <span className="text-[10px] font-sans font-semibold px-1.5 py-0.5 rounded bg-white/70">
                Wages - Adv
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {currentBalance < 0
                ? `Advance owed by worker: ${formatIndianCurrency(Math.abs(currentBalance))}`
                : `Net payable to worker: ${formatIndianCurrency(currentBalance)}`}
            </p>
          </div>
        </div>

        {/* Payment Status Dropdown (Determines Employee Ledger Reflection) */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Payment Status <span className="text-emerald-700 text-[10px] font-normal">(Reflects in Employee Table)</span>
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-white rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-hidden"
          >
            {WAGE_PAYMENT_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st} {st === 'Pending' ? '(Full wage pending settlement in employee ledger)' : st === 'Paid' ? '(Wage fully paid / settled)' : st === 'Partial' ? '(Advance paid, balance pending in employee ledger)' : '(Absent worker advance to recover)'}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-slate-500 mt-1">
            Controls whether earned wages are logged as Pending, Paid, or Advance Owed in the Employee directory.
          </p>
        </div>

        {/* Notes / Remarks */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Notes / Reason / Remarks
          </label>
          <input
            type="text"
            placeholder="e.g. Worker absent today, requested ₹300 cash advance for medical expenses"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-hidden"
          />
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
            {isSubmitting ? 'Saving to Firestore...' : isEditMode ? 'Update Wage Entry' : 'Save Wage Record'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
