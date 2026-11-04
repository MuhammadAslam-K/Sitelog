import React from 'react';
import { 
  FolderKanban, 
  Clock, 
  CheckCircle2, 
  IndianRupee, 
  TrendingUp, 
  Plus, 
  ArrowUpRight, 
  Layers, 
  Sparkles,
  Users,
  Coins,
  ShieldCheck,
  Receipt,
  Boxes
} from 'lucide-react';
import { MetricCard } from './MetricCard.jsx';
import { formatIndianCurrency, formatIndianCompact } from '../../utils/formatters.js';
import { calculateEmployeeWageReflection } from '../../utils/wageCalculator.js';

export function DashboardOverview({ 
  projects = [], 
  employees = [],
  wages = [],
  expenses = [],
  materials = [],
  onAddNewProject, 
  onNavigateToProjects,
  onNavigateToEmployees,
  onNavigateToWages,
  onNavigateToExpenses,
  onNavigateToMaterials,
  onNavigateToSettings,
  onSeedSampleData,
  isSeeding = false
}) {
  // Filter active (non-archived) projects for current metrics
  const activeProjects = projects.filter((p) => !p.isArchived);

  // Compute live project statistics directly from Firestore records
  const totalProjects = activeProjects.length;
  const ongoingProjects = activeProjects.filter((p) => p.status === 'Ongoing').length;
  const completedProjects = activeProjects.filter((p) => p.status === 'Completed').length;

  const totalContractValue = activeProjects.reduce((sum, p) => sum + (Number(p.contractValue) || 0), 0);
  const totalProjectExpenses = activeProjects.reduce(
    (sum, p) => sum + (Number(p.otherTotalExpenses) || 0) + (Number(p.totalLabourExpenses) || 0),
    0
  );

  const totalLabourExpenses = activeProjects.reduce((sum, p) => sum + (Number(p.totalLabourExpenses) || 0), 0);
  const totalOtherExpenses = activeProjects.reduce((sum, p) => sum + (Number(p.otherTotalExpenses) || 0), 0);

  // Compute live workforce statistics from Firestore employees collection & daily wages reflection
  const activeStaff = employees.filter((e) => !e.isArchived);
  const totalEmployeesCount = activeStaff.length;
  const activeEmployeesCount = activeStaff.filter((e) => e.status === 'Active').length;

  let totalPendingWages = 0;
  let totalPaidWages = 0;
  activeStaff.forEach((emp) => {
    const ref = calculateEmployeeWageReflection(emp, wages);
    totalPendingWages += ref.pendingWages;
    totalPaidWages += ref.paidWages;
  });

  // Financial expenditure ratio
  const expenditurePercentage = totalContractValue > 0
    ? Math.min(100, Math.round((totalProjectExpenses / totalContractValue) * 100))
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Enterprise Operations Dashboard
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 tracking-tight">
            Kerala Infrastructure & Construction Operations
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time analytics across road projects, active workforce, and wage disbursements.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {projects.length === 0 && (
            <button
              onClick={onSeedSampleData}
              disabled={isSeeding}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-emerald-900 bg-emerald-100/80 hover:bg-emerald-200 border border-emerald-300 transition-all"
            >
              <Sparkles className="w-4 h-4 text-emerald-700" />
              {isSeeding ? 'Seeding...' : 'Load Sample Data'}
            </button>
          )}

          <button
            onClick={onAddNewProject}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-900 transition-all shadow-sm hover:shadow"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics: Projects & Active Workforce */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <MetricCard
          title="Total Projects"
          value={totalProjects}
          subtext={`${ongoingProjects} active sites in progress`}
          icon={FolderKanban}
          color="slate"
        />

        <MetricCard
          title="Ongoing Roadworks"
          value={ongoingProjects}
          subtext="Active construction underway"
          icon={Clock}
          color="emerald"
        />

        <MetricCard
          title="Completed Works"
          value={completedProjects}
          subtext="Handed over & finalized"
          icon={CheckCircle2}
          color="blue"
        />

        {/* Active Employees Count Metric */}
        <MetricCard
          title="Active Employees"
          value={activeEmployeesCount}
          subtext={`${totalEmployeesCount} total workforce registered`}
          icon={Users}
          color="purple"
        />
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <MetricCard
          title="Total Contract Value"
          value={formatIndianCurrency(totalContractValue)}
          compactValue={formatIndianCompact(totalContractValue)}
          subtext="Across all awarded tenders"
          icon={IndianRupee}
          color="purple"
        />

        <MetricCard
          title="Total Project Expenses"
          value={formatIndianCurrency(totalProjectExpenses)}
          compactValue={formatIndianCompact(totalProjectExpenses)}
          subtext={`Labour: ${formatIndianCompact(totalLabourExpenses)} | Other: ${formatIndianCompact(totalOtherExpenses)}`}
          icon={TrendingUp}
          color="rose"
        />
      </div>

      {/* Financial Health & Workforce Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Financial Expenditure vs Contract Value
              </h3>
              <p className="text-xs text-slate-500">
                Cumulative budget consumption of all active road projects
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              {expenditurePercentage}% Utilized
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 mb-6">
            <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden flex">
              <div
                className="bg-emerald-600 h-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalLabourExpenses / (totalContractValue || 1)) * 100)}%` }}
                title={`Labour: ${formatIndianCurrency(totalLabourExpenses)}`}
              />
              <div
                className="bg-amber-500 h-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalOtherExpenses / (totalContractValue || 1)) * 100)}%` }}
                title={`Other: ${formatIndianCurrency(totalOtherExpenses)}`}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>₹0</span>
              <span className="font-semibold text-slate-700">Total Spent: {formatIndianCurrency(totalProjectExpenses)}</span>
              <span>Target: {formatIndianCurrency(totalContractValue)}</span>
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-150">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <p className="text-[11px] font-semibold text-slate-500">Total Labour Expense</p>
              <p className="text-sm font-bold text-emerald-800 mt-0.5">
                {formatIndianCurrency(totalLabourExpenses)}
              </p>
              <span className="text-[10px] text-slate-400">Site wages & daily rolls</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <p className="text-[11px] font-semibold text-slate-500">Other Total Expenses</p>
              <p className="text-sm font-bold text-amber-800 mt-0.5">
                {formatIndianCurrency(totalOtherExpenses)}
              </p>
              <span className="text-[10px] text-slate-400">Materials, fuel & equipment</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <p className="text-[11px] font-semibold text-slate-500">Remaining Contract Margin</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {formatIndianCurrency(Math.max(0, totalContractValue - totalProjectExpenses))}
              </p>
              <span className="text-[10px] text-slate-400">Gross operating balance</span>
            </div>
          </div>

          {/* Workforce Wage Ledger Vitals & Daily Expenses Vitals */}
          <div className="mt-5 space-y-2.5">
            <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-150 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800">Workforce Wage Ledger Vitals:</span>
                  <span className="text-slate-600 ml-1.5">
                    Paid: <strong className="text-emerald-800 font-mono">{formatIndianCurrency(totalPaidWages)}</strong> | Pending: <strong className="text-amber-800 font-mono">{formatIndianCurrency(totalPendingWages)}</strong>
                  </span>
                </div>
              </div>

              <button
                onClick={onNavigateToWages}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline shrink-0"
              >
                View Daily Wages →
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-150 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-700 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800">Site Daily Expenses (Phase 3):</span>
                  <span className="text-slate-600 ml-1.5">
                    Recorded: <strong className="text-blue-900 font-mono">{expenses.length} Entries</strong> | Total: <strong className="text-blue-900 font-mono">{formatIndianCurrency(expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0))}</strong>
                  </span>
                </div>
              </div>

              <button
                onClick={onNavigateToExpenses}
                className="text-xs font-bold text-blue-800 hover:text-blue-950 underline shrink-0"
              >
                View Daily Expenses →
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-150 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-700 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800">Materials Procurement (Phase 5):</span>
                  <span className="text-slate-600 ml-1.5">
                    Supplied: <strong className="text-amber-900 font-mono">{materials.length} Entries</strong> | Total: <strong className="text-amber-900 font-mono">{formatIndianCurrency(materials.reduce((s, m) => s + (Number(m.amount) || 0), 0))}</strong>
                  </span>
                </div>
              </div>

              <button
                onClick={onNavigateToMaterials}
                className="text-xs font-bold text-amber-800 hover:text-amber-950 underline shrink-0"
              >
                View Materials →
              </button>
            </div>
          </div>
        </div>

        {/* Phase Roadmap Highlight Card */}
        <div className="bg-gradient-to-br from-emerald-950 to-slate-900 text-white p-6 rounded-2xl border border-emerald-900 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
              <Layers className="w-4 h-4" />
              Integrated Modules
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Kerala Roadways Operations
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Projects, workforce directory, daily wages, expenses, and materials are live and synchronized with Firestore.
            </p>

            <div className="mt-4 space-y-2">
              <div 
                onClick={onNavigateToProjects}
                className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
              >
                <span className="text-slate-300">Projects Module</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-emerald-950">Active</span>
              </div>

              <div 
                onClick={onNavigateToEmployees}
                className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
              >
                <span className="text-slate-300">Employees Directory</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-emerald-950">Active</span>
              </div>

              <div 
                onClick={onNavigateToWages}
                className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
              >
                <span className="text-slate-300">Daily Wages & Attendance</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-emerald-950">Active</span>
              </div>

              <div 
                onClick={onNavigateToExpenses}
                className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
              >
                <span className="text-slate-300">Daily Expenses (Phase 3)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-emerald-950">Active</span>
              </div>

              <div 
                onClick={onNavigateToMaterials}
                className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
              >
                <span className="text-slate-300">Materials (Phase 5)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-emerald-950">Active</span>
              </div>

              <div 
                onClick={onNavigateToSettings}
                className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
              >
                <span className="text-slate-300">Settings & RBAC (Phase 8)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-emerald-950">Active</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 mt-4 flex items-center gap-2">
            <button
              onClick={onNavigateToProjects}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors"
            >
              <span>Projects</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onNavigateToMaterials}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition-colors"
            >
              <span>Materials</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
