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
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-800 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects List
        </button>
      </div>

      {/* Project Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-xs font-bold px-3 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300">
                {project.projectId}
              </span>
              <StatusBadge status={project.status} isArchived={project.isArchived} />
              <TagBadge text={project.localBody} variant="slate" />
              <TagBadge text={project.workType} variant="green" />
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {project.projectName}
            </h1>

            <p className="text-xs text-slate-500 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Commencement: <strong className="text-slate-700">{formatDate(project.startDate)}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Recorded by: <span className="text-slate-700">{project.createdBy || 'Field Engineer'}</span>
              </span>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onEdit(project)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-colors shadow-2xs"
            >
              <Edit3 className="w-4 h-4 text-blue-600" />
              Edit Project
            </button>

            <button
              onClick={() => onArchiveToggle(project)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors shadow-2xs ${
                project.isArchived
                  ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
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
        <div className="flex items-center gap-1 overflow-x-auto border-t border-slate-150 mt-6 pt-3 -mb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                  activeTab === tab.id ? 'bg-emerald-950 text-amber-300' : 'bg-slate-200 text-slate-600'
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
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Contract Value
              </span>
              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-mono">
                {formatIndianCurrency(contractVal)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                {formatIndianCompact(contractVal)} Awarded Tender Value
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Budget (Expenses)
              </span>
              <p className="text-xl sm:text-2xl font-black text-emerald-900 mt-1 font-mono">
                {formatIndianCurrency(totalBudget)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                {formatIndianCompact(totalBudget)} (Labour + Other)
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Labour Expenses
              </span>
              <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 font-mono">
                {formatIndianCurrency(labourExp)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                {contractVal > 0 ? `${Math.round((labourExp / contractVal) * 100)}% of Contract` : '0%'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Other Total Expenses
              </span>
              <p className="text-xl sm:text-2xl font-black text-amber-700 mt-1 font-mono">
                {formatIndianCurrency(otherExp)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                {contractVal > 0 ? `${Math.round((otherExp / contractVal) * 100)}% of Contract` : '0%'}
              </p>
            </div>
          </div>

          {/* Budget Utilization & Contract Margin Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Budget Utilization & Consumption
                  </h3>
                  <p className="text-xs text-slate-500">
                    Total Budget = Other Total Exp ({formatIndianCurrency(otherExp)}) + Total Labour Exp ({formatIndianCurrency(labourExp)})
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800">
                  {budgetUsagePercent}% Utilized
                </span>
              </div>

              {/* Multi-tier bar */}
              <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden flex mb-3">
                <div 
                  className="bg-emerald-600 h-full" 
                  style={{ width: `${Math.min(100, (labourExp / (contractVal || 1)) * 100)}%` }} 
                  title={`Labour: ${formatIndianCurrency(labourExp)}`}
                />
                <div 
                  className="bg-amber-500 h-full" 
                  style={{ width: `${Math.min(100, (otherExp / (contractVal || 1)) * 100)}%` }} 
                  title={`Other: ${formatIndianCurrency(otherExp)}`}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  Labour: {formatIndianCurrency(labourExp)}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Other: {formatIndianCurrency(otherExp)}
                </span>
                <span className="font-bold text-slate-800">
                  Total Budget: {formatIndianCurrency(totalBudget)}
                </span>
              </div>

              {/* Financial Health Summary */}
              <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-600">
                    Remaining Contract Value Balance
                  </p>
                  <p className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                    {formatIndianCurrency(remainingBalance)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    {Math.max(0, 100 - budgetUsagePercent)}% Remaining
                  </span>
                </div>
              </div>
            </div>

            {/* Specifications Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-150 pb-2">
                Contract Specifications
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Governing Local Body</span>
                  <span className="text-slate-800 font-bold text-sm">{project.localBody}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block">Roadwork Classification</span>
                  <span className="text-slate-800 font-bold text-sm">{project.workType}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block">Start Date</span>
                  <span className="text-slate-800 font-semibold">{formatDate(project.startDate)}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block">Operational Status</span>
                  <div className="mt-1">
                    <StatusBadge status={project.status} isArchived={project.isArchived} />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-150">
                  <span className="text-slate-400 font-medium block">Database Metadata</span>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Created: {formatDate(project.createdAt)}
                  </p>
                  {project.updatedAt && (
                    <p className="text-[11px] text-slate-500 font-mono">
                      Last Update: {formatDate(project.updatedAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Wages History (Phase 2 live integration) */}
      {activeTab === 'wages' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Muster Roll & Wage History for {project.projectId}</h3>
              <p className="text-xs text-slate-500">All daily wages and attendance records logged under this project.</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Total Project Wages:</span>
              <span className="text-base font-extrabold text-emerald-900 font-mono">
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

      {/* Tab: Expenses History (Phase 3 live integration) */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Site Expenses History for {project.projectId}</h3>
              <p className="text-xs text-slate-500">All vehicle, material, fuel, food and site expenditures recorded under this project.</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Total Site Expenses:</span>
              <span className="text-base font-extrabold text-emerald-900 font-mono">
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

      {/* Tab 4: Materials Tab (Phase 5 Active) */}
      {activeTab === 'materials' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Materials Inflow for {project.projectId}</h3>
              <p className="text-xs text-slate-500">All bitumen, aggregates, sand, cement, and quarry deliveries allocated to this road project.</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Total Materials Value:</span>
              <span className="text-base font-extrabold text-amber-900 font-mono">
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
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-3xl mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-150 mx-auto flex items-center justify-center mb-5">
            <Clock className="w-8 h-8" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            Coming Soon • {tabs.find((t) => t.id === activeTab)?.badge}
          </span>

          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {tabs.find((t) => t.id === activeTab)?.label}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mt-2 leading-relaxed">
            This module is scheduled for implementation in upcoming phases. No mock or fake records are generated to ensure database fidelity.
          </p>

          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left max-w-md mx-auto text-xs text-slate-600">
            <p className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Future Integration Guarantee
            </p>
            <p>
              When this module is deployed, all records will be automatically associated with Project ID:{' '}
              <strong className="font-mono text-emerald-800">{project.projectId}</strong> without altering the project data structure.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
