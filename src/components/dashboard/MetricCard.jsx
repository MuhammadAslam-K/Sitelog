import React from 'react';

export function MetricCard({ title, value, subtext, icon: Icon, color = 'emerald', compactValue }) {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-200/80',
      iconBg: 'bg-emerald-600',
      text: 'text-emerald-950',
      accent: 'text-emerald-700'
    },
    blue: {
      bg: 'bg-blue-50/70',
      border: 'border-blue-200/80',
      iconBg: 'bg-blue-600',
      text: 'text-blue-950',
      accent: 'text-blue-700'
    },
    amber: {
      bg: 'bg-amber-50/70',
      border: 'border-amber-200/80',
      iconBg: 'bg-amber-500',
      text: 'text-amber-950',
      accent: 'text-amber-700'
    },
    purple: {
      bg: 'bg-purple-50/70',
      border: 'border-purple-200/80',
      iconBg: 'bg-purple-600',
      text: 'text-purple-950',
      accent: 'text-purple-700'
    },
    rose: {
      bg: 'bg-rose-50/70',
      border: 'border-rose-200/80',
      iconBg: 'bg-rose-600',
      text: 'text-rose-950',
      accent: 'text-rose-700'
    },
    slate: {
      bg: 'bg-white',
      border: 'border-slate-200',
      iconBg: 'bg-slate-700',
      text: 'text-slate-900',
      accent: 'text-slate-600'
    }
  };

  const c = colorMap[color] || colorMap.slate;

  return (
    <div className={`p-5 rounded-2xl border ${c.border} ${c.bg} shadow-xs hover:shadow-md transition-shadow relative overflow-hidden`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate mb-1">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className={`text-2xl sm:text-3xl font-extrabold ${c.text} tracking-tight truncate`}>
              {value}
            </h3>
            {compactValue && (
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                ({compactValue})
              </span>
            )}
          </div>
          {subtext && (
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1 font-medium">
              {subtext}
            </p>
          )}
        </div>

        <div className={`w-11 h-11 rounded-xl ${c.iconBg} flex items-center justify-center text-white shrink-0 shadow-xs ml-3`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
