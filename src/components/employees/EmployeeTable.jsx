import React, { useState } from 'react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  Archive, 
  RotateCcw, 
  Phone, 
  Calendar,
  Briefcase,
  Users,
  Coins,
  ShieldCheck,
  Receipt,
  FileText,
  AlertCircle,
  FileDown
} from 'lucide-react';
import { TagBadge } from '../common/Badge.jsx';
import { TablePagination } from '../common/TablePagination.jsx';
import { formatIndianCurrency, formatDate } from '../../utils/formatters.js';
import { calculateEmployeeWageReflection } from '../../utils/wageCalculator.js';
import { generateWageSlipPDF } from '../../utils/pdfGenerator.js';
import { EmployeeMusterModal } from './EmployeeMusterModal.jsx';
import { WageSlipPdfModal } from '../wages/WageSlipPdfModal.jsx';

export function EmployeeTable({
  employees = [],
  wages = [],
  sortConfig = { key: 'createdAt', direction: 'desc' },
  onSort,
  onEditEmployee,
  onArchiveEmployee,
  searchQuery = '',
  onClearFilters
}) {
  const [selectedMusterEmployee, setSelectedMusterEmployee] = useState(null);
  const [selectedMusterReflection, setSelectedMusterReflection] = useState(null);
  const [selectedPdfEmployeeId, setSelectedPdfEmployeeId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleOpenMusterLedger = (emp, reflection) => {
    setSelectedMusterEmployee(emp);
    setSelectedMusterReflection(reflection);
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#172B4D] transition-colors ml-1" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-[#0F8B78] ml-1" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-[#0F8B78] ml-1" />
    );
  };

  const headers = [
    { key: 'employeeId', label: 'Employee ID', align: 'left', sortable: true },
    { key: 'name', label: 'Name', align: 'left', sortable: true },
    { key: 'phone', label: 'Phone No', align: 'left', sortable: false },
    { key: 'role', label: 'Role', align: 'left', sortable: true },
    { key: 'joiningDate', label: 'Date', align: 'left', sortable: true },
    { key: 'status', label: 'Status', align: 'center', sortable: true },
    { key: 'pendingWages', label: 'Pending Wages (₹)', align: 'right', sortable: true },
    { key: 'paidWages', label: 'Paid Wages (₹)', align: 'right', sortable: true },
    { key: 'totalWages', label: 'Total Wages (₹)', align: 'right', sortable: true },
    { key: 'actions', label: 'Actions', align: 'center', sortable: false }
  ];

  if (employees.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center">
        <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h4 className="text-base font-bold text-[#172B4D]">No employees found</h4>
        <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1 mb-5">
          {searchQuery
            ? `No employee matched "${searchQuery}". Try adjusting your keywords or clearing active filters.`
            : 'No employees or site staff registered under this filter.'}
        </p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#0F8B78] bg-[#0F8B78]/10 hover:bg-[#0F8B78]/20 border border-[#0F8B78]/30 transition-colors"
          >
            Clear All Filters
          </button>
        )}
      </div>
    );
  }

  // Pre-calculate reflections for all employees to display in rows & compute footer totals
  const employeeReflections = employees.map((emp) => {
    const reflection = calculateEmployeeWageReflection(emp, wages);
    return {
      emp,
      reflection
    };
  });

  const totalReflectedPending = employeeReflections.reduce(
    (sum, item) => sum + item.reflection.pendingWages,
    0
  );
  const totalReflectedPaid = employeeReflections.reduce(
    (sum, item) => sum + item.reflection.paidWages,
    0
  );
  const totalReflectedGross = employeeReflections.reduce(
    (sum, item) => sum + item.reflection.totalWages,
    0
  );

  const totalPages = Math.max(1, Math.ceil(employeeReflections.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedReflections = employeeReflections.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  return (
    <>
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1050px]">
            <thead>
              <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[11px] font-bold text-[#64748B] uppercase tracking-wider select-none">
                {headers.map((h) => (
                  <th
                    key={h.key}
                    className={`py-3.5 px-3.5 ${
                      h.align === 'right'
                        ? 'text-right'
                        : h.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    } ${h.sortable ? 'cursor-pointer hover:bg-slate-100/70 transition-colors group' : ''}`}
                    onClick={() => h.sortable && onSort(h.key)}
                  >
                    <div
                      className={`inline-flex items-center ${
                        h.align === 'right'
                          ? 'justify-end w-full'
                          : h.align === 'center'
                          ? 'justify-center w-full'
                          : 'justify-start'
                      }`}
                    >
                      <span>{h.label}</span>
                      {h.sortable && getSortIcon(h.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-xs">
              {paginatedReflections.map(({ emp, reflection }) => (
                <tr
                  key={emp.id || emp.employeeId}
                  className={`hover:bg-slate-50/80 transition-colors group ${
                    emp.isArchived ? 'bg-slate-50/60 opacity-75' : ''
                  }`}
                >
                  {/* Employee ID */}
                  <td className="py-3.5 px-3.5 whitespace-nowrap font-mono font-bold text-[#0F8B78]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0F8B78]"></span>
                      <span>{emp.employeeId}</span>
                    </div>
                  </td>

                  {/* Name + Live Muster Tag */}
                  <td className="py-3.5 px-3.5 font-bold text-[#172B4D] whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 text-[#172B4D] flex items-center justify-center font-bold text-xs shrink-0 border border-[#E2E8F0]">
                        {emp.name ? emp.name[0].toUpperCase() : 'E'}
                      </div>
                      <div className="flex flex-col">
                        <span>{emp.name}</span>
                        {reflection.hasLiveEntries && (
                          <button
                            type="button"
                            onClick={() => handleOpenMusterLedger(emp, reflection)}
                            className="text-[10px] text-[#0F8B78] hover:text-[#0D7A69] font-semibold inline-flex items-center gap-1 text-left"
                            title="Click to view daily muster entries"
                          >
                            <span>⚡ {reflection.wageEntriesCount} shift{reflection.wageEntriesCount === 1 ? '' : 's'} synced</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Phone No */}
                  <td className="py-3.5 px-3.5 whitespace-nowrap text-[#64748B] font-mono text-[11px]">
                    <a 
                      href={`tel:${emp.phone}`}
                      className="inline-flex items-center gap-1 hover:text-[#0F8B78] transition-colors"
                    >
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{emp.phone}</span>
                    </a>
                  </td>

                  {/* Role */}
                  <td className="py-3.5 px-3.5 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                      emp.role === 'Supervisor'
                        ? 'bg-purple-50 text-purple-800 border border-purple-200'
                        : emp.role === 'Driver'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : emp.role === 'Site Engineer'
                        ? 'bg-teal-50 text-[#0F8B78] border border-teal-200'
                        : emp.role === 'Heavy Machinery Operator' || emp.role === 'Paver Operator'
                        ? 'bg-amber-50 text-amber-900 border border-amber-200'
                        : 'bg-slate-100 text-[#172B4D] border border-[#E2E8F0]'
                    }`}>
                      {emp.role}
                    </span>
                  </td>

                  {/* Date / Joining Date */}
                  <td className="py-3.5 px-3.5 whitespace-nowrap text-[#64748B] font-mono text-[11px]">
                    {formatDate(emp.joiningDate)}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
                    {emp.status === 'Active' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0F8B78]/10 text-[#0F8B78] border border-[#0F8B78]/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0F8B78]"></span>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-[#64748B] border border-[#E2E8F0]">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* Pending Wages (₹) */}
                  <td className="py-3.5 px-3.5 text-right font-mono font-bold tabular-nums whitespace-nowrap">
                    <div className="flex flex-col items-end">
                      <span className={reflection.pendingWages > 0 ? 'text-amber-700' : 'text-slate-400'}>
                        {formatIndianCurrency(reflection.pendingWages)}
                      </span>
                      {reflection.advanceOwed > 0 && (
                        <span 
                          className="text-[10px] font-semibold text-[#DC5353] bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 mt-0.5"
                          title="Worker received advance while absent; amount to be recovered"
                        >
                          -{formatIndianCurrency(reflection.advanceOwed)} adv owed
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Paid Wages (₹) */}
                  <td className="py-3.5 px-3.5 text-right font-mono text-[#0F8B78] font-medium tabular-nums whitespace-nowrap">
                    <div className="flex flex-col items-end">
                      <span>{formatIndianCurrency(reflection.paidWages)}</span>
                      {reflection.statusBreakdown?.Paid > 0 && (
                        <span className="text-[10px] text-[#0F8B78] font-sans">
                          {reflection.statusBreakdown.Paid} settled
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Total Wages (₹) */}
                  <td className="py-3.5 px-3.5 text-right font-mono font-bold text-[#172B4D] tabular-nums whitespace-nowrap bg-slate-50/50">
                    <button
                      type="button"
                      onClick={() => handleOpenMusterLedger(emp, reflection)}
                      className="hover:underline text-right block w-full text-[#172B4D]"
                      title="Click to view muster roll history"
                    >
                      {formatIndianCurrency(reflection.totalWages)}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenMusterLedger(emp, reflection)}
                        title="View Daily Wage Muster Ledger"
                        className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F8B78] hover:bg-[#0F8B78]/10 transition-colors"
                        aria-label="View Wage Ledger"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setSelectedPdfEmployeeId(emp.employeeId)}
                        title={`Select dates & download Wage Slip PDF for ${emp.name}`}
                        className="p-1.5 rounded-lg text-purple-700 hover:text-purple-900 hover:bg-purple-50 transition-colors"
                        aria-label="Download Wage Slip PDF"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onEditEmployee(emp)}
                        title="Edit Employee"
                        className="p-1.5 rounded-lg text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 transition-colors"
                        aria-label="Edit Employee"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onArchiveEmployee(emp)}
                        title={emp.isArchived ? 'Restore Employee' : 'Archive Employee'}
                        className={`p-1.5 rounded-lg transition-colors ${
                          emp.isArchived
                            ? 'text-amber-600 hover:text-amber-800 hover:bg-amber-50'
                            : 'text-[#64748B] hover:text-[#DC5353] hover:bg-rose-50'
                        }`}
                        aria-label={emp.isArchived ? 'Restore Employee' : 'Archive Employee'}
                      >
                        {emp.isArchived ? (
                          <RotateCcw className="w-4 h-4" />
                        ) : (
                          <Archive className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Component */}
        <TablePagination
          currentPage={safeCurrentPage}
          totalItems={employees.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 25, 50]}
          itemName="employees"
        />

        {/* Table Footer with Wage Summary from Live Reflection */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] gap-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[#0F8B78] text-[11px] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0F8B78]" />
              Wages live reflected from Daily Wages module by status
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono tabular-nums">
            <span>
              Pending: <strong className="text-amber-700">{formatIndianCurrency(totalReflectedPending)}</strong>
            </span>
            <span>
              Paid: <strong className="text-[#0F8B78]">{formatIndianCurrency(totalReflectedPaid)}</strong>
            </span>
            <span>
              Gross: <strong className="text-[#172B4D]">{formatIndianCurrency(totalReflectedGross)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Employee Muster Details Modal */}
      <EmployeeMusterModal
        isOpen={!!selectedMusterEmployee}
        onClose={() => setSelectedMusterEmployee(null)}
        employee={selectedMusterEmployee}
        reflection={selectedMusterReflection}
      />

      {/* Wage Slip PDF Modal with Date Multi-Select */}
      {selectedPdfEmployeeId && (
        <WageSlipPdfModal
          isOpen={!!selectedPdfEmployeeId}
          onClose={() => setSelectedPdfEmployeeId(null)}
          wages={wages}
          employees={employees}
          initialEmployeeId={selectedPdfEmployeeId}
        />
      )}
    </>
  );
}
