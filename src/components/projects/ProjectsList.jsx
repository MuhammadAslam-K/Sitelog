import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  RotateCcw, 
  FolderKanban, 
  Building2, 
  CheckCircle2, 
  Clock, 
  Archive,
  Layers
} from 'lucide-react';
import { ProjectTable } from './ProjectTable.jsx';
import { LOCAL_BODIES, WORK_TYPES, PROJECT_STATUSES } from '../../utils/constants.js';

export function ProjectsList({
  projects = [],
  onAddNewProject,
  onViewProject,
  onEditProject,
  onArchiveProject,
  searchQuery = '',
  onSearchChange
}) {
  const [selectedLocalBody, setSelectedLocalBody] = useState('ALL');
  const [selectedWorkType, setSelectedWorkType] = useState('ALL');
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
    setSelectedLocalBody('ALL');
    setSelectedWorkType('ALL');
    setSelectedStatus('ALL');
    setShowArchived(false);
    onSearchChange('');
  };

  const isFilterActive =
    selectedLocalBody !== 'ALL' ||
    selectedWorkType !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    showArchived ||
    searchQuery.trim().length > 0;

  // Filtered and Sorted Projects
  const processedProjects = useMemo(() => {
    return projects
      .filter((project) => {
        // Archive filter
        if (!showArchived && project.isArchived) return false;
        if (showArchived && !project.isArchived) return true; // show both or archived

        // Search by Project ID or Project Name
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesId = project.projectId?.toLowerCase().includes(q);
          const matchesName = project.projectName?.toLowerCase().includes(q);
          if (!matchesId && !matchesName) return false;
        }

        // Local Body filter
        if (selectedLocalBody !== 'ALL') {
          if (selectedLocalBody === 'Other') {
            const isStandard = LOCAL_BODIES.slice(0, -1).includes(project.localBody);
            if (isStandard) return false;
          } else if (project.localBody !== selectedLocalBody) {
            return false;
          }
        }

        // Work Type filter
        if (selectedWorkType !== 'ALL') {
          if (selectedWorkType === 'Other') {
            const isStandard = WORK_TYPES.slice(0, -1).includes(project.workType);
            if (isStandard) return false;
          } else if (project.workType !== selectedWorkType) {
            return false;
          }
        }

        // Status filter
        if (selectedStatus !== 'ALL') {
          if (selectedStatus === 'Pending') {
            if (project.status !== 'Pending' && project.status !== 'On Hold') return false;
          } else if (project.status !== selectedStatus) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';

        // Numeric fields
        if (
          ['contractValue', 'otherTotalExpenses', 'totalLabourExpenses', 'totalBudget'].includes(
            sortConfig.key
          )
        ) {
          const numA = Number(valA) || 0;
          const numB = Number(valB) || 0;
          return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
        }

        // String comparison
        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
  }, [
    projects,
    searchQuery,
    selectedLocalBody,
    selectedWorkType,
    selectedStatus,
    showArchived,
    sortConfig
  ]);

  const activeCount = projects.filter((p) => !p.isArchived).length;
  const archivedCount = projects.filter((p) => p.isArchived).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Phase 1 • Project Management Module
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Construction Projects
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage road tenders, local body contracts, budgets, and sequential PRJ tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onAddNewProject}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-900 shadow-xs hover:shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            Add New Project
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by Project ID (e.g. PRJ-101) or Name..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-emerald-600 focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Archive Toggle Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                showArchived
                  ? 'bg-amber-100/70 text-amber-900 border-amber-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{showArchived ? 'Showing Archived' : `Include Archived (${archivedCount})`}</span>
            </button>

            {isFilterActive && (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-150 text-xs">
          {/* Local Body Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Filter by Local Body
            </label>
            <select
              value={selectedLocalBody}
              onChange={(e) => setSelectedLocalBody(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:border-emerald-600 focus:bg-white focus:outline-hidden"
            >
              <option value="ALL">All Local Bodies ({projects.length})</option>
              {LOCAL_BODIES.map((lb) => (
                <option key={lb} value={lb}>{lb}</option>
              ))}
            </select>
          </div>

          {/* Work Type Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Filter by Work Type
            </label>
            <select
              value={selectedWorkType}
              onChange={(e) => setSelectedWorkType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:border-emerald-600 focus:bg-white focus:outline-hidden"
            >
              <option value="ALL">All Work Types</option>
              {WORK_TYPES.map((wt) => (
                <option key={wt} value={wt}>{wt}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Filter by Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:border-emerald-600 focus:bg-white focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              {PROJECT_STATUSES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Projects Table with exact 10 columns */}
      <ProjectTable
        projects={processedProjects}
        sortConfig={sortConfig}
        onSort={handleSort}
        onViewProject={onViewProject}
        onEditProject={onEditProject}
        onArchiveProject={onArchiveProject}
        searchQuery={searchQuery}
        onClearFilters={isFilterActive ? clearAllFilters : null}
      />
    </div>
  );
}
