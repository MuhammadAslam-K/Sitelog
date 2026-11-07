import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  RotateCcw, 
  Coins, 
  Calendar, 
  Building2, 
  Users, 
  User, 
  Info,
  CheckCircle2,
  AlertCircle,
  FileDown,
  CheckSquare,
  Filter,
  X,
  ArrowRight
} from 'lucide-react';
import { WageTable } from './WageTable.jsx';
import { WageSlipPdfModal } from './WageSlipPdfModal.jsx';
import { ATTENDANCE_STATUSES, WAGE_PAYMENT_STATUSES } from '../../utils/constants.js';
import { formatIndianCurrency, formatDate } from '../../utils/formatters.js';
import { getWagePayableBalance, getWagePaidAmount } from '../../utils/wageCalculator.js';

export function DailyWagesList({
  wages = [],
  employees = [],
  projects = [],
  onAddNewWage,
  onEditWage,
  onDeleteWage,
  onSettleWage,
  searchQuery = '',
  onSearchChange
}) {
  // Filter States
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState('ALL');
  const [selectedAttendance, setSelectedAttendance] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // PDF Modal states
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfTargetEmployeeId, setPdfTargetEmployeeId] = useState(null);
  const [pdfTargetWageIds, setPdfTargetWageIds] = useState([]);

  // Multi-select state for choosing particular dates directly from the table
  const [selectedWageIds, setSelectedWageIds] = useState([]);

  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc'
  });

  // Extract unique employees for the "Filter based on name" dropdown
  const employeeFilterOptions = useMemo(() => {
    const map = new Map();

    // From active employees collection
    employees.forEach((emp) => {
      if (emp.name && !emp.isArchived) {
        const key = emp.employeeId || emp.name;
        map.set(key, {
          id: key,
          name: emp.name,
          role: emp.role || 'Worker',
          code: emp.employeeId || ''
        });
      }
    });

    // Also include any employees recorded in wages
    wages.forEach((w) => {
      const key = w.employeeId || w.employeeName;
      if (key && !map.has(key)) {
        map.set(key, {
          id: key,
          name: w.employeeName,
          role: w.employeeRole || 'Worker',
          code: w.employeeId || ''
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [employees, wages]);

  const handleSort = (columnKey) => {
    setSortConfig((prev) => {
      if (prev.key === columnKey) {
        return {
          key: columnKey,
          direction: prev.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return {
        key: columnKey,
        direction: 'asc'
      };
    });
  };

  const clearAllFilters = () => {
    setSelectedEmployeeId('ALL');
    setSelectedProjectId('ALL');
    setSelectedAttendance('ALL');
    setSelectedStatus('ALL');
    setFromDate('');
    setToDate('');
    onSearchChange('');
  };

  // Quick Date Range Shortcuts
  const setDatePreset = (preset) => {
    const today = new Date();
    const formatYMD = (d) => d.toISOString().split('T')[0];

    if (preset === 'today') {
      const dStr = formatYMD(today);
      setFromDate(dStr);
      setToDate(dStr);
    } else if (preset === 'last7') {
      const past = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
      setFromDate(formatYMD(past));
      setToDate(formatYMD(today));
    } else if (preset === 'thisMonth') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setFromDate(formatYMD(firstDay));
      setToDate(formatYMD(today));
    } else if (preset === 'clear') {
      setFromDate('');
      setToDate('');
    }
  };

  const isFilterActive =
    selectedEmployeeId !== 'ALL' ||
    selectedProjectId !== 'ALL' ||
    selectedAttendance !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    fromDate !== '' ||
    toDate !== '' ||
    searchQuery.trim().length > 0;

  // Filter and sort wage records
  const processedWages = useMemo(() => {
    return wages
      .filter((item) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesId = item.wageId?.toLowerCase().includes(q);
          const matchesEmp = item.employeeName?.toLowerCase().includes(q) || item.employeeId?.toLowerCase().includes(q);
          const matchesPrj = item.projectName?.toLowerCase().includes(q) || item.projectId?.toLowerCase().includes(q);
          const matchesNotes = item.notes?.toLowerCase().includes(q);
          if (!matchesId && !matchesEmp && !matchesPrj && !matchesNotes) return false;
        }

        // Filter based on Employee Name / ID
        if (selectedEmployeeId !== 'ALL') {
          const matchesEmp = item.employeeId === selectedEmployeeId || item.employeeName === selectedEmployeeId;
          if (!matchesEmp) return false;
        }

        // Filter based on Project
        if (selectedProjectId !== 'ALL') {
          if (item.projectId !== selectedProjectId) return false;
        }

        // Filter based on Attendance
        if (selectedAttendance !== 'ALL') {
          if (item.attendance !== selectedAttendance) return false;
        }

        // Filter based on Status
        if (selectedStatus !== 'ALL') {
          if (item.status !== selectedStatus) return false;
        }

        // Date Range: From Date
        if (fromDate) {
          if (!item.date || item.date < fromDate) return false;
        }

        // Date Range: To Date
        if (toDate) {
          if (!item.date || item.date > toDate) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (['wages', 'advance', 'balance'].includes(sortConfig.key)) {
          const numA = Number(valA) || 0;
          const numB = Number(valB) || 0;
          return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
        }

        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
  }, [
    wages,
    searchQuery,
    selectedEmployeeId,
    selectedProjectId,
    selectedAttendance,
    selectedStatus,
    fromDate,
    toDate,
    sortConfig
  ]);

  // Selection handlers
  const handleToggleSelectWage = (id) => {
    setSelectedWageIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  };

  const handleSelectAllWages = (checked) => {
    if (checked) {
      const visibleIds = processedWages.map((w) => w.id || w.wageId);
      const combined = Array.from(new Set([...selectedWageIds, ...visibleIds]));
      setSelectedWageIds(combined);
    } else {
      const visibleIds = new Set(processedWages.map((w) => w.id || w.wageId));
      setSelectedWageIds((prev) => prev.filter((id) => !visibleIds.has(id)));
    }
  };

  const handleClearSelection = () => {
    setSelectedWageIds([]);
  };

  const handleCreatePdfForSelected = (selectedInfo) => {
    if (!selectedInfo || selectedInfo.count === 0) return;

    if (selectedInfo.singleEmployeeId) {
      setPdfTargetEmployeeId(selectedInfo.singleEmployeeId);
    } else if (selectedInfo.entries[0]?.employeeId) {
      setPdfTargetEmployeeId(selectedInfo.entries[0].employeeId);
    }
    setPdfTargetWageIds(selectedWageIds);
    setIsPdfModalOpen(true);
  };

  // Open PDF modal with smart pre-selection based on current employee and date filters
  const handleOpenPdfModal = () => {
    if (selectedEmployeeId !== 'ALL') {
      setPdfTargetEmployeeId(selectedEmployeeId);
      const filteredIds = processedWages.map((w) => w.id || w.wageId);
      setPdfTargetWageIds(filteredIds);
    } else {
      setPdfTargetEmployeeId(null);
      setPdfTargetWageIds(selectedWageIds);
    }
    setIsPdfModalOpen(true);
  };

  // Check if filters are currently active
  const isFiltered = Boolean(
    searchQuery ||
    selectedEmployeeId !== 'ALL' ||
    selectedProjectId !== 'ALL' ||
    selectedAttendance !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    fromDate ||
    toDate
  );

  // When filters are applied, metrics reflect the active filtered subset; otherwise all muster entries
  const calculationPool = isFiltered ? processedWages : wages;

  // Aggregate metrics (strictly status-aware so paid amounts deduct from net balance payable)
  const totalWagesEarned = calculationPool.reduce((sum, w) => sum + (Number(w.wages) || 0), 0);
  const totalAdvancesGiven = calculationPool.reduce((sum, w) => sum + (Number(w.advance) || 0), 0);
  const totalPaidAmount = calculationPool.reduce((sum, w) => sum + getWagePaidAmount(w), 0);
  const netBalancePayable = calculationPool.reduce((sum, w) => sum + getWagePayableBalance(w), 0);
  const settledCount = calculationPool.filter((w) => w.status === 'Paid').length;
  const pendingCount = calculationPool.filter((w) => w.status !== 'Paid').length;
  const absentAdvancesCount = calculationPool.filter((w) => w.attendance === 'Absent / On Leave' && Number(w.advance) > 0).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0F8B78]"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F8B78]">
              Active Module • Daily Wages & Attendance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#172B4D] tracking-tight mt-1">
            Daily Wages & Muster Roll
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Track daily attendance, earned wages, site cash advances, and filter by employee name and date range (From / To).
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          <button
            onClick={handleOpenPdfModal}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#172B4D] bg-white hover:bg-slate-50 border border-[#E2E8F0] shadow-2xs hover:shadow-xs transition-all"
            title="Select employee and particular dates (e.g. 6 days) to generate Wage Slip PDF"
          >
            <FileDown className="w-4 h-4 text-[#0F8B78]" />
            <span>Select Dates & Download PDF</span>
          </button>

          <button
            onClick={onAddNewWage}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#0F8B78] hover:bg-[#0D7A69] shadow-2xs hover:shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Daily Wage / Advance
          </button>
        </div>
      </div>

      {/* KPI Overview Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Muster Entries</p>
            {isFiltered && (
              <span className="text-[9px] font-bold text-[#0F8B78] bg-[#0F8B78]/10 px-1.5 py-0.5 rounded">
                Filtered ({calculationPool.length}/{wages.length})
              </span>
            )}
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#172B4D] mt-0.5">{calculationPool.length}</p>
          <span className="text-[10px] text-[#0F8B78] font-semibold">
            {settledCount > 0 ? `${settledCount} Paid • ${pendingCount} Pending` : 'Total logged work shifts'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Total Earned Wages</p>
          <p className="text-xl sm:text-2xl font-black text-[#172B4D] font-mono tabular-nums mt-0.5">
            {formatIndianCurrency(totalWagesEarned)}
          </p>
          <span className="text-[10px] text-[#64748B] font-semibold">Gross work liability</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Total Wages & Advances Paid</p>
          <p className="text-xl sm:text-2xl font-black text-amber-700 font-mono tabular-nums mt-0.5">
            {formatIndianCurrency(totalPaidAmount)}
          </p>
          <span className="text-[10px] text-amber-700 font-semibold" title={`Includes ${formatIndianCurrency(totalAdvancesGiven)} site advances + settled wage disbursements`}>
            {formatIndianCurrency(totalAdvancesGiven)} advances • {settledCount} settled
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Net Balance Payable</p>
          <p className="text-xl sm:text-2xl font-black text-[#0F8B78] font-mono tabular-nums mt-0.5">
            {formatIndianCurrency(netBalancePayable)}
          </p>
          <span className="text-[10px] text-[#0F8B78] font-semibold">
            Remaining unpaid balance ({pendingCount} pending)
          </span>
        </div>
      </div>


      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-4">
        {/* Search Input & Reset Button */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by Employee, Project, or Entry ID (e.g. WAG-101)..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 text-xs sm:text-sm text-[#172B4D] rounded-xl border border-[#E2E8F0] focus:border-[#0F8B78] focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Date Range Quick Preset Shortcuts */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium text-[#64748B]">
              <span className="px-2 text-[10px] font-bold uppercase text-[#64748B]">Date Presets:</span>
              <button
                type="button"
                onClick={() => setDatePreset('today')}
                className="px-2.5 py-1 rounded-lg hover:bg-white hover:text-[#0F8B78] transition-colors text-[11px]"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setDatePreset('last7')}
                className="px-2.5 py-1 rounded-lg hover:bg-white hover:text-[#0F8B78] transition-colors text-[11px]"
              >
                Last 7 Days
              </button>
              <button
                type="button"
                onClick={() => setDatePreset('thisMonth')}
                className="px-2.5 py-1 rounded-lg hover:bg-white hover:text-[#0F8B78] transition-colors text-[11px]"
              >
                This Month
              </button>
            </div>

            {/* Reset Filters Button */}
            {isFilterActive && (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#DC5353] bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                title="Clear all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 pt-3 border-t border-[#E2E8F0] text-xs">
          {/* 1. Filter based on Name */}
          <div>
            <label className="block text-[11px] font-bold text-[#172B4D] uppercase tracking-wider mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#0F8B78]" />
              <span>Employee Name</span>
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 text-[#172B4D] rounded-xl border border-[#E2E8F0] focus:border-[#0F8B78] focus:bg-white focus:outline-hidden font-medium"
            >
              <option value="ALL">All Employees ({employeeFilterOptions.length})</option>
              {employeeFilterOptions.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} {emp.code ? `(${emp.code})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 2. From Date */}
          <div>
            <label className="block text-[11px] font-bold text-[#172B4D] uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#0F8B78]" />
              <span>From Date</span>
            </label>
            <input
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 text-[#172B4D] rounded-xl border border-[#E2E8F0] focus:border-[#0F8B78] focus:bg-white focus:outline-hidden font-mono"
            />
          </div>

          {/* 3. To Date */}
          <div>
            <label className="block text-[11px] font-bold text-[#172B4D] uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#0F8B78]" />
              <span>To Date</span>
            </label>
            <input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 text-[#172B4D] rounded-xl border border-[#E2E8F0] focus:border-[#0F8B78] focus:bg-white focus:outline-hidden font-mono"
            />
          </div>

          {/* 4. Project Site */}
          <div>
            <label className="block text-[11px] font-bold text-[#172B4D] uppercase tracking-wider mb-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-[#0F8B78]" />
              <span>Project Site</span>
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 text-[#172B4D] rounded-xl border border-[#E2E8F0] focus:border-[#0F8B78] focus:bg-white focus:outline-hidden font-medium"
            >
              <option value="ALL">All Projects ({projects.length})</option>
              {projects.map((p) => (
                <option key={p.projectId} value={p.projectId}>
                  {p.projectId} - {p.projectName}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Attendance */}
          <div>
            <label className="block text-[11px] font-bold text-[#172B4D] uppercase tracking-wider mb-1">
              Attendance
            </label>
            <select
              value={selectedAttendance}
              onChange={(e) => setSelectedAttendance(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 text-[#172B4D] rounded-xl border border-[#E2E8F0] focus:border-[#0F8B78] focus:bg-white focus:outline-hidden font-medium"
            >
              <option value="ALL">All Types</option>
              {ATTENDANCE_STATUSES.map((att) => (
                <option key={att} value={att}>{att}</option>
              ))}
            </select>
          </div>

          {/* 6. Payment Status */}
          <div>
            <label className="block text-[11px] font-bold text-[#172B4D] uppercase tracking-wider mb-1">
              Payment Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 text-[#172B4D] rounded-xl border border-[#E2E8F0] focus:border-[#0F8B78] focus:bg-white focus:outline-hidden font-medium"
            >
              <option value="ALL">All Statuses</option>
              {WAGE_PAYMENT_STATUSES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Wage Table */}
      <WageTable
        wages={processedWages}
        allWages={wages}
        sortConfig={sortConfig}
        onSort={handleSort}
        onEditWage={onEditWage}
        onDeleteWage={onDeleteWage}
        onSettleWage={onSettleWage}
        onDownloadSlip={handleOpenPdfModal}
        searchQuery={searchQuery}
        onClearFilters={isFilterActive ? clearAllFilters : null}
        selectedWageIds={selectedWageIds}
        onToggleSelectWage={handleToggleSelectWage}
        onSelectAllWages={handleSelectAllWages}
        onClearSelection={handleClearSelection}
        onCreatePdfForSelected={handleCreatePdfForSelected}
      />

      {/* Wage Slip PDF Modal */}
      {isPdfModalOpen && (
        <WageSlipPdfModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          wages={wages}
          employees={employees}
          initialEmployeeId={pdfTargetEmployeeId}
          initialSelectedWageIds={pdfTargetWageIds}
        />
      )}
    </div>
  );
}
