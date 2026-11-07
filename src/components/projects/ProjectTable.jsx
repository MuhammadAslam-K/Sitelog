import React from 'react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  Edit3, 
  Archive, 
  RotateCcw,
  Building2,
  FolderOpen
} from 'lucide-react';
import { StatusBadge, TagBadge } from '../common/Badge.jsx';
import { formatIndianCurrency, formatDate } from '../../utils/formatters.js';

export function ProjectTable({
  projects = [],
  sortConfig = { key: 'createdAt', direction: 'desc' },
  onSort,
  onViewProject,
  onEditProject,
  onArchiveProject,
  searchQuery = '',
  onClearFilters
}) {
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
    { key: 'projectId', label: '1. Project ID', align: 'left', sortable: true },
    { key: 'projectName', label: '2. Project Name', align: 'left', sortable: true },
    { key: 'localBody', label: '3. Local Body', align: 'left', sortable: true },
    { key: 'workType', label: '4. Work Type', align: 'left', sortable: true },
    { key: 'startDate', label: '5. Start Date', align: 'left', sortable: true },
    { key: 'contractValue', label: '6. Contract Value (₹)', align: 'right', sortable: true },
    { key: 'status', label: '7. Status', align: 'center', sortable: true },
    { key: 'otherTotalExpenses', label: '8. Other Total Exp (₹)', align: 'right', sortable: true },
    { key: 'totalLabourExpenses', label: '9. Total Labour Exp (₹)', align: 'right', sortable: true },
    { key: 'totalBudget', label: '10. Total Budget (₹)', align: 'right', sortable: true },
    { key: 'actions', label: 'Actions', align: 'center', sortable: false }
  ];

  if (projects.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center">
        <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h4 className="text-base font-bold text-[#172B4D]">No matching projects found</h4>
        <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1 mb-5">
          {searchQuery
            ? `No projects matched "${searchQuery}". Try adjusting your keywords or clearing active filters.`
            : 'No construction projects registered under this filter.'}
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

  return (
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
            {projects.map((project) => (
              <tr
                key={project.id || project.projectId}
                onClick={() => onViewProject(project)}
                className={`hover:bg-slate-50/80 transition-colors cursor-pointer group ${
                  project.isArchived ? 'bg-slate-50/60 opacity-75' : ''
                }`}
              >
                {/* 1. Project ID */}
                <td className="py-3.5 px-3.5 whitespace-nowrap font-mono font-bold text-[#0F8B78] group-hover:text-[#0D7A69]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0F8B78]"></span>
                    <span>{project.projectId}</span>
                  </div>
                </td>

                {/* 2. Project Name */}
                <td className="py-3.5 px-3.5 font-semibold text-[#172B4D] max-w-xs">
                  <span className="line-clamp-2" title={project.projectName}>
                    {project.projectName}
                  </span>
                </td>

                {/* 3. Local Body */}
                <td className="py-3.5 px-3.5 text-[#64748B] whitespace-nowrap">
                  <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-[#172B4D] text-[11px] font-medium border border-[#E2E8F0]">
                    {project.localBody}
                  </span>
                </td>

                {/* 4. Work Type */}
                <td className="py-3.5 px-3.5 text-[#64748B] whitespace-nowrap">
                  <TagBadge text={project.workType} variant="teal" />
                </td>

                {/* 5. Start Date */}
                <td className="py-3.5 px-3.5 text-[#64748B] whitespace-nowrap font-mono text-[11px]">
                  {formatDate(project.startDate)}
                </td>

                {/* 6. Contract Value (₹) */}
                <td className="py-3.5 px-3.5 text-right font-mono font-bold text-[#172B4D] tabular-nums whitespace-nowrap">
                  {formatIndianCurrency(project.contractValue)}
                </td>

                {/* 7. Status */}
                <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
                  <StatusBadge status={project.status} isArchived={project.isArchived} />
                </td>

                {/* 8. Other Total Exp (₹) */}
                <td className="py-3.5 px-3.5 text-right font-mono text-[#64748B] tabular-nums whitespace-nowrap">
                  {formatIndianCurrency(project.otherTotalExpenses)}
                </td>

                {/* 9. Total Labour Exp (₹) */}
                <td className="py-3.5 px-3.5 text-right font-mono text-[#64748B] tabular-nums whitespace-nowrap">
                  {formatIndianCurrency(project.totalLabourExpenses)}
                </td>

                {/* 10. Total Budget (₹) */}
                <td className="py-3.5 px-3.5 text-right font-mono font-bold text-[#172B4D] tabular-nums whitespace-nowrap bg-slate-50/50">
                  {formatIndianCurrency(project.totalBudget)}
                </td>

                {/* Actions */}
                <td 
                  className="py-3.5 px-3.5 text-center whitespace-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => onViewProject(project)}
                      title="View Project Details"
                      className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F8B78] hover:bg-[#0F8B78]/10 transition-colors"
                      aria-label="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onEditProject(project)}
                      title="Edit Project"
                      className="p-1.5 rounded-lg text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 transition-colors"
                      aria-label="Edit Project"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onArchiveProject(project)}
                      title={project.isArchived ? 'Restore Project' : 'Archive Project'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        project.isArchived
                          ? 'text-amber-600 hover:text-amber-800 hover:bg-amber-50'
                          : 'text-[#64748B] hover:text-[#DC5353] hover:bg-rose-50'
                      }`}
                      aria-label={project.isArchived ? 'Restore Project' : 'Archive Project'}
                    >
                      {project.isArchived ? (
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

      {/* Table Footer with Summary Count */}
      <div className="px-6 py-3 bg-slate-50 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] gap-2">
        <span>
          Showing <strong className="text-[#172B4D] font-semibold">{projects.length}</strong> project{projects.length === 1 ? '' : 's'} (Formatted in Indian standard numbering system: ₹)
        </span>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#0F8B78]"></span> Ongoing
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Completed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#F4B740]"></span> Pending
          </span>
        </div>
      </div>
    </div>
  );
}
