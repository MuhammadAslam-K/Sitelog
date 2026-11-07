import React from 'react';

export function MetricCard({ title, value, subtext, icon: Icon, color = 'teal', compactValue }) {
  const colorMap = {
    teal: {
      iconBg: 'bg-[#0F8B78]',
      iconText: 'text-white',
      accent: 'text-[#0F8B78]'
    },
    navy: {
      iconBg: 'bg-[#172B4D]',
      iconText: 'text-white',
      accent: 'text-[#172B4D]'
    },
    blue: {
      iconBg: 'bg-[#2563EB]',
      iconText: 'text-white',
      accent: 'text-[#2563EB]'
    },
    amber: {
      iconBg: 'bg-[#F4B740]',
      iconText: 'text-slate-900',
      accent: 'text-amber-700'
    },
    purple: {
      iconBg: 'bg-[#7C3AED]',
      iconText: 'text-white',
      accent: 'text-purple-700'
    },
    rose: {
      iconBg: 'bg-[#DC5353]',
      iconText: 'text-white',
      accent: 'text-[#DC5353]'
    },
    slate: {
      iconBg: 'bg-[#64748B]',
      iconText: 'text-white',
      accent: 'text-[#64748B]'
    }
  };

  const c = colorMap[color] || colorMap.teal;

  return (
    <div className="p-5 rounded-2xl border border-[#E2E8F0] bg-white shadow-2xs hover:shadow-xs transition-shadow relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider truncate mb-1">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#172B4D] tracking-tight truncate">
              {value}
            </h3>
            {compactValue && (
              <span className="text-xs font-semibold text-[#64748B] hidden sm:inline">
                ({compactValue})
              </span>
            )}
          </div>
          {subtext && (
            <p className="text-xs text-[#64748B] mt-1.5 flex items-center gap-1 font-medium">
              {subtext}
            </p>
          )}
        </div>

        <div className={`w-11 h-11 rounded-xl ${c.iconBg} ${c.iconText} flex items-center justify-center shrink-0 shadow-2xs ml-3`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
