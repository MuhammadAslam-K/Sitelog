import React from 'react';
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
import { formatIndianCurrency, formatDate } from '../../utils/formatters.js';
import { generateWageSlipPDF } from '../../utils/pdfGenerator.js';

export function EmployeeMusterModal({
  isOpen,
  onClose,
  employee,
  reflection
}) {
  if (!employee) return null;

  const entries = reflection?.entries || [];

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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Pending Wages
            </span>
            <span className="text-lg font-black font-mono text-amber-800">
              {formatIndianCurrency(reflection?.pendingWages || 0)}
            </span>
            <span className="text-[10px] text-slate-500 block">Unsettled shifts</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Paid Wages
            </span>
            <span className="text-lg font-black font-mono text-emerald-800">
              {formatIndianCurrency(reflection?.paidWages || 0)}
            </span>
            <span className="text-[10px] text-slate-500 block">Advances + Settled</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Wages
            </span>
            <span className="text-lg font-black font-mono text-slate-900">
              {formatIndianCurrency(reflection?.totalWages || 0)}
            </span>
            <span className="text-[10px] text-slate-500 block">Gross earned</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Advance Owed
            </span>
            <span className={`text-lg font-black font-mono ${
              (reflection?.advanceOwed || 0) > 0 ? 'text-rose-700' : 'text-slate-400'
            }`}>
              {formatIndianCurrency(reflection?.advanceOwed || 0)}
            </span>
            <span className="text-[10px] text-slate-500 block">From leave advances</span>
          </div>
        </div>

        {/* Status Explanation */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-950">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              Reflected from <strong>{entries.length}</strong> daily wage muster record{entries.length === 1 ? '' : 's'}.
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-semibold">
            {reflection?.statusBreakdown?.Paid > 0 && (
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                {reflection.statusBreakdown.Paid} Paid
              </span>
            )}
            {reflection?.statusBreakdown?.Pending > 0 && (
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                {reflection.statusBreakdown.Pending} Pending
              </span>
            )}
            {reflection?.statusBreakdown?.Partial > 0 && (
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300">
                {reflection.statusBreakdown.Partial} Partial
              </span>
            )}
            {reflection?.statusBreakdown?.['Advance on Leave'] > 0 && (
              <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-300">
                {reflection.statusBreakdown['Advance on Leave']} Leave Adv
              </span>
            )}
          </div>
        </div>

        {/* Entries Table */}
        {entries.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Coins className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600">No daily muster logs yet for this employee</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Wage amounts shown in the table are currently from baseline registration records.
            </p>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-xl overflow-hidden max-h-80 overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 sticky top-0 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
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
              <tbody className="divide-y divide-slate-150">
                {entries.map((item) => {
                  const isLeave = item.attendance === 'Absent / On Leave';
                  const effectiveStatus = item.status || (isLeave ? 'Advance on Leave' : item.advance > 0 ? (item.balance > 0 ? 'Partial' : 'Paid') : 'Pending');

                  return (
                    <tr key={item.id || item.wageId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{formatDate(item.date)}</div>
                        <span className="font-mono text-[10px] text-emerald-800 font-bold">{item.wageId}</span>
                      </td>

                      <td className="py-2.5 px-3 max-w-[180px]">
                        <span className="truncate block font-medium text-slate-700" title={item.projectName}>
                          {item.projectName}
                        </span>
                        {item.notes && (
                          <span className="text-[10px] text-slate-400 truncate block">{item.notes}</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                          item.attendance === 'Present'
                            ? 'bg-emerald-50 text-emerald-800'
                            : item.attendance === 'Half Day'
                            ? 'bg-blue-50 text-blue-800'
                            : 'bg-amber-50 text-amber-900 border border-amber-200'
                        }`}>
                          {item.attendance}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap text-slate-900">
                        {formatIndianCurrency(item.wages || 0)}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                        {(item.advance || 0) > 0 ? (
                          <span className="text-amber-800 font-bold">{formatIndianCurrency(item.advance)}</span>
                        ) : (
                          <span className="text-slate-400">₹0</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                        {(item.balance || 0) < 0 ? (
                          <span className="text-rose-700">-{formatIndianCurrency(Math.abs(item.balance))}</span>
                        ) : (
                          <span className="text-emerald-800">{formatIndianCurrency(item.balance || 0)}</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          effectiveStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : effectiveStatus === 'Pending'
                            ? 'bg-amber-100 text-amber-900'
                            : effectiveStatus === 'Partial'
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-purple-100 text-purple-900'
                        }`}>
                          {effectiveStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={() => generateWageSlipPDF(employee.name, entries, { employeeId: employee.employeeId, role: employee.role })}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-xs font-bold text-white shadow-xs transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Download PDF Wage Slip
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
          >
            Close Muster Ledger
          </button>
        </div>
      </div>
    </Modal>
  );
}
