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
  Download, 
  RotateCcw,
  Truck,
  Scale,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { MaterialTable } from './MaterialTable.jsx';
import { DateInput } from '../common/DateInput.jsx';
import { formatIndianCurrency, formatIndianCompact, formatDate } from '../../utils/formatters.js';

export function DailyMaterialsList({
  materials = [],
  projects = [],
  isLoading = false,
  onAddNewMaterial,
  onEditMaterial,
  onDeleteMaterial
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
      formatDate(m.date),
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
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#0F8B78]/10 text-[#0F8B78] border border-[#0F8B78]/20">
              Phase 5
            </span>
            <span className="text-xs text-[#64748B] font-medium">Supply Chain & Site Procurement</span>
          </div>
          <h2 className="text-2xl font-black text-[#172B4D] tracking-tight flex items-center gap-2">
            <Boxes className="w-7 h-7 text-[#0F8B78]" />
            <span>Materials Management</span>
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Track site raw materials, bitumen bulk supply, aggregates, sand, cement, vendor agents, and delivery challans.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {materials.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#172B4D] bg-white hover:bg-slate-50 border border-[#E2E8F0] rounded-xl transition-all shadow-2xs"
              title="Export filtered records as CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#0F8B78]" />
              <span>Export CSV</span>
            </button>
          )}

          <button
            onClick={onAddNewMaterial}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#0F8B78] hover:bg-[#0d7867] rounded-xl transition-all shadow-2xs hover:shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Record Material</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Material Spend */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-xs font-semibold text-[#64748B]">Total Materials Value</span>
            <div className="w-7 h-7 rounded-lg bg-[#0F8B78]/10 text-[#0F8B78] flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-[#172B4D] tracking-tight font-mono tabular-nums">
            {formatIndianCurrency(totalAmount)}
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">
            {formatIndianCompact(totalAmount)} across {filteredMaterials.length} entries
          </p>
        </div>

        {/* Total Deliveries */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-xs font-semibold text-[#64748B]">Material Inflows</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-[#172B4D] tracking-tight font-mono tabular-nums">
            {filteredMaterials.length}
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">
            Total delivery loads & consignments
          </p>
        </div>

        {/* Projects Supplied */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-xs font-semibold text-[#64748B]">Road Sites Supplied</span>
            <div className="w-7 h-7 rounded-lg bg-[#F4B740]/15 text-[#b27918] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-[#172B4D] tracking-tight font-mono tabular-nums">
            {uniqueProjectsSupplied}
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">
            Active highway & road work sites
          </p>
        </div>

        {/* Active Agents / Suppliers */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-xs font-semibold text-[#64748B]">Suppliers & Crushers</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-[#172B4D] tracking-tight font-mono tabular-nums">
            {uniqueSuppliersCount}
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">
            Quarries, bitumen dealers & vendors
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search item, agent, vehicle, challan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-slate-50/50 text-[#172B4D] focus:bg-white focus:outline-none focus:border-[#0F8B78] focus:ring-2 focus:ring-[#0F8B78]/20 transition-all"
            />
          </div>

          {/* Project Filter */}
          <div className="relative">
            <Building2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-slate-50/50 text-[#172B4D] focus:bg-white focus:outline-none focus:border-[#0F8B78] focus:ring-2 focus:ring-[#0F8B78]/20 transition-all truncate"
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
            <UserCheck className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-slate-50/50 text-[#172B4D] focus:bg-white focus:outline-none focus:border-[#0F8B78] focus:ring-2 focus:ring-[#0F8B78]/20 transition-all truncate"
            >
              <option value="ALL">All Suppliers / Agents</option>
              {uniqueAgents.map((agt) => (
                <option key={agt} value={agt}>{agt}</option>
              ))}
            </select>
          </div>

          {/* Date Range Inputs */}
          <div className="lg:col-span-2 flex items-center gap-1.5">
            <DateInput
              value={fromDate}
              max={toDate || undefined}
              onChange={(e) => setFromDate(e.target.value)}
              title="From Date"
              wrapperClassName="w-1/2"
              className="w-full px-2 py-2 text-[11px] rounded-xl border border-[#E2E8F0] bg-slate-50/50 text-[#172B4D] peer-focus:bg-white peer-focus:border-[#0F8B78]"
            />
            <span className="text-[#64748B] text-xs">to</span>
            <DateInput
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => setToDate(e.target.value)}
              title="To Date"
              wrapperClassName="w-1/2"
              className="w-full px-2 py-2 text-[11px] rounded-xl border border-[#E2E8F0] bg-slate-50/50 text-[#172B4D] peer-focus:bg-white peer-focus:border-[#0F8B78]"
            />
          </div>
        </div>

        {/* Filter status row */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
            <span className="text-[#64748B] text-[11px]">
              Showing <strong className="text-[#172B4D]">{filteredMaterials.length}</strong> of {materials.length} records
            </span>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#DC5353] hover:text-red-700"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Materials Table */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center">
          <div className="w-8 h-8 border-3 border-[#0F8B78] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#64748B] font-medium">Loading materials inventory...</p>
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
