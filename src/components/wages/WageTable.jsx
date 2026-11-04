import React, { useMemo } from 'react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Coins, 
  CheckCircle,
  FileDown,
  CheckSquare,
  Square,
  Sparkles,
  X
} from 'lucide-react';
import { formatIndianCurrency, formatDate } from '../../utils/formatters.js';

export function WageTable({
  wages = [],
  allWages = [],
  sortConfig = { key: 'date', direction: 'desc' },
  onSort,
  onEditWage,
  onDeleteWage,
  onSettleWage,
  onDownloadSlip,
  searchQuery = '',
  onClearFilters,
  // Multi-select props for picking particular dates directly in table
  selectedWageIds = [],
  onToggleSelectWage,
  onSelectAllWages,
  onClearSelection,
  onCreatePdfForSelected
}) {
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors ml-1" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-emerald-700 ml-1" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-emerald-700 ml-1" />
    );
  };

  const isAllVisibleSelected = wages.length > 0 && wages.every((w) => selectedWageIds.includes(w.id || w.wageId));
  const isSomeVisibleSelected = wages.some((w) => selectedWageIds.includes(w.id || w.wageId)) && !isAllVisibleSelected;

  // Analysis of selected records
  const selectedInfo = useMemo(() => {
    if (selectedWageIds.length === 0) return null;
    const pool = allWages.length > 0 ? allWages : wages;
    const chosen = pool.filter((w) => selectedWageIds.includes(w.id || w.wageId));
    
    // Check if all chosen belong to the same employee
    const uniqueEmployees = Array.from(new Set(chosen.map((c) => c.employeeName || c.employeeId)));
    const singleEmployee = uniqueEmployees.length === 1 ? chosen[0]?.employeeName : null;
    const singleEmployeeId = uniqueEmployees.length === 1 ? chosen[0]?.employeeId : null;

    let totalW = 0;
    let totalAdv = 0;
    let totalBal = 0;
    chosen.forEach((c) => {
      totalW += Number(c.wages) || 0;
      totalAdv += Number(c.advance) || 0;
      totalBal += c.balance !== undefined ? Number(c.balance) : ((Number(c.wages) || 0) - (Number(c.advance) || 0));
    });

    return {
      count: chosen.length,
      singleEmployee,
      singleEmployeeId,
      totalW,
      totalAdv,
      totalBal,
      entries: chosen
    };
  }, [selectedWageIds, allWages, wages]);

  const headers = [
    { key: 'select', label: '', align: 'center', sortable: false, isCheckbox: true },
    { key: 'wageId', label: 'Entry ID', align: 'left', sortable: true },
    { key: 'date', label: 'Date', align: 'left', sortable: true },
    { key: 'employeeName', label: 'Employee Name', align: 'left', sortable: true },
    { key: 'projectName', label: 'Project Name', align: 'left', sortable: true },
    { key: 'attendance', label: 'Attendance (WT)', align: 'center', sortable: true },
    { key: 'wages', label: 'Wages (₹)', align: 'right', sortable: true },
    { key: 'advance', label: 'Advance (₹)', align: 'right', sortable: true },
    { key: 'balance', label: 'Balance (₹)', align: 'right', sortable: true },
    { key: 'status', label: 'Status', align: 'center', sortable: true },
    { key: 'notes', label: 'Notes / Remarks', align: 'left', sortable: false },
    { key: 'actions', label: 'Actions', align: 'center', sortable: false }
  ];

  if (wages.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <Coins className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h4 className="text-base font-bold text-slate-800">No wage or attendance entries found</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
          {searchQuery
            ? `No records matched "${searchQuery}". Try clearing filters or search terms.`
            : 'No daily wage records or muster entries recorded under this filter.'}
        </p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
          >
            Clear All Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Multi-Select Floating Action Bar when rows are selected */}
      {selectedInfo && selectedInfo.count > 0 && (
        <div className="bg-emerald-900 text-white rounded-2xl p-3.5 sm:px-5 sm:py-3 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200 border border-emerald-700">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-emerald-700 font-bold text-xs">
              {selectedInfo.count}
            </span>
            <div className="text-xs leading-tight">
              {selectedInfo.singleEmployee ? (
                <>
                  <p className="font-bold text-sm text-emerald-100">
                    {selectedInfo.count} Particular Date{selectedInfo.count > 1 ? 's' : ''} Selected for {selectedInfo.singleEmployee}
                  </p>
                  <p className="text-emerald-300 text-[11px]">
                    Total Wages: ₹{selectedInfo.totalW} | Adv: ₹{selectedInfo.totalAdv} | Balance: ₹{selectedInfo.totalBal}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-bold text-sm text-emerald-100">
                    {selectedInfo.count} Dates / Shift Records Selected
                  </p>
                  <p className="text-emerald-300 text-[11px]">
                    From multiple employees • Click Create PDF to generate muster slip
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              type="button"
              onClick={onClearSelection}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
            <button
              type="button"
              onClick={() => onCreatePdfForSelected && onCreatePdfForSelected(selectedInfo)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-emerald-950 bg-white hover:bg-emerald-50 shadow-md transition-all cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-emerald-800" />
              <span>
                Create PDF for Selected ({selectedInfo.count} {selectedInfo.count === 1 ? 'Day' : 'Days'})
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider select-none">
                {headers.map((h) => {
                  if (h.isCheckbox) {
                    return (
                      <th key={h.key} className="py-3.5 px-3 text-center w-10">
                        <input
                          type="checkbox"
                          checked={isAllVisibleSelected}
                          ref={(input) => {
                            if (input) input.indeterminate = isSomeVisibleSelected;
                          }}
                          onChange={(e) => onSelectAllWages && onSelectAllWages(e.target.checked)}
                          className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                          title="Select all visible dates"
                        />
                      </th>
                    );
                  }

                  return (
                    <th
                      key={h.key}
                      className={`py-3.5 px-3.5 ${
                        h.align === 'right'
                          ? 'text-right'
                          : h.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      } ${h.sortable ? 'cursor-pointer hover:bg-slate-200/60 transition-colors group' : ''}`}
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
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 text-xs">
              {wages.map((item) => {
                const itemId = item.id || item.wageId;
                const isSelected = selectedWageIds.includes(itemId);
                const isAbsentWithAdvance = item.attendance === 'Absent / On Leave' && item.advance > 0;
                const isNegativeBalance = item.balance < 0;

                // Compute effective status
                const effectiveStatus = item.status || (
                  item.attendance === 'Absent / On Leave'
                    ? (item.advance > 0 ? 'Advance on Leave' : 'Pending')
                    : item.balance <= 0 && item.wages > 0
                    ? 'Paid'
                    : item.advance > 0
                    ? 'Partial'
                    : 'Pending'
                );

                return (
                  <tr
                    key={itemId}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-emerald-50/70 hover:bg-emerald-50'
                        : isAbsentWithAdvance
                        ? 'bg-amber-50/30 hover:bg-amber-50/50'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Row Select Checkbox */}
                    <td className="py-3.5 px-3 text-center w-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectWage && onToggleSelectWage(itemId)}
                        className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                        title={`Select date ${item.date} for ${item.employeeName}`}
                      />
                    </td>

                    {/* Entry ID */}
                    <td className="py-3.5 px-3.5 whitespace-nowrap font-mono font-bold text-emerald-900">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        <span>{item.wageId}</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-3.5 whitespace-nowrap text-slate-700 font-mono text-[11px]">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <strong className="font-semibold">{formatDate(item.date)}</strong>
                      </span>
                    </td>

                    {/* Employee Name */}
                    <td className="py-3.5 px-3.5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{item.employeeName}</span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {item.employeeRole} • {item.employeeId}
                        </span>
                      </div>
                    </td>

                    {/* Project Name */}
                    <td className="py-3.5 px-3.5 max-w-xs">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 line-clamp-1" title={item.projectName}>
                          {item.projectName}
                        </span>
                        {item.projectId && (
                          <span className="font-mono text-[10px] text-emerald-800 font-medium">
                            {item.projectId}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Attendance */}
                    <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
                      {item.attendance === 'Present' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Present
                        </span>
                      ) : item.attendance === 'Half Day' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <Clock className="w-3 h-3 text-blue-600" />
                          Half Day
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          Absent / Leave
                        </span>
                      )}
                    </td>

                    {/* Wages (₹) */}
                    <td className="py-3.5 px-3.5 text-right font-mono font-semibold text-slate-900 whitespace-nowrap">
                      {item.wages > 0 ? (
                        formatIndianCurrency(item.wages)
                      ) : (
                        <span className="text-slate-400 font-normal">₹0 (Leave)</span>
                      )}
                    </td>

                    {/* Advance (₹) */}
                    <td className="py-3.5 px-3.5 text-right font-mono font-bold whitespace-nowrap">
                      {item.advance > 0 ? (
                        <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {formatIndianCurrency(item.advance)}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">₹0</span>
                      )}
                    </td>

                    {/* Balance Amount (₹) */}
                    <td className="py-3.5 px-3.5 text-right font-mono font-bold whitespace-nowrap">
                      {isNegativeBalance ? (
                        <span 
                          className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200"
                          title="Worker was absent but granted advance cash"
                        >
                          -{formatIndianCurrency(Math.abs(item.balance))} (Adv)
                        </span>
                      ) : (
                        <span className="text-emerald-800">
                          {formatIndianCurrency(item.balance)}
                        </span>
                      )}
                    </td>

                    {/* Payment Status (Reflects in Employee Table) */}
                    <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
                      {effectiveStatus === 'Paid' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Paid
                        </span>
                      ) : effectiveStatus === 'Pending' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Pending
                        </span>
                      ) : effectiveStatus === 'Partial' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                          <Coins className="w-3 h-3 text-blue-600" />
                          Partial (Adv)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
                          <AlertCircle className="w-3 h-3 text-purple-600" />
                          Leave Adv
                        </span>
                      )}
                    </td>

                    {/* Notes */}
                    <td className="py-3.5 px-3.5 text-slate-600 text-xs max-w-xs">
                      {isAbsentWithAdvance ? (
                        <span className="text-amber-900 font-medium text-[11px] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          {item.notes || `Given advance of ₹${item.advance} while absent today`}
                        </span>
                      ) : item.notes ? (
                        <span className="line-clamp-1" title={item.notes}>{item.notes}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Quick Settle / Mark Paid Button */}
                        {effectiveStatus !== 'Paid' && onSettleWage && (
                          <button
                            onClick={() => onSettleWage(item)}
                            title="Settle Wage / Mark Paid in Full"
                            className="p-1.5 rounded-lg text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100/80 transition-colors"
                            aria-label="Mark as Paid"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Download Wage Slip PDF / Select Dates for this Employee */}
                        <button
                          onClick={() => {
                            if (onDownloadSlip) {
                              onDownloadSlip(item);
                            }
                          }}
                          title={`Select dates & download Wage Slip PDF for ${item.employeeName}`}
                          className="p-1.5 rounded-lg text-purple-700 hover:text-purple-900 hover:bg-purple-100/80 transition-colors"
                          aria-label="Select dates and download Wage Slip PDF"
                        >
                          <FileDown className="w-4 h-4" />
                        </button>

                        {onEditWage && (
                          <button
                            onClick={() => onEditWage(item)}
                            title="Edit Entry"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-800 hover:bg-blue-100/70 transition-colors"
                            aria-label="Edit Entry"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}

                        {onDeleteWage && (
                          <button
                            onClick={() => onDeleteWage(item)}
                            title="Delete Entry"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-100/70 transition-colors"
                            aria-label="Delete Entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Summaries */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-3">
            <span>
              Total Entries: <strong className="text-slate-800 font-semibold">{wages.length}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600">
              Absent with Advance:{' '}
              <strong className="text-amber-800">
                {wages.filter((w) => w.attendance === 'Absent / On Leave' && w.advance > 0).length}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>
              Total Earned: <strong className="text-slate-900">{formatIndianCurrency(wages.reduce((s, w) => s + (Number(w.wages) || 0), 0))}</strong>
            </span>
            <span>
              Total Advance: <strong className="text-amber-800">{formatIndianCurrency(wages.reduce((s, w) => s + (Number(w.advance) || 0), 0))}</strong>
            </span>
            <span>
              Net Balance: <strong className="text-emerald-800">{formatIndianCurrency(wages.reduce((s, w) => s + (Number(w.balance) || 0), 0))}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
