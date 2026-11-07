import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Edit3, 
  Archive, 
  RotateCcw, 
  Calendar, 
  Building2, 
  Briefcase, 
  IndianRupee, 
  Calculator, 
  Clock, 
  ShieldCheck, 
  Coins, 
  Receipt, 
  Activity, 
  Boxes, 
  Truck, 
  User, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { StatusBadge, TagBadge } from '../common/Badge.jsx';
import { formatIndianCurrency, formatIndianCompact, formatDate } from '../../utils/formatters.js';
import { ExpenseTable } from '../expenses/ExpenseTable.jsx';
import { WageTable } from '../wages/WageTable.jsx';
import { MaterialTable } from '../materials/MaterialTable.jsx';

export function ProjectDetails({
  project,
  wages = [],
  expenses = [],
  materials = [],
  onBack,
  onEdit,
  onArchiveToggle,
  onEditWage,
  onDeleteWage,
  onSettleWage,
  onEditExpense,
  onDeleteExpense,
  onEditMaterial,
  onDeleteMaterial
}) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!project) return null;

  const projectWages = wages.filter((w) => w.projectId === project.projectId);
  const projectExpenses = expenses.filter((e) => e.projectId === project.projectId);
  const projectMaterials = materials.filter((m) => m.projectId === project.projectId);

  const contractVal = Number(project.contractValue) || 0;
  const labourExp = Number(project.totalLabourExpenses) || 0;
  const otherExp = Number(project.otherTotalExpenses) || 0;
  const totalBudget = Number(project.totalBudget) || (labourExp + otherExp);

  const budgetUsagePercent = contractVal > 0 
    ? Math.min(100, Math.round((totalBudget / contractVal) * 100))
    : 0;

  const remainingBalance = Math.max(0, contractVal - totalBudget);

  const tabs = [
    { id: 'overview', label: 'Project Overview', count: null },
    { id: 'wages', label: 'Wage History', count: projectWages.length, icon: Coins },
    { id: 'expenses', label: 'Expense History', count: projectExpenses.length, icon: Receipt },
    { id: 'materials', label: 'Materials Procured', count: projectMaterials.length, icon: Boxes },
    { id: 'progress', label: 'Site Progress', badge: 'Phase 4', icon: Activity },
    { id: 'machinery', label: 'Machinery Usage', badge: 'Phase 6', icon: Truck }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back navigation button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#172B4D] hover:text-[#0F8B78] transition-colors bg-white px-3 py-1.5 rounded-lg border border-[#E2E8F0] shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects List
        </button>
      </div>

      {/* Project Header Banner */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-xs font-bold px-3 py-1 rounded-lg bg-[#0F8B78]/10 text-[#0F8B78] border border-[#0F8B78]/30">
                {project.projectId}
              </span>
              <StatusBadge status={project.status} isArchived={project.isArchived} />
              <TagBadge text={project.localBody} variant="slate" />
              <TagBadge text={project.workType} variant="teal" />
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-[#172B4D] tracking-tight">
              {project.projectName}
            </h1>

            <p className="text-xs text-[#64748B] flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Commencement: <strong className="text-[#172B4D]">{formatDate(project.startDate)}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Recorded by: <span className="text-[#172B4D]">{project.createdBy || 'Field Engineer'}</span>
              </span>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onEdit(project)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#172B4D] bg-white hover:bg-slate-50 border border-[#E2E8F0] transition-colors shadow-2xs"
            >
              <Edit3 className="w-4 h-4 text-[#2563EB]" />
              Edit Project
            </button>

            <button
              onClick={() => onArchiveToggle(project)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors shadow-2xs ${
                project.isArchived
                  ? 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                  : 'bg-rose-50 text-[#DC5353] hover:bg-rose-100 border border-rose-200'
              }`}
            >
              {project.isArchived ? (
                <>
                  <RotateCcw className="w-4 h-4" />
                  Restore Project
                </>
              ) : (
                <>
                  <Archive className="w-4 h-4" />
                  Archive Project
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-1 overflow-x-auto border-t border-[#E2E8F0] mt-6 pt-3 -mb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#0F8B78] text-white shadow-2xs'
                  : 'text-[#64748B] hover:text-[#172B4D] hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                  activeTab === tab.id ? 'bg-[#172B4D] text-[#2DD4BF]' : 'bg-slate-200 text-[#64748B]'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Project Overview (Functional Phase 1) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Financial Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                Contract Value
              </span>
              <p className="text-xl sm:text-2xl font-black text-[#172B4D] mt-1 font-mono tabular-nums">
                {formatIndianCurrency(contractVal)}
              </p>
              <p className="text-[11px] text-[#64748B] mt-1 font-medium">
                {formatIndianCompact(contractVal)} Awarded Tender Value
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                Total Budget (Expenses)
              </span>
              <p className="text-xl sm:text-2xl font-black text-[#172B4D] mt-1 font-mono tabular-nums">
                {formatIndianCurrency(totalBudget)}
              </p>
              <p className="text-[11px] text-[#64748B] mt-1 font-medium">
                {formatIndianCompact(totalBudget)} (Labour + Other)
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                Total Labour Expenses
              </span>
              <p className="text-xl sm:text-2xl font-black text-[#0F8B78] mt-1 font-mono tabular-nums">
                {formatIndianCurrency(labourExp)}
              </p>
              <p className="text-[11px] text-[#64748B] mt-1 font-medium">
                {contractVal > 0 ? `${Math.round((labourExp / contractVal) * 100)}% of Contract` : '0%'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                Other Total Expenses
              </span>
              <p className="text-xl sm:text-2xl font-black text-amber-700 mt-1 font-mono tabular-nums">
                {formatIndianCurrency(otherExp)}
              </p>
              <p className="text-[11px] text-[#64748B] mt-1 font-medium">
                {contractVal > 0 ? `${Math.round((otherExp / contractVal) * 100)}% of Contract` : '0%'}
              </p>
            </div>
          </div>

          {/* Budget Utilization & Contract Margin Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-[#172B4D]">
                    Budget Utilization & Consumption
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Total Budget = Other Total Exp ({formatIndianCurrency(otherExp)}) + Total Labour Exp ({formatIndianCurrency(labourExp)})
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 text-[#172B4D]">
                  {budgetUsagePercent}% Utilized
                </span>
              </div>

              {/* Multi-tier bar */}
              <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden flex mb-3">
                <div 
                  className="bg-[#0F8B78] h-full" 
                  style={{ width: `${Math.min(100, (labourExp / (contractVal || 1)) * 100)}%` }} 
                  title={`Labour: ${formatIndianCurrency(labourExp)}`}
                />
                <div 
                  className="bg-[#F4B740] h-full" 
                  style={{ width: `${Math.min(100, (otherExp / (contractVal || 1)) * 100)}%` }} 
                  title={`Other: ${formatIndianCurrency(otherExp)}`}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-[#64748B] font-medium font-mono tabular-nums">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0F8B78]"></span>
                  Labour: {formatIndianCurrency(labourExp)}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F4B740]"></span>
                  Other: {formatIndianCurrency(otherExp)}
                </span>
                <span className="font-bold text-[#172B4D]">
                  Total Budget: {formatIndianCurrency(totalBudget)}
                </span>
              </div>

              {/* Financial Health Summary */}
              <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#64748B]">
                    Remaining Contract Value Balance
                  </p>
                  <p className="text-lg font-bold text-[#172B4D] font-mono tabular-nums mt-0.5">
                    {formatIndianCurrency(remainingBalance)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-[#0F8B78] bg-[#0F8B78]/10 border border-[#0F8B78]/25 px-2.5 py-1 rounded-full">
                    {Math.max(0, 100 - budgetUsagePercent)}% Remaining
                  </span>
                </div>
              </div>
            </div>

            {/* Specifications Card */}
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-[#172B4D] border-b border-[#E2E8F0] pb-2">
                Contract Specifications
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[#64748B] font-medium block">Governing Local Body</span>
                  <span className="text-[#172B4D] font-bold text-sm">{project.localBody}</span>
                </div>

                <div>
                  <span className="text-[#64748B] font-medium block">Roadwork Classification</span>
                  <span className="text-[#172B4D] font-bold text-sm">{project.workType}</span>
                </div>

                <div>
                  <span className="text-[#64748B] font-medium block">Start Date</span>
                  <span className="text-[#172B4D] font-semibold">{formatDate(project.startDate)}</span>
                </div>

                <div>
                  <span className="text-[#64748B] font-medium block">Operational Status</span>
                  <div className="mt-1">
                    <StatusBadge status={project.status} isArchived={project.isArchived} />
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E2E8F0]">
                  <span className="text-[#64748B] font-medium block">Database Metadata</span>
                  <p className="text-[11px] text-[#64748B] font-mono mt-0.5">
                    Created: {formatDate(project.createdAt)}
                  </p>
                  {project.updatedAt && (
                    <p className="text-[11px] text-[#64748B] font-mono">
                      Last Update: {formatDate(project.updatedAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Wages History */}
      {activeTab === 'wages' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#172B4D]">Muster Roll & Wage History for {project.projectId}</h3>
              <p className="text-xs text-[#64748B]">All daily wages and attendance records logged under this project.</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#64748B] block">Total Project Wages:</span>
              <span className="text-base font-extrabold text-[#0F8B78] font-mono tabular-nums">
                {formatIndianCurrency(projectWages.reduce((sum, w) => sum + (Number(w.wages) || 0), 0))}
              </span>
            </div>
          </div>
          <WageTable
            wages={projectWages}
            onEditWage={onEditWage}
            onDeleteWage={onDeleteWage}
            onSettleWage={onSettleWage}
          />
        </div>
      )}

      {/* Tab: Expenses History */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#172B4D]">Site Expenses History for {project.projectId}</h3>
              <p className="text-xs text-[#64748B]">All vehicle, material, fuel, food and site expenditures recorded under this project.</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#64748B] block">Total Site Expenses:</span>
              <span className="text-base font-extrabold text-[#0F8B78] font-mono tabular-nums">
                {formatIndianCurrency(projectExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0))}
              </span>
            </div>
          </div>
          <ExpenseTable
            expenses={projectExpenses}
            onEditExpense={onEditExpense}
            onDeleteExpense={onDeleteExpense}
          />
        </div>
      )}

      {/* Tab 4: Materials Tab */}
      {activeTab === 'materials' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#E2E8F0]">
            <div>
              <h3 className="text-sm font-bold text-[#172B4D]">Materials Inflow for {project.projectId}</h3>
              <p className="text-xs text-[#64748B]">All bitumen, aggregates, sand, cement, and quarry deliveries allocated to this road project.</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#64748B] block">Total Materials Value:</span>
              <span className="text-base font-extrabold text-amber-700 font-mono tabular-nums">
                {formatIndianCurrency(projectMaterials.reduce((sum, m) => sum + (Number(m.amount) || 0), 0))}
              </span>
            </div>
          </div>
          <MaterialTable
            materials={projectMaterials}
            onEditMaterial={onEditMaterial}
            onDeleteMaterial={onDeleteMaterial}
          />
        </div>
      )}

      {/* Tabs 5-6: Coming Soon Sections (Progress, Machinery) */}
      {activeTab !== 'overview' && activeTab !== 'wages' && activeTab !== 'expenses' && activeTab !== 'materials' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 sm:p-12 text-center max-w-3xl mx-auto shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-[#0F8B78]/10 text-[#0F8B78] border border-[#0F8B78]/25 mx-auto flex items-center justify-center mb-5">
            <Clock className="w-8 h-8" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full bg-[#0F8B78]/15 text-[#0F8B78] text-xs font-bold uppercase tracking-wider mb-2">
            Coming Soon • {tabs.find((t) => t.id === activeTab)?.badge}
          </span>

          <h3 className="text-xl sm:text-2xl font-black text-[#172B4D] tracking-tight">
            {tabs.find((t) => t.id === activeTab)?.label}
          </h3>

          <p className="text-xs sm:text-sm text-[#64748B] max-w-lg mx-auto mt-2 leading-relaxed">
            This module is scheduled for implementation in upcoming phases. No mock or fake records are generated to ensure database fidelity.
          </p>

          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-[#E2E8F0] text-left max-w-md mx-auto text-xs text-[#64748B]">
            <p className="font-semibold text-[#172B4D] flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4 text-[#0F8B78]" />
              Future Integration Guarantee
            </p>
            <p>
              When this module is deployed, all records will be automatically associated with Project ID:{' '}
              <strong className="font-mono text-[#0F8B78]">{project.projectId}</strong> without altering the project data structure.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
