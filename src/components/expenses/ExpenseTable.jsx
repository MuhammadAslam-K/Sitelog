import React, { useState, useMemo } from 'react';
import { 
  Edit3, 
  Trash2, 
  Truck, 
  Package, 
  Fuel, 
  Utensils, 
  MoreHorizontal,
  Building2,
  Calendar,
  UserCheck,
  Scale
} from 'lucide-react';
import { TablePagination } from '../common/TablePagination.jsx';
import { formatIndianCurrency, formatDate } from '../../utils/formatters.js';
import { EXPENSE_CATEGORIES } from '../../utils/constants.js';

export function ExpenseTable({
  expenses = [],
  onEditExpense,
  onDeleteExpense
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.max(1, Math.ceil(expenses.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedExpenses = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return expenses.slice(start, start + pageSize);
  }, [expenses, safeCurrentPage, pageSize]);
  const getCategoryBadge = (categoryKey) => {
    const cat = EXPENSE_CATEGORIES.find((c) => c.id === categoryKey) || {
      label: categoryKey,
      badgeClass: 'bg-slate-100 text-[#172B4D] border-[#E2E8F0]'
    };

    let icon = <MoreHorizontal className="w-3.5 h-3.5" />;
    if (categoryKey === 'vehicle') icon = <Truck className="w-3.5 h-3.5" />;
    else if (categoryKey === 'material') icon = <Package className="w-3.5 h-3.5" />;
    else if (categoryKey === 'fuel') icon = <Fuel className="w-3.5 h-3.5" />;
    else if (categoryKey === 'food') icon = <Utensils className="w-3.5 h-3.5" />;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cat.badgeClass || 'bg-slate-100 text-[#172B4D] border-[#E2E8F0]'}`}>
        {icon}
        <span className="capitalize">{cat.label || categoryKey}</span>
      </span>
    );
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center">
        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <MoreHorizontal className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-[#172B4D]">No Expenses Found</h4>
        <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1">
          No expense entries match your current search and filter criteria. Adjust your filters or create a new daily expense.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#64748B] font-semibold uppercase tracking-wider text-[11px]">
            <th className="py-3 px-4">ID</th>
            <th className="py-3 px-4">Date</th>
            <th className="py-3 px-4">Project</th>
            <th className="py-3 px-4">Category</th>
            <th className="py-3 px-4">Expense Item</th>
            <th className="py-3 px-4">Quantity</th>
            <th className="py-3 px-4">Agent / Vendor</th>
            <th className="py-3 px-4 text-right">Amount (₹)</th>
            <th className="py-3 px-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0]">
          {paginatedExpenses.map((expense) => (
            <tr
              key={expense.expenseId || expense.id}
              className="hover:bg-slate-50/80 transition-colors group"
            >
              {/* ID */}
              <td className="py-3 px-4 whitespace-nowrap">
                <span className="font-mono font-bold text-[#0F8B78] bg-[#0F8B78]/10 px-2 py-0.5 rounded border border-[#0F8B78]/25">
                  {expense.expenseId}
                </span>
              </td>

              {/* Date */}
              <td className="py-3 px-4 whitespace-nowrap">
                <div className="flex items-center gap-1.5 text-[#172B4D] font-medium font-mono text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDate(expense.date)}</span>
                </div>
              </td>

              {/* Project */}
              <td className="py-3 px-4 max-w-[200px]">
                <div className="flex items-center gap-1.5 truncate">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium text-[#172B4D] truncate" title={expense.projectName}>
                    {expense.projectName || expense.projectId}
                  </span>
                </div>
                {expense.projectId && expense.projectId !== 'GENERAL' && (
                  <span className="text-[10px] text-[#64748B] font-mono block pl-5">
                    {expense.projectId}
                  </span>
                )}
              </td>

              {/* Category */}
              <td className="py-3 px-4 whitespace-nowrap">
                {getCategoryBadge(expense.category)}
              </td>

              {/* Item */}
              <td className="py-3 px-4 max-w-[240px]">
                <div className="font-semibold text-[#172B4D] line-clamp-1" title={expense.item}>
                  {expense.item}
                </div>
                {expense.notes && (
                  <div className="text-[11px] text-[#64748B] line-clamp-1 mt-0.5 italic" title={expense.notes}>
                    {expense.notes}
                  </div>
                )}
              </td>

              {/* Quantity (Optional) */}
              <td className="py-3 px-4 whitespace-nowrap">
                {expense.quantity ? (
                  <span className="inline-flex items-center gap-1 text-[#172B4D] bg-slate-50 px-2 py-0.5 rounded border border-[#E2E8F0]">
                    <Scale className="w-3 h-3 text-slate-400" />
                    {expense.quantity}
                  </span>
                ) : (
                  <span className="text-slate-300">-</span>
                )}
              </td>

              {/* Agent / Vendor (Optional) */}
              <td className="py-3 px-4 whitespace-nowrap">
                {expense.agent ? (
                  <span className="inline-flex items-center gap-1 text-[#172B4D] bg-slate-50 px-2 py-0.5 rounded border border-[#E2E8F0] font-medium">
                    <UserCheck className="w-3 h-3 text-slate-400" />
                    {expense.agent}
                  </span>
                ) : (
                  <span className="text-slate-300">-</span>
                )}
              </td>

              {/* Amount */}
              <td className="py-3 px-4 text-right whitespace-nowrap">
                <span className="text-sm font-extrabold text-[#172B4D] font-mono tabular-nums">
                  {formatIndianCurrency(Number(expense.amount) || 0)}
                </span>
              </td>

              {/* Actions */}
              <td className="py-3 px-4 whitespace-nowrap text-center">
                <div className="flex items-center justify-center gap-1">
                  {onEditExpense && (
                    <button
                      onClick={() => onEditExpense(expense)}
                      className="p-1.5 text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit expense"
                      aria-label="Edit expense"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onDeleteExpense && (
                    <button
                      onClick={() => onDeleteExpense(expense)}
                      className="p-1.5 text-[#64748B] hover:text-[#DC5353] hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete expense"
                      aria-label="Delete expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-slate-50 font-bold border-t border-[#E2E8F0]">
          <tr>
            <td colSpan={7} className="py-3 px-4 text-right text-[#64748B] uppercase tracking-wider text-[11px]">
              Total Overall Expenses ({expenses.length} Records):
            </td>
            <td className="py-3 px-4 text-right text-sm font-extrabold text-[#0F8B78] font-mono tabular-nums">
              {formatIndianCurrency(
                expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
              )}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      {/* Table Pagination Component */}
      <TablePagination
        currentPage={safeCurrentPage}
        totalItems={expenses.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[10, 25, 50]}
        itemName="expenses"
      />
    </div>
  );
}
