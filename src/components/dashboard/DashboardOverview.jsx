import React from 'react';
import { 
  FolderKanban, 
  Clock, 
  CheckCircle2, 
  IndianRupee, 
  TrendingUp, 
  Plus, 
  Users,
  Coins,
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
  onNavigateToSettings
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0F8B78] bg-[#0F8B78]/10 px-2.5 py-1 rounded-full border border-[#0F8B78]/25">
            Enterprise Operations Dashboard
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#172B4D] mt-2 tracking-tight">
            Roadways & Infra
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Kerala Infrastructure & Construction Operations Dashboard
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onAddNewProject}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#0F8B78] hover:bg-[#0D7A69] transition-all shadow-2xs hover:shadow-xs"
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
          color="navy"
        />

        <MetricCard
          title="Ongoing Roadworks"
          value={ongoingProjects}
          subtext="Active construction underway"
          icon={Clock}
          color="teal"
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
          color="teal"
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

      {/* Financial Health & Workforce Operations Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#172B4D] tracking-tight">
              Financial Expenditure vs Contract Value
            </h3>
            <p className="text-xs text-[#64748B]">
              Cumulative budget consumption of all active road projects
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 text-[#172B4D] border border-[#E2E8F0]">
            {expenditurePercentage}% Utilized
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mb-6">
          <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden flex">
            <div
              className="bg-[#0F8B78] h-full transition-all duration-500"
              style={{ width: `${Math.min(100, (totalLabourExpenses / (totalContractValue || 1)) * 100)}%` }}
              title={`Labour: ${formatIndianCurrency(totalLabourExpenses)}`}
            />
            <div
              className="bg-[#F4B740] h-full transition-all duration-500"
              style={{ width: `${Math.min(100, (totalOtherExpenses / (totalContractValue || 1)) * 100)}%` }}
              title={`Other: ${formatIndianCurrency(totalOtherExpenses)}`}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#64748B] font-medium font-mono tabular-nums">
            <span>₹0</span>
            <span className="font-semibold text-[#172B4D]">Total Spent: {formatIndianCurrency(totalProjectExpenses)}</span>
            <span>Target: {formatIndianCurrency(totalContractValue)}</span>
          </div>
        </div>

        {/* Breakdown Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#E2E8F0]">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0]">
            <p className="text-[11px] font-semibold text-[#64748B]">Total Labour Expense</p>
            <p className="text-sm font-bold text-[#0F8B78] mt-0.5 font-mono tabular-nums">
              {formatIndianCurrency(totalLabourExpenses)}
            </p>
            <span className="text-[10px] text-[#64748B]">Site wages & daily rolls</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0]">
            <p className="text-[11px] font-semibold text-[#64748B]">Other Total Expenses</p>
            <p className="text-sm font-bold text-amber-700 mt-0.5 font-mono tabular-nums">
              {formatIndianCurrency(totalOtherExpenses)}
            </p>
            <span className="text-[10px] text-[#64748B]">Materials, fuel & equipment</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0]">
            <p className="text-[11px] font-semibold text-[#64748B]">Remaining Contract Margin</p>
            <p className="text-sm font-bold text-[#172B4D] mt-0.5 font-mono tabular-nums">
              {formatIndianCurrency(Math.max(0, totalContractValue - totalProjectExpenses))}
            </p>
            <span className="text-[10px] text-[#64748B]">Gross operating balance</span>
          </div>
        </div>

        {/* Workforce Wage Ledger Vitals & Daily Expenses Vitals */}
        <div className="mt-5 space-y-2.5">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#0F8B78] shrink-0" />
              <div>
                <span className="font-bold text-[#172B4D]">Workforce Wage Ledger Vitals:</span>
                <span className="text-[#64748B] ml-1.5 font-mono tabular-nums">
                  Paid: <strong className="text-[#0F8B78]">{formatIndianCurrency(totalPaidWages)}</strong> | Pending: <strong className="text-amber-700">{formatIndianCurrency(totalPendingWages)}</strong>
                </span>
              </div>
            </div>

            <button
              onClick={onNavigateToWages}
              className="text-xs font-bold text-[#0F8B78] hover:text-[#0D7A69] underline shrink-0"
            >
              View Daily Wages →
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#2563EB] shrink-0" />
              <div>
                <span className="font-bold text-[#172B4D]">Site Daily Expenses (Phase 3):</span>
                <span className="text-[#64748B] ml-1.5 font-mono tabular-nums">
                  Recorded: <strong className="text-[#172B4D]">{expenses.length} Entries</strong> | Total: <strong className="text-[#172B4D]">{formatIndianCurrency(expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0))}</strong>
                </span>
              </div>
            </div>

            <button
              onClick={onNavigateToExpenses}
              className="text-xs font-bold text-[#2563EB] hover:text-blue-800 underline shrink-0"
            >
              View Daily Expenses →
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold text-[#172B4D]">Materials Procurement (Phase 5):</span>
                <span className="text-[#64748B] ml-1.5 font-mono tabular-nums">
                  Supplied: <strong className="text-[#172B4D]">{materials.length} Entries</strong> | Total: <strong className="text-[#172B4D]">{formatIndianCurrency(materials.reduce((s, m) => s + (Number(m.amount) || 0), 0))}</strong>
                </span>
              </div>
            </div>

            <button
              onClick={onNavigateToMaterials}
              className="text-xs font-bold text-amber-700 hover:text-amber-900 underline shrink-0"
            >
              View Materials →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
