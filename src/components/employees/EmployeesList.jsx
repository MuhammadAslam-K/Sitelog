import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  RotateCcw, 
  Users, 
  Archive, 
  Coins,
  Phone,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { EmployeeTable } from './EmployeeTable.jsx';
import { EMPLOYEE_ROLES, EMPLOYEE_STATUSES } from '../../utils/constants.js';
import { formatIndianCurrency, formatIndianCompact } from '../../utils/formatters.js';
import { calculateEmployeeWageReflection } from '../../utils/wageCalculator.js';

export function EmployeesList({
  employees = [],
  wages = [],
  onAddNewEmployee,
  onEditEmployee,
  onArchiveEmployee,
  searchQuery = '',
  onSearchChange
}) {
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [showArchived, setShowArchived] = useState(false);

  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });

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
    setSelectedRole('ALL');
    setSelectedStatus('ALL');
    setShowArchived(false);
    onSearchChange('');
  };

  const isFilterActive =
    selectedRole !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    showArchived ||
    searchQuery.trim().length > 0;

  // Processed filtered and sorted employees with reflected wages
  const processedEmployees = useMemo(() => {
    return employees
      .filter((emp) => {
        // Archive filter
        if (!showArchived && emp.isArchived) return false;
        if (showArchived && !emp.isArchived) return true;

        // Search by Name, Employee ID, or Phone
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesId = emp.employeeId?.toLowerCase().includes(q);
          const matchesName = emp.name?.toLowerCase().includes(q);
          const matchesPhone = emp.phone?.toLowerCase().includes(q);
          if (!matchesId && !matchesName && !matchesPhone) return false;
        }

        // Role filter
        if (selectedRole !== 'ALL') {
          if (selectedRole === 'Other') {
            const isStandard = EMPLOYEE_ROLES.slice(0, -1).includes(emp.role);
            if (isStandard) return false;
          } else if (emp.role !== selectedRole) {
            return false;
          }
        }

        // Status filter
        if (selectedStatus !== 'ALL') {
          if (emp.status !== selectedStatus) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (['pendingWages', 'paidWages', 'totalWages'].includes(sortConfig.key)) {
          const refA = calculateEmployeeWageReflection(a, wages);
          const refB = calculateEmployeeWageReflection(b, wages);
          const numA = refA[sortConfig.key] || 0;
          const numB = refB[sortConfig.key] || 0;
          return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
        }

        if (sortConfig.key === 'dailyWageRate') {
          const numA = Number(a.dailyWageRate) || 0;
          const numB = Number(b.dailyWageRate) || 0;
          return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
        }

        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
  }, [
    employees,
    wages,
    searchQuery,
    selectedRole,
    selectedStatus,
    showArchived,
    sortConfig
  ]);

  const activeEmployees = employees.filter((e) => !e.isArchived);
  const totalEmployeesCount = activeEmployees.length;
  const activeCount = activeEmployees.filter((e) => e.status === 'Active').length;

  // Compute live reflected totals across all active employees
  const reflectedTotals = useMemo(() => {
    let pending = 0;
    let paid = 0;
    let gross = 0;
    let advanceOwedTotal = 0;

    activeEmployees.forEach((emp) => {
      const ref = calculateEmployeeWageReflection(emp, wages);
      pending += ref.pendingWages;
      paid += ref.paidWages;
      gross += ref.totalWages;
      advanceOwedTotal += ref.advanceOwed;
    });

    return {
      pending: Math.round(pending * 100) / 100,
      paid: Math.round(paid * 100) / 100,
      gross: Math.round(gross * 100) / 100,
      advanceOwed: Math.round(advanceOwedTotal * 100) / 100
    };
  }, [activeEmployees, wages]);

  const archivedCount = employees.filter((e) => e.isArchived).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0F8B78]"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F8B78]">
              Phase 3 Active • Employee & Workforce Management
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#172B4D] tracking-tight mt-1">
            Employees & Site Staff
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Register supervisors, drivers, site engineers, operators and track individual wage liabilities.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onAddNewEmployee}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#0F8B78] hover:bg-[#0D7A69] shadow-2xs hover:shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            Add New Employee
          </button>
        </div>
      </div>

      {/* KPI Overview Chips (Live Reflected from Daily Wages Status) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Total Staff</p>
          <p className="text-xl sm:text-2xl font-black text-[#172B4D] mt-0.5">{totalEmployeesCount}</p>
          <span className="text-[10px] text-[#0F8B78] font-semibold">{activeCount} Currently Active</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Pending Wages</p>
          <p className="text-xl sm:text-2xl font-black text-amber-700 font-mono tabular-nums mt-0.5">
            {formatIndianCurrency(reflectedTotals.pending)}
          </p>
          <span className="text-[10px] text-amber-700 font-semibold">
            {reflectedTotals.advanceOwed > 0
              ? `Unsettled (incl. ${formatIndianCurrency(reflectedTotals.advanceOwed)} adv owed)`
              : 'Unsettled site balances'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Paid Wages</p>
          <p className="text-xl sm:text-2xl font-black text-[#0F8B78] font-mono tabular-nums mt-0.5">
            {formatIndianCurrency(reflectedTotals.paid)}
          </p>
          <span className="text-[10px] text-[#0F8B78] font-semibold">Advances + Paid shifts</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Total Gross Wages</p>
          <p className="text-xl sm:text-2xl font-black text-[#172B4D] font-mono tabular-nums mt-0.5">
            {formatIndianCurrency(reflectedTotals.gross)}
          </p>
          <span className="text-[10px] text-[#64748B] font-semibold">Earned work liability</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by Name, Phone No, or Employee ID (e.g. EMP-101)..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 text-xs sm:text-sm text-[#172B4D] rounded-xl border border-[#E2E8F0] focus:border-[#0F8B78] focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Archive Toggle Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                showArchived
                  ? 'bg-amber-100/70 text-amber-900 border-amber-300'
                  : 'bg-white text-[#172B4D] border-[#E2E8F0] hover:bg-slate-50'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{showArchived ? 'Showing Archived' : `Include Archived (${archivedCount})`}</span>
            </button>

            {isFilterActive && (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#DC5353] bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#E2E8F0] text-xs">
          {/* Role Filter */}
          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
              Filter by Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 text-[#172B4D] rounded-xl border border-[#E2E8F0] focus:border-[#0F8B78] focus:bg-white focus:outline-hidden"
            >
              <option value="ALL">All Roles ({employees.length})</option>
              {EMPLOYEE_ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
              Filter by Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 text-[#172B4D] rounded-xl border border-[#E2E8F0] focus:border-[#0F8B78] focus:bg-white focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              {EMPLOYEE_STATUSES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employee Table with Daily Wage reflection by status */}
      <EmployeeTable
        employees={processedEmployees}
        wages={wages}
        sortConfig={sortConfig}
        onSort={handleSort}
        onEditEmployee={onEditEmployee}
        onArchiveEmployee={onArchiveEmployee}
        searchQuery={searchQuery}
        onClearFilters={isFilterActive ? clearAllFilters : null}
      />
    </div>
  );
}
