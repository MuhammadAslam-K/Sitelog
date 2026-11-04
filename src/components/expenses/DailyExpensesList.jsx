import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  Sparkles, 
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
import { EXPENSE_CATEGORIES } from '../../utils/constants.js';
import { formatIndianCurrency, formatIndianCompact } from '../../utils/formatters.js';

export function DailyExpensesList({
  expenses = [],
  projects = [],
  onAddNewExpense,
  onEditExpense,
  onDeleteExpense,
  onSeedExpenses,
  isSeeding = false,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Phase 3 Operations
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {expenses.length} Records
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 tracking-tight">
            Daily Site Expenses
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track and monitor site expenditures across vehicles, materials, fuel, food, and overheads.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {expenses.length === 0 && onSeedExpenses && (
            <button
              onClick={onSeedExpenses}
              disabled={isSeeding}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-emerald-900 bg-emerald-100/80 hover:bg-emerald-200 border border-emerald-300 transition-all"
            >
              <Sparkles className="w-4 h-4 text-emerald-700" />
              {isSeeding ? 'Loading Samples...' : 'Load Sample Expenses'}
            </button>
          )}

          <button
            onClick={onAddNewExpense}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-900 transition-all shadow-sm hover:shadow"
          >
            <Plus className="w-4 h-4" />
            Add Daily Expense
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Expenses */}
        <div className="col-span-2 bg-gradient-to-br from-emerald-800 to-emerald-950 p-4 sm:p-5 rounded-2xl text-white shadow-xs">
          <div className="flex items-center justify-between opacity-80">
            <span className="text-xs font-bold uppercase tracking-wider">Total Expenses</span>
            <Receipt className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono mt-2">
            {formatIndianCurrency(categoryTotals.all)}
          </div>
          <p className="text-[11px] text-emerald-200/80 mt-1">
            Cumulative across all active projects
          </p>
        </div>

        {/* Fuel */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Fuel</span>
            <div className="p-1 rounded bg-rose-50 text-rose-600">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 font-mono mt-2">
            {formatIndianCompact(categoryTotals.fuel)}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Diesel & oils</p>
        </div>

        {/* Material */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Material</span>
            <div className="p-1 rounded bg-amber-50 text-amber-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 font-mono mt-2">
            {formatIndianCompact(categoryTotals.material)}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Bitumen & aggregate</p>
        </div>

        {/* Vehicle */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Vehicle</span>
            <div className="p-1 rounded bg-blue-50 text-blue-600">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 font-mono mt-2">
            {formatIndianCompact(categoryTotals.vehicle)}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Spares & repairs</p>
        </div>

        {/* Food & Other */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Food & Other</span>
            <div className="p-1 rounded bg-emerald-50 text-emerald-600">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 font-mono mt-2">
            {formatIndianCompact(categoryTotals.food + categoryTotals.other)}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Meals & misc</p>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Row 1: Search, Project Filter & Category Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search expenses by item, vendor / agent, ID or project..."
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange && onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pt-2 border-t border-slate-150">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Date Range Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-transparent text-xs text-slate-700 focus:outline-none"
                title="From Date"
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-transparent text-xs text-slate-700 focus:outline-none"
                title="To Date"
              />
            </div>

            {/* Quick date buttons */}
            <button
              onClick={() => handleQuickDate('today')}
              className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 rounded border border-slate-200"
            >
              Today
            </button>
            <button
              onClick={() => handleQuickDate('7days')}
              className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 rounded border border-slate-200"
            >
              7 Days
            </button>
            <button
              onClick={() => handleQuickDate('thisMonth')}
              className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 rounded border border-slate-200"
            >
              This Month
            </button>

            {(fromDate || toDate) && (
              <button
                onClick={() => handleQuickDate('clear')}
                className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100"
                title="Clear date range"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expense List Table */}
      <ExpenseTable
        expenses={filteredExpenses}
        onEditExpense={onEditExpense}
        onDeleteExpense={onDeleteExpense}
      />
    </div>
  );
}
