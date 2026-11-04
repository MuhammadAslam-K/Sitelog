import React, { useState, useMemo } from 'react';
import { 
  Boxes, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Building2, 
  UserCheck, 
  IndianRupee, 
  Sparkles, 
  Download, 
  RotateCcw,
  Truck,
  Scale,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { MaterialTable } from './MaterialTable.jsx';
import { formatIndianCurrency, formatIndianCompact } from '../../utils/formatters.js';

export function DailyMaterialsList({
  materials = [],
  projects = [],
  isLoading = false,
  onAddNewMaterial,
  onEditMaterial,
  onDeleteMaterial,
  onSeedMaterials
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('ALL');
  const [selectedAgent, setSelectedAgent] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Extract distinct suppliers/agents for filter dropdown
  const uniqueAgents = useMemo(() => {
    const set = new Set();
    materials.forEach((m) => {
      if (m.agent && m.agent.trim()) set.add(m.agent.trim());
    });
    return Array.from(set).sort();
  }, [materials]);

  // Active Projects list for dropdown
  const activeProjects = useMemo(() => {
    return projects.filter((p) => !p.isArchived);
  }, [projects]);

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return materials.filter((mat) => {
      // Search query (item, agent, vehicle, challan, ID)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matches =
          (mat.item && mat.item.toLowerCase().includes(query)) ||
          (mat.agent && mat.agent.toLowerCase().includes(query)) ||
          (mat.materialId && mat.materialId.toLowerCase().includes(query)) ||
          (mat.projectName && mat.projectName.toLowerCase().includes(query)) ||
          (mat.vehicleNumber && mat.vehicleNumber.toLowerCase().includes(query)) ||
          (mat.challanNo && mat.challanNo.toLowerCase().includes(query));
        if (!matches) return false;
      }

      // Project filter
      if (selectedProjectId !== 'ALL') {
        if (mat.projectId !== selectedProjectId) return false;
      }

      // Agent filter
      if (selectedAgent !== 'ALL') {
        if (mat.agent !== selectedAgent) return false;
      }

      // Date Range filter
      if (fromDate) {
        if (mat.date < fromDate) return false;
      }
      if (toDate) {
        if (mat.date > toDate) return false;
      }

      return true;
    });
  }, [materials, searchQuery, selectedProjectId, selectedAgent, fromDate, toDate]);

  // KPI Calculations
  const totalAmount = useMemo(() => {
    return filteredMaterials.reduce((acc, m) => acc + (Number(m.amount) || 0), 0);
  }, [filteredMaterials]);

  const uniqueProjectsSupplied = useMemo(() => {
    const set = new Set(filteredMaterials.map((m) => m.projectId).filter(Boolean));
    return set.size;
  }, [filteredMaterials]);

  const uniqueSuppliersCount = useMemo(() => {
    const set = new Set(filteredMaterials.map((m) => m.agent).filter(Boolean));
    return set.size;
  }, [filteredMaterials]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedProjectId('ALL');
    setSelectedAgent('ALL');
    setFromDate('');
    setToDate('');
  };

  const hasActiveFilters = searchQuery || selectedProjectId !== 'ALL' || selectedAgent !== 'ALL' || fromDate || toDate;

  // CSV Export
  const handleExportCSV = () => {
    if (filteredMaterials.length === 0) return;

    const headers = ['Material ID', 'Date', 'Project ID', 'Project Name', 'Item', 'Quantity', 'Agent/Supplier', 'Amount (INR)', 'Vehicle No', 'Challan No', 'Status', 'Notes'];
    const rows = filteredMaterials.map((m) => [
      m.materialId || '',
      m.date || '',
      m.projectId || '',
      `"${(m.projectName || '').replace(/"/g, '""')}"`,
      `"${(m.item || '').replace(/"/g, '""')}"`,
      `"${(m.quantity || '').replace(/"/g, '""')}"`,
      `"${(m.agent || '').replace(/"/g, '""')}"`,
      m.amount || 0,
      m.vehicleNumber || '',
      m.challanNo || '',
      m.status || '',
      `"${(m.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kerala_road_materials_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
              Phase 5
            </span>
            <span className="text-xs text-slate-500 font-medium">Supply Chain & Site Procurement</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-7 h-7 text-emerald-700" />
            <span>Materials Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track site raw materials, bitumen bulk supply, aggregates, sand, cement, vendor agents, and delivery challans.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {materials.length === 0 && onSeedMaterials && (
            <button
              onClick={onSeedMaterials}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Seed Kerala Materials</span>
            </button>
          )}

          {materials.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-xs"
              title="Export filtered records as CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Export CSV</span>
            </button>
          )}

          <button
            onClick={onAddNewMaterial}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all shadow-xs hover:shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Record Material</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Material Spend */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Total Materials Value</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 tracking-tight font-mono">
            {formatIndianCurrency(totalAmount)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {formatIndianCompact(totalAmount)} across {filteredMaterials.length} entries
          </p>
        </div>

        {/* Total Deliveries */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Material Inflows</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 tracking-tight font-mono">
            {filteredMaterials.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Total delivery loads & consignments
          </p>
        </div>

        {/* Projects Supplied */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Road Sites Supplied</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 tracking-tight font-mono">
            {uniqueProjectsSupplied}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Active highway & road work sites
          </p>
        </div>

        {/* Active Agents / Suppliers */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Suppliers & Crushers</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 tracking-tight font-mono">
            {uniqueSuppliersCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Quarries, bitumen dealers & vendors
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search item, agent, vehicle, challan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {/* Project Filter */}
          <div className="relative">
            <Building2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all truncate"
            >
              <option value="ALL">All Projects</option>
              {activeProjects.map((p) => (
                <option key={p.projectId} value={p.projectId}>
                  {p.projectId} - {p.projectName}
                </option>
              ))}
            </select>
          </div>

          {/* Supplier/Agent Filter */}
          <div className="relative">
            <UserCheck className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all truncate"
            >
              <option value="ALL">All Suppliers / Agents</option>
              {uniqueAgents.map((agt) => (
                <option key={agt} value={agt}>{agt}</option>
              ))}
            </select>
          </div>

          {/* Date Range Inputs */}
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              title="From Date"
              className="w-1/2 px-2 py-2 text-[11px] rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-emerald-600"
            />
            <span className="text-slate-400 text-xs">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              title="To Date"
              className="w-1/2 px-2 py-2 text-[11px] rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Filter status row */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">
              Showing <strong className="text-slate-800">{filteredMaterials.length}</strong> of {materials.length} records
            </span>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-800"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Materials Table */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading materials inventory...</p>
        </div>
      ) : (
        <MaterialTable
          materials={filteredMaterials}
          onEditMaterial={onEditMaterial}
          onDeleteMaterial={onDeleteMaterial}
        />
      )}
    </div>
  );
}
