import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Truck, 
  Package, 
  Fuel, 
  Utensils, 
  MoreHorizontal,
  X,
  Building2,
  TrendingDown
} from 'lucide-react';
import { ExpenseTable } from './ExpenseTable.jsx';
import { MetricCard } from '../dashboard/MetricCard.jsx';
import { DateInput } from '../common/DateInput.jsx';
import { EXPENSE_CATEGORIES } from '../../utils/constants.js';
import { formatIndianCurrency, formatIndianCompact } from '../../utils/formatters.js';

export function DailyExpensesList({
  expenses = [],
  projects = [],
  onAddNewExpense,
  onEditExpense,
  onDeleteExpense,
  searchQuery = '',
  onSearchChange
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Date Quick Presets
  const handleQuickDate = (preset) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'today') {
      setFromDate(todayStr);
      setToDate(todayStr);
    } else if (preset === '7days') {
      const past = new Date(today);
      past.setDate(past.getDate() - 7);
      setFromDate(past.toISOString().split('T')[0]);
      setToDate(todayStr);
    } else if (preset === 'thisMonth') {
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      setFromDate(`${year}-${month}-01`);
      setToDate(todayStr);
    } else if (preset === 'clear') {
      setFromDate('');
      setToDate('');
    }
  };

  // Compute category totals across all expenses
  const categoryTotals = useMemo(() => {
    const totals = {
      all: 0,
      vehicle: 0,
      material: 0,
      fuel: 0,
      food: 0,
      other: 0
    };

    expenses.forEach((exp) => {
      const amt = Number(exp.amount) || 0;
      totals.all += amt;
      const cat = (exp.category || 'other').toLowerCase();
      if (totals[cat] !== undefined) {
        totals[cat] += amt;
      } else {
        totals.other += amt;
      }
    });

    return totals;
  }, [expenses]);

  // Filtered expenses based on all criteria
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      // 1. Category Filter
      if (selectedCategory !== 'all') {
        const cat = (exp.category || '').toLowerCase();
        if (cat !== selectedCategory.toLowerCase()) return false;
      }

      // 2. Project Filter
      if (selectedProject !== 'all') {
        if (exp.projectId !== selectedProject) return false;
      }

      // 3. Date Range Filter
      if (fromDate && exp.date < fromDate) return false;
      if (toDate && exp.date > toDate) return false;

      // 4. Search Filter
      const search = (searchQuery || '').trim().toLowerCase();
      if (search) {
        const matchId = (exp.expenseId || '').toLowerCase().includes(search);
        const matchItem = (exp.item || '').toLowerCase().includes(search);
        const matchAgent = (exp.agent || '').toLowerCase().includes(search);
        const matchProject = (exp.projectName || '').toLowerCase().includes(search);
        if (!matchId && !matchItem && !matchAgent && !matchProject) return false;
      }

      return true;
    });
  }, [expenses, selectedCategory, selectedProject, fromDate, toDate, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F8B78] bg-[#0F8B78]/10 px-2.5 py-1 rounded-full border border-[#0F8B78]/25">
              Phase 3 Operations
            </span>
            <span className="text-xs font-semibold text-[#64748B]">
              {expenses.length} Records
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#172B4D] mt-2 tracking-tight">
            Daily Site Expenses
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Track and monitor site expenditures across vehicles, materials, fuel, food, and overheads.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onAddNewExpense}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#0F8B78] hover:bg-[#0D7A69] transition-all shadow-2xs hover:shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add Daily Expense
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Expenses */}
        <div className="col-span-2 bg-[#172B4D] p-4 sm:p-5 rounded-2xl text-white shadow-2xs border border-[#213963]">
          <div className="flex items-center justify-between opacity-80">
            <span className="text-xs font-bold uppercase tracking-wider">Total Expenses</span>
            <div className="w-8 h-8 rounded-lg bg-[#0F8B78] flex items-center justify-center">
              <Receipt className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono tabular-nums mt-2">
            {formatIndianCurrency(categoryTotals.all)}
          </div>
          <p className="text-[11px] text-slate-300 mt-1">
            Cumulative across all active projects
          </p>
        </div>

        {/* Fuel */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-bold uppercase">Fuel</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-[#DC5353]">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-[#172B4D] font-mono tabular-nums mt-2">
            {formatIndianCompact(categoryTotals.fuel)}
          </div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Diesel & oils</p>
        </div>

        {/* Material */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-bold uppercase">Material</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-[#172B4D] font-mono tabular-nums mt-2">
            {formatIndianCompact(categoryTotals.material)}
          </div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Bitumen & aggregate</p>
        </div>

        {/* Vehicle */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-bold uppercase">Vehicle</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-[#2563EB]">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-[#172B4D] font-mono tabular-nums mt-2">
            {formatIndianCompact(categoryTotals.vehicle)}
          </div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Spares & repairs</p>
        </div>

        {/* Food & Other */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-bold uppercase">Food & Other</span>
            <div className="p-1.5 rounded-lg bg-teal-50 text-[#0F8B78]">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-[#172B4D] font-mono tabular-nums mt-2">
            {formatIndianCompact(categoryTotals.food + categoryTotals.other)}
          </div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Meals & misc</p>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-4">
        {/* Row 1: Search & Project Filter */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search expenses by item, vendor / agent, ID or project..."
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-white focus:bg-white border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#0F8B78]/15 focus:border-[#0F8B78] focus:outline-none transition-all text-[#172B4D]"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange && onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#172B4D]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Project Filter */}
          <div className="w-full lg:w-72">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-white border border-[#E2E8F0] rounded-xl focus:border-[#0F8B78] focus:outline-none text-[#172B4D]"
            >
              <option value="all">All Projects (All Sites)</option>
              {projects.map((p) => (
                <option key={p.projectId} value={p.projectId}>
                  {p.projectId} - {p.projectName}
                </option>
              ))}
              <option value="GENERAL">General Site Overhead</option>
            </select>
          </div>
        </div>

        {/* Row 2: Category Chips & Date Range */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pt-2 border-t border-[#E2E8F0]">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-[#172B4D] text-white shadow-2xs'
                  : 'bg-slate-100 text-[#64748B] hover:bg-slate-200'
              }`}
            >
              All Categories ({expenses.length})
            </button>

            {EXPENSE_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const count = expenses.filter((e) => (e.category || '').toLowerCase() === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap capitalize ${
                    isSelected
                      ? 'bg-[#0F8B78] text-white shadow-2xs'
                      : 'bg-slate-100 text-[#64748B] hover:bg-slate-200'
                  }`}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Date Range Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0]">
              <Calendar className="w-3.5 h-3.5 text-[#0F8B78]" />
              <DateInput
                value={fromDate}
                max={toDate || undefined}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-transparent text-xs text-[#172B4D] font-mono min-w-[82px]"
              />
              <span className="text-[#64748B] text-xs">to</span>
              <DateInput
                value={toDate}
                min={fromDate || undefined}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-transparent text-xs text-[#172B4D] font-mono min-w-[82px]"
              />
              {(fromDate || toDate) && (
                <button
                  onClick={() => handleQuickDate('clear')}
                  className="text-slate-400 hover:text-slate-600 pl-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Date Preset Buttons */}
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => handleQuickDate('today')}
                className="px-2 py-1 rounded bg-slate-100 text-[#64748B] hover:bg-slate-200 font-medium"
              >
                Today
              </button>
              <button
                onClick={() => handleQuickDate('7days')}
                className="px-2 py-1 rounded bg-slate-100 text-[#64748B] hover:bg-slate-200 font-medium"
              >
                7 Days
              </button>
              <button
                onClick={() => handleQuickDate('thisMonth')}
                className="px-2 py-1 rounded bg-slate-100 text-[#64748B] hover:bg-slate-200 font-medium"
              >
                This Month
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <ExpenseTable
        expenses={filteredExpenses}
        onEditExpense={onEditExpense}
        onDeleteExpense={onDeleteExpense}
      />
    </div>
  );
}
