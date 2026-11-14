import React, { useState, useMemo } from 'react';
import { 
  X, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Coins, 
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Receipt,
  FileDown
} from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { TablePagination } from '../common/TablePagination.jsx';
import { formatIndianCurrency, formatDate } from '../../utils/formatters.js';
import { generateWageSlipPDF } from '../../utils/pdfGenerator.js';

export function EmployeeMusterModal({
  isOpen,
  onClose,
  employee,
  reflection
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  if (!employee) return null;

  const entries = reflection?.entries || [];
  const totalPages = Math.max(1, Math.ceil(entries.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedEntries = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return entries.slice(start, start + pageSize);
  }, [entries, safeCurrentPage, pageSize]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Wage Muster Ledger • ${employee.name}`}
      subtitle={`${employee.employeeId} • ${employee.role} • Rate: ${formatIndianCurrency(employee.dailyWageRate)}/day`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-5">
        {/* Reflection Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-[#E2E8F0]">
          <div>
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
              Pending Wages
            </span>
            <span className="text-lg font-black font-mono tabular-nums text-amber-700">
              {formatIndianCurrency(reflection?.pendingWages || 0)}
            </span>
            <span className="text-[10px] text-[#64748B] block">Unsettled shifts</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
              Paid Wages
            </span>
            <span className="text-lg font-black font-mono tabular-nums text-[#0F8B78]">
              {formatIndianCurrency(reflection?.paidWages || 0)}
            </span>
            <span className="text-[10px] text-[#64748B] block">Advances + Settled</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
              Total Wages
            </span>
            <span className="text-lg font-black font-mono tabular-nums text-[#172B4D]">
              {formatIndianCurrency(reflection?.totalWages || 0)}
            </span>
            <span className="text-[10px] text-[#64748B] block">Gross earned</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
              Advance Owed
            </span>
            <span className={`text-lg font-black font-mono tabular-nums ${
              (reflection?.advanceOwed || 0) > 0 ? 'text-[#DC5353]' : 'text-slate-400'
            }`}>
              {formatIndianCurrency(reflection?.advanceOwed || 0)}
            </span>
            <span className="text-[10px] text-[#64748B] block">From leave advances</span>
          </div>
        </div>

        {/* Status Explanation */}
        <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-xl flex items-center justify-between text-xs text-[#172B4D]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0F8B78] shrink-0" />
            <span>
              Reflected from <strong>{entries.length}</strong> daily wage muster record{entries.length === 1 ? '' : 's'}.
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-semibold">
            {reflection?.statusBreakdown?.Paid > 0 && (
              <span className="px-2 py-0.5 rounded bg-[#0F8B78]/10 text-[#0F8B78] border border-[#0F8B78]/25">
                {reflection.statusBreakdown.Paid} Paid
              </span>
            )}
            {reflection?.statusBreakdown?.Pending > 0 && (
              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                {reflection.statusBreakdown.Pending} Pending
              </span>
            )}
            {reflection?.statusBreakdown?.Partial > 0 && (
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                {reflection.statusBreakdown.Partial} Partial
              </span>
            )}
            {reflection?.statusBreakdown?.['Advance on Leave'] > 0 && (
              <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-900 border border-purple-200">
                {reflection.statusBreakdown['Advance on Leave']} Leave Adv
              </span>
            )}
          </div>
        </div>

        {/* Entries Table */}
        {entries.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-[#E2E8F0]">
            <Coins className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-[#172B4D]">No daily muster logs yet for this employee</p>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Wage amounts shown in the table are currently from baseline registration records.
            </p>
          </div>
        ) : (
          <div className="border border-[#E2E8F0] rounded-xl overflow-hidden max-h-80 overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 sticky top-0 border-b border-[#E2E8F0] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Date & ID</th>
                  <th className="py-2.5 px-3">Project Site</th>
                  <th className="py-2.5 px-3 text-center">Attendance</th>
                  <th className="py-2.5 px-3 text-right">Earned (₹)</th>
                  <th className="py-2.5 px-3 text-right">Advance (₹)</th>
                  <th className="py-2.5 px-3 text-right">Balance (₹)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {paginatedEntries.map((item) => {
                  const isLeave = item.attendance === 'Absent / On Leave';
                  const effectiveStatus = item.status || (isLeave ? 'Advance on Leave' : item.advance > 0 ? (item.balance > 0 ? 'Partial' : 'Paid') : 'Pending');

                  return (
                    <tr key={item.id || item.wageId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-semibold text-[#172B4D]">{formatDate(item.date)}</div>
                        <span className="font-mono text-[10px] text-[#0F8B78] font-bold">{item.wageId}</span>
                      </td>

                      <td className="py-2.5 px-3 max-w-[180px]">
                        <span className="truncate block font-medium text-[#172B4D]" title={item.projectName}>
                          {item.projectName}
                        </span>
                        {item.notes && (
                          <span className="text-[10px] text-[#64748B] truncate block">{item.notes}</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                          item.attendance === 'Present'
                            ? 'bg-[#0F8B78]/10 text-[#0F8B78]'
                            : item.attendance === 'Half Day'
                            ? 'bg-blue-50 text-blue-800'
                            : 'bg-amber-50 text-amber-900 border border-amber-200'
                        }`}>
                          {item.attendance}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums whitespace-nowrap text-[#172B4D]">
                        {formatIndianCurrency(item.wages || 0)}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                        {(item.advance || 0) > 0 ? (
                          <span className="text-amber-700 font-bold">{formatIndianCurrency(item.advance)}</span>
                        ) : (
                          <span className="text-slate-400">₹0</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums whitespace-nowrap">
                        {effectiveStatus === 'Paid' ? (
                          <span className="text-[#0F8B78] bg-[#0F8B78]/10 px-1.5 py-0.5 rounded text-[11px]">
                            ₹0 (Paid)
                          </span>
                        ) : (item.balance || 0) < 0 ? (
                          <span className="text-[#DC5353]">-{formatIndianCurrency(Math.abs(item.balance))}</span>
                        ) : (
                          <span className="text-[#0F8B78]">{formatIndianCurrency(item.balance || 0)}</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          effectiveStatus === 'Paid'
                            ? 'bg-[#0F8B78]/10 text-[#0F8B78] border border-[#0F8B78]/25'
                            : effectiveStatus === 'Pending'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : effectiveStatus === 'Partial'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-purple-50 text-purple-900 border border-purple-200'
                        }`}>
                          {effectiveStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Table Pagination Component */}
            <TablePagination
              currentPage={safeCurrentPage}
              totalItems={entries.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[5, 8, 15, 30]}
              itemName="muster logs"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
          <button
            type="button"
            onClick={() => generateWageSlipPDF(employee.name, entries, { employeeId: employee.employeeId, role: employee.role })}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F8B78] hover:bg-[#0D7A69] text-xs font-bold text-white shadow-2xs transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Download PDF Wage Slip
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-[#E2E8F0] text-xs font-semibold text-[#172B4D] transition-colors"
          >
            Close Muster Ledger
          </button>
        </div>
      </div>
    </Modal>
  );
}
