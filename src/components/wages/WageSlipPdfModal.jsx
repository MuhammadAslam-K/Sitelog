import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileDown, 
  FileText, 
  User, 
  Calendar, 
  CheckCircle2, 
  CheckSquare,
  Square,
  Sparkles,
  Download,
  Check,
  AlertCircle,
  Clock,
  Coins,
  Building2
} from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { generateWageSlipPDF, generateConsolidatedWagesPDF } from '../../utils/pdfGenerator.js';
import { formatIndianCurrency, formatDate } from '../../utils/formatters.js';

export function WageSlipPdfModal({
  isOpen,
  onClose,
  wages = [],
  employees = [],
  initialEmployeeId = null,
  initialSelectedWageIds = []
}) {
  // Unique list of employees
  const employeeOptions = useMemo(() => {
    const map = new Map();
    wages.forEach((w) => {
      if (w.employeeId && !map.has(w.employeeId)) {
        map.set(w.employeeId, {
          employeeId: w.employeeId,
          name: w.employeeName,
          role: w.employeeRole
        });
      }
    });

    // Also include any active employees not yet logged
    employees.forEach((e) => {
      if (!map.has(e.employeeId)) {
        map.set(e.employeeId, {
          employeeId: e.employeeId,
          name: e.name,
          role: e.role
        });
      }
    });

    return Array.from(map.values());
  }, [wages, employees]);

  const [selectedEmpId, setSelectedEmpId] = useState(
    initialEmployeeId || (employeeOptions[0]?.employeeId || '')
  );

  // When initialEmployeeId changes or modal opens
  useEffect(() => {
    if (initialEmployeeId) {
      setSelectedEmpId(initialEmployeeId);
    } else if (!selectedEmpId && employeeOptions.length > 0) {
      setSelectedEmpId(employeeOptions[0].employeeId);
    }
  }, [initialEmployeeId, employeeOptions]);

  const selectedEmployee = useMemo(() => {
    return employeeOptions.find((e) => e.employeeId === selectedEmpId) || employeeOptions[0] || null;
  }, [employeeOptions, selectedEmpId]);

  // All entries for the currently selected employee (sorted chronologically)
  const allEmployeeEntries = useMemo(() => {
    if (!selectedEmployee) return [];
    return wages
      .filter((w) => w.employeeId === selectedEmployee.employeeId || w.employeeName === selectedEmployee.name)
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  }, [wages, selectedEmployee]);

  // Set of selected entry IDs for the particular dates
  const [selectedEntryIds, setSelectedEntryIds] = useState(() => new Set());

  // Date range filter inside modal
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');

  // Reset or initialize selected dates when employee or initialSelectedWageIds change
  useEffect(() => {
    if (allEmployeeEntries.length === 0) {
      setSelectedEntryIds(new Set());
      return;
    }

    if (initialSelectedWageIds && initialSelectedWageIds.length > 0) {
      // Check if any match this employee's entries
      const matchingIds = allEmployeeEntries
        .filter((e) => initialSelectedWageIds.includes(e.id || e.wageId))
        .map((e) => e.id || e.wageId);
      
      if (matchingIds.length > 0) {
        setSelectedEntryIds(new Set(matchingIds));
        return;
      }
    }

    // Default: select all dates for this employee so they start with full view and can pick/unpick
    const allIds = allEmployeeEntries.map((e) => e.id || e.wageId);
    setSelectedEntryIds(new Set(allIds));
  }, [selectedEmpId, allEmployeeEntries.length]);

  // Toggle individual date selection
  const handleToggleEntry = (id) => {
    setSelectedEntryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select all dates for this employee
  const handleSelectAll = () => {
    const allIds = allEmployeeEntries.map((e) => e.id || e.wageId);
    setSelectedEntryIds(new Set(allIds));
  };

  // Clear date selection
  const handleClearAll = () => {
    setSelectedEntryIds(new Set());
  };

  // Select latest N days (e.g. 6 days)
  const handleSelectRecentDays = (count = 6) => {
    const recent = allEmployeeEntries.slice(-count);
    const recentIds = recent.map((e) => e.id || e.wageId);
    setSelectedEntryIds(new Set(recentIds));
  };

  // Select only dates within From / To date range
  const handleSelectDateRange = () => {
    if (!filterFromDate && !filterToDate) return;
    const matchingIds = allEmployeeEntries
      .filter((e) => {
        const d = (e.date || '').slice(0, 10);
        if (filterFromDate && d < filterFromDate) return false;
        if (filterToDate && d > filterToDate) return false;
        return true;
      })
      .map((e) => e.id || e.wageId);
    setSelectedEntryIds(new Set(matchingIds));
  };

  // Filtered entries strictly containing the user-selected dates
  const selectedEntries = useMemo(() => {
    return allEmployeeEntries.filter((e) => selectedEntryIds.has(e.id || e.wageId));
  }, [allEmployeeEntries, selectedEntryIds]);

  // Computed summary matching the screenshot for ONLY the selected dates
  const stats = useMemo(() => {
    let workingDays = 0;
    let totalAmount = 0;
    let totalAdvance = 0;
    let balance = 0;

    selectedEntries.forEach((entry) => {
      const att = entry.attendance || 'Present';
      if (att === 'Present') workingDays += 1;
      else if (att === 'Half Day') workingDays += 0.5;

      const w = Number(entry.wages) || 0;
      const adv = Number(entry.advance) || 0;
      const bal = entry.balance !== undefined ? Number(entry.balance) : (w - adv);

      totalAmount += w;
      totalAdvance += adv;
      balance += bal;
    });

    return { workingDays, totalAmount, totalAdvance, balance };
  }, [selectedEntries]);

  const handleDownloadSingleSlip = () => {
    if (!selectedEmployee || selectedEntries.length === 0) return;
    generateWageSlipPDF(
      selectedEmployee.name,
      selectedEntries,
      { employeeId: selectedEmployee.employeeId, role: selectedEmployee.role }
    );
  };

  const handleDownloadAllFiltered = () => {
    generateConsolidatedWagesPDF(wages, 'Consolidated Site Muster Roll');
  };

  const isAllSelected = allEmployeeEntries.length > 0 && selectedEntryIds.size === allEmployeeEntries.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Wage Slip PDF (Select Particular Dates)"
      subtitle="Select an employee and choose the exact working dates to generate a printable PDF muster slip"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-5">
        {/* Step 1: Employee Selector */}
        <div>
          <label className="block text-xs font-bold text-[#172B4D] uppercase tracking-wider mb-1.5">
            1. Select Employee
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 text-[#172B4D] rounded-xl border border-[#E2E8F0] focus:border-[#0F8B78] focus:bg-white focus:outline-hidden font-medium"
            >
              {employeeOptions.map((emp) => {
                const count = wages.filter((w) => w.employeeId === emp.employeeId || w.employeeName === emp.name).length;
                return (
                  <option key={emp.employeeId} value={emp.employeeId}>
                    {emp.name} ({emp.role} • {emp.employeeId}) — {count} date{count !== 1 ? 's' : ''} available
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Step 2: Date Multi-Selection Picker */}
        <div className="bg-slate-50 border border-[#E2E8F0] rounded-2xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#172B4D] flex items-center gap-2">
                <span>2. Select Particular Dates</span>
                <span className="text-xs font-bold text-[#0F8B78] bg-[#0F8B78]/10 px-2.5 py-0.5 rounded-full border border-[#0F8B78]/25">
                  {selectedEntryIds.size} of {allEmployeeEntries.length} Dates Selected
                </span>
              </span>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Check the specific dates (e.g. 6 days) to include in this employee's wage slip PDF.
              </p>
            </div>

            {/* Quick selection shortcuts */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-2.5 py-1 text-[11px] font-semibold text-[#0F8B78] bg-white hover:bg-slate-50 border border-[#E2E8F0] rounded-lg transition-colors"
              >
                Select All
              </button>
              {allEmployeeEntries.length >= 6 && (
                <button
                  type="button"
                  onClick={() => handleSelectRecentDays(6)}
                  className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors"
                  title="Select the latest 6 working days"
                >
                  Select 6 Days
                </button>
              )}
              <button
                type="button"
                onClick={handleClearAll}
                className="px-2.5 py-1 text-[11px] font-semibold text-[#64748B] bg-white hover:bg-slate-100 border border-[#E2E8F0] rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Quick Date Range Filter Bar within Modal */}
          <div className="flex flex-wrap items-center gap-2 mb-3 bg-white p-2.5 rounded-xl border border-[#E2E8F0] text-xs">
            <span className="text-[11px] font-bold text-[#64748B] uppercase flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#0F8B78]" />
              <span>Range:</span>
            </span>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[#64748B]">From</span>
              <input
                type="date"
                value={filterFromDate}
                max={filterToDate || undefined}
                onChange={(e) => setFilterFromDate(e.target.value)}
                className="px-2 py-1 bg-slate-50 border border-[#E2E8F0] rounded-lg text-xs font-mono text-[#172B4D]"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[#64748B]">To</span>
              <input
                type="date"
                value={filterToDate}
                min={filterFromDate || undefined}
                onChange={(e) => setFilterToDate(e.target.value)}
                className="px-2 py-1 bg-slate-50 border border-[#E2E8F0] rounded-lg text-xs font-mono text-[#172B4D]"
              />
            </div>

            <button
              type="button"
              disabled={!filterFromDate && !filterToDate}
              onClick={handleSelectDateRange}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                filterFromDate || filterToDate
                  ? 'bg-[#0F8B78] text-white hover:bg-[#0D7A69] cursor-pointer'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              Select Dates in Range
            </button>

            {(filterFromDate || filterToDate) && (
              <button
                type="button"
                onClick={() => {
                  setFilterFromDate('');
                  setFilterToDate('');
                  handleSelectAll();
                }}
                className="px-2 py-1 text-xs font-medium text-[#64748B] hover:text-[#DC5353] hover:bg-rose-50 rounded-lg transition-colors"
              >
                Reset
              </button>
            )}
          </div>

          {/* Scrollable Date Selection List */}
          {allEmployeeEntries.length > 0 ? (
            <div className="max-h-56 overflow-y-auto divide-y divide-[#E2E8F0] bg-white border border-[#E2E8F0] rounded-xl">
              {allEmployeeEntries.map((entry) => {
                const id = entry.id || entry.wageId;
                const isChecked = selectedEntryIds.has(id);
                const att = entry.attendance || 'Present';
                const wagesAmt = Number(entry.wages) || 0;
                const advAmt = Number(entry.advance) || 0;
                const balAmt = entry.balance !== undefined ? Number(entry.balance) : (wagesAmt - advAmt);

                return (
                  <label
                    key={id}
                    className={`flex items-center justify-between p-2.5 sm:px-3 text-xs cursor-pointer transition-colors ${
                      isChecked ? 'bg-[#0F8B78]/10 hover:bg-[#0F8B78]/15' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleEntry(id)}
                        className="w-4 h-4 rounded text-[#0F8B78] focus:ring-[#0F8B78] border-[#E2E8F0] cursor-pointer"
                      />
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                        <span className="font-mono font-bold text-[#172B4D] flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(entry.date)}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5 sm:mt-0">
                          {att === 'Present' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0F8B78]/10 text-[#0F8B78] border border-[#0F8B78]/25">
                              Present (1 Day)
                            </span>
                          ) : att === 'Half Day' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                              Half Day (0.5 Day)
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                              Absent / Leave
                            </span>
                          )}
                          {entry.projectName && (
                            <span className="text-[10px] text-[#64748B] font-medium truncate max-w-[120px] sm:max-w-[180px]">
                              • {entry.projectName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Numeric amounts for this date */}
                    <div className="flex items-center gap-3 text-right font-mono tabular-nums text-[11px] shrink-0">
                      <div>
                        <span className="text-[10px] text-[#64748B] uppercase block font-sans">Wages</span>
                        <span className="font-semibold text-[#172B4D]">₹{wagesAmt}</span>
                      </div>
                      {advAmt > 0 && (
                        <div>
                          <span className="text-[10px] text-amber-700 uppercase block font-sans">Adv</span>
                          <span className="font-semibold text-amber-700">₹{advAmt}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] text-[#64748B] uppercase block font-sans">Bal</span>
                        <span className="font-bold text-[#0F8B78]">₹{balAmt}</span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center text-[#64748B] bg-white border border-[#E2E8F0] rounded-xl">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-[#172B4D]">No daily wage records found for this employee.</p>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Add daily wage entries for {selectedEmployee?.name || 'this worker'} first.
              </p>
            </div>
          )}
        </div>

        {/* Step 3: Live Visual Preview Card Matching Screenshot */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#172B4D]">
              3. PDF Preview ({selectedEntries.length} Dates Included)
            </span>
            <span className="text-[11px] text-[#0F8B78] font-semibold bg-[#0F8B78]/10 px-2 py-0.5 rounded border border-[#0F8B78]/25">
              WT displays Attendance
            </span>
          </div>

          <div className="bg-white border-2 border-[#172B4D] rounded-xl overflow-hidden text-xs shadow-2xs font-sans">
            {/* Top Name Bar */}
            <div className="bg-slate-100 border-b-2 border-[#172B4D] px-3 py-2 font-bold text-[#172B4D] text-sm flex items-center justify-between">
              <span>Name:{selectedEmployee?.name || 'Worker'}</span>
              <span className="text-xs font-normal text-[#64748B] font-mono">
                {selectedEntries.length} date{selectedEntries.length !== 1 ? 's' : ''} in this slip
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b-2 border-[#172B4D] bg-slate-50 font-bold text-[#172B4D] text-[11px]">
                    <th className="border-r-2 border-[#172B4D] py-2 px-3 w-1/4">Date</th>
                    <th className="border-r-2 border-[#172B4D] py-2 px-3 text-center w-1/4">WT</th>
                    <th className="border-r-2 border-[#172B4D] py-2 px-3 text-right w-1/6">Wages</th>
                    <th className="border-r-2 border-[#172B4D] py-2 px-3 text-right w-1/6">Adv.Amt</th>
                    <th className="py-2 px-3 text-right w-1/6">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-b-2 border-[#172B4D] font-mono tabular-nums text-[11px]">
                  {selectedEntries.length > 0 ? (
                    selectedEntries.map((row) => (
                      <tr key={row.id || row.wageId} className="hover:bg-slate-50">
                        <td className="border-r-2 border-[#172B4D] py-1.5 px-3 font-sans">
                          {row.date ? row.date.split('-').reverse().join('/') : '-'}
                        </td>
                        <td className="border-r-2 border-[#172B4D] py-1.5 px-3 text-center font-sans font-semibold text-[#0F8B78]">
                          {row.attendance || 'Present'}
                        </td>
                        <td className="border-r-2 border-[#172B4D] py-1.5 px-3 text-right">
                          {row.wages || 0}
                        </td>
                        <td className="border-r-2 border-[#172B4D] py-1.5 px-3 text-right">
                          {row.advance > 0 ? row.advance : ''}
                        </td>
                        <td className="py-1.5 px-3 text-right font-bold text-[#172B4D]">
                          {row.balance !== undefined ? row.balance : 0}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-amber-700 bg-amber-50/50 font-sans">
                        <AlertCircle className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                        <span className="font-bold">No dates selected yet!</span>
                        <p className="text-[11px] text-[#64748B] mt-0.5">
                          Please select one or more dates above (e.g. 6 days) to preview and generate the wage slip.
                        </p>
                      </td>
                    </tr>
                  )}
                  {/* Padding rows to mimic physical ledger */}
                  {selectedEntries.length > 0 && selectedEntries.length < 5 && (
                    <tr className="text-slate-300">
                      <td className="border-r-2 border-[#172B4D] py-1.5 px-3">-</td>
                      <td className="border-r-2 border-[#172B4D] py-1.5 px-3 text-center">-</td>
                      <td className="border-r-2 border-[#172B4D] py-1.5 px-3 text-right">-</td>
                      <td className="border-r-2 border-[#172B4D] py-1.5 px-3 text-right">-</td>
                      <td className="py-1.5 px-3 text-right">0</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Summary Section */}
            <div className="p-3 bg-white space-y-1 font-bold text-[#172B4D] text-xs font-sans border-t border-[#E2E8F0]">
              <div>Total Working Days :{stats.workingDays}</div>
              <div>Total Amount :{stats.totalAmount}</div>
              <div>Total Advance Amount :{stats.totalAdvance > 0 ? stats.totalAdvance : ''}</div>
              <div>Balance :{stats.balance}</div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDownloadAllFiltered}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#172B4D] bg-white hover:bg-slate-50 border border-[#E2E8F0] transition-colors"
          >
            <FileText className="w-4 h-4 text-[#64748B]" />
            Consolidated Muster Roll (All Records)
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selectedEntries.length === 0}
              onClick={handleDownloadSingleSlip}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-2xs transition-all ${
                selectedEntries.length > 0
                  ? 'text-white bg-[#0F8B78] hover:bg-[#0D7A69] cursor-pointer'
                  : 'text-slate-400 bg-slate-200 cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4" />
              Download PDF Slip ({selectedEntries.length} {selectedEntries.length === 1 ? 'Day' : 'Days'})
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
