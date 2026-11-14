import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Reusable Enterprise ERP Table Pagination Component
 * 
 * @param {Object} props
 * @param {number} props.currentPage - 1-based current active page
 * @param {number} props.totalItems - Total count of items across all pages
 * @param {number} props.pageSize - Number of items shown per page (default: 10)
 * @param {Function} props.onPageChange - Callback when a page is clicked: (page) => void
 * @param {Function} [props.onPageSizeChange] - Optional callback when page size changes: (size) => void
 * @param {number[]} [props.pageSizeOptions] - Available page sizes (e.g. [10, 25, 50])
 * @param {string} [props.itemName] - Entity name in plural for label, e.g. 'records', 'projects'
 */
export function TablePagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  itemName = 'entries'
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endItem = Math.min(safeCurrentPage * pageSize, totalItems);

  // Generate page numbers to display with smart ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (safeCurrentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }

    if (safeCurrentPage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, '...', totalPages];
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="px-4 py-3 bg-slate-50 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
      {/* Left: Summary and Page Size Selector */}
      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <span>
          Showing <strong className="text-[#172B4D] font-bold font-mono">{startItem}</strong> to{' '}
          <strong className="text-[#172B4D] font-bold font-mono">{endItem}</strong> of{' '}
          <strong className="text-[#172B4D] font-bold font-mono">{totalItems}</strong> {itemName}
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-slate-400">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-white border border-[#E2E8F0] text-[#172B4D] rounded-lg px-2 py-1 text-xs font-semibold focus:outline-hidden focus:border-[#0F8B78] cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / page
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Pagination Controls */}
      <div className="flex items-center gap-1 self-center sm:self-auto">
        {/* First Page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={safeCurrentPage <= 1}
          className="p-1.5 rounded-lg border border-[#E2E8F0] bg-white text-[#172B4D] hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="First Page"
          aria-label="First Page"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage <= 1}
          className="p-1.5 rounded-lg border border-[#E2E8F0] bg-white text-[#172B4D] hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Previous Page"
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Numeric Page Buttons */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-1.5 py-1 text-slate-400 select-none text-xs">
                  ...
                </span>
              );
            }

            const isCurrent = p === safeCurrentPage;
            return (
              <button
                key={`page-${p}`}
                type="button"
                onClick={() => onPageChange(p)}
                className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-bold font-mono transition-colors ${
                  isCurrent
                    ? 'bg-[#0F8B78] text-white shadow-2xs'
                    : 'bg-white text-[#172B4D] border border-[#E2E8F0] hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage >= totalPages}
          className="p-1.5 rounded-lg border border-[#E2E8F0] bg-white text-[#172B4D] hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Next Page"
          aria-label="Next Page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={safeCurrentPage >= totalPages}
          className="p-1.5 rounded-lg border border-[#E2E8F0] bg-white text-[#172B4D] hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Last Page"
          aria-label="Last Page"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
