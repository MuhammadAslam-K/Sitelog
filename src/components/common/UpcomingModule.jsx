import React from 'react';
import { 
  Coins, 
  Users, 
  Receipt, 
  Boxes, 
  Truck, 
  Activity, 
  FileBarChart, 
  Settings,
  Clock, 
  ArrowRight,
  ShieldCheck,
  FolderKanban
} from 'lucide-react';

const MODULE_DETAILS = {
  wages: {
    title: 'Daily Wages Management',
    phase: 'Phase 2',
    icon: Coins,
    accent: 'emerald',
    description: 'Track daily attendance, muster rolls, wage disbursements, and labour cost allocation mapped directly to Project IDs.',
    keyFeatures: [
      'Daily muster roll with automated overtime calculation',
      'Direct wage calculation linked to Project Labour Expense',
      'Master labour category (Mason, Helper, Driver, Supervisor) rates',
      'Weekly wage settlement sheets for site engineers'
    ]
  },
  employees: {
    title: 'Employee & Labour Registry',
    phase: 'Phase 2',
    icon: Users,
    accent: 'blue',
    description: 'Centralized directory for site engineers, supervisors, permanent staff, and contracted daily wage workforce.',
    keyFeatures: [
      'KYC & Aadhaar verification records for 50+ site workers',
      'Emergency contacts, medical insurance and PPE records',
      'Daily site deployment & project transfer tracking',
      'Bank disbursement account details'
    ]
  },
  expenses: {
    title: 'Daily Project Expenses',
    phase: 'Phase 3',
    icon: Receipt,
    accent: 'amber',
    description: 'Site petty cash vouchers, fuel slips, toll fees, bitumen transport, and vendor invoice logging mapped to Project IDs.',
    keyFeatures: [
      'Photo bill receipts and site invoice uploads',
      'Automatic rollup into project "Other Total Expenses"',
      'Categorized expense ledgers (Fuel, Bitumen, Quarry metal, Sand)',
      'Engineer petty cash balance & approval workflow'
    ]
  },
  materials: {
    title: 'Materials Inventory & Quarry Tracking',
    phase: 'Phase 5',
    icon: Boxes,
    accent: 'indigo',
    description: 'Track raw bitumen 60/70, emulsion, aggregate (20mm, 40mm, GSB), manufactured sand, and cement delivery challans.',
    keyFeatures: [
      'Weighbridge slip logging & quality inspection records',
      'Mix design consumption vs actual site usage',
      'Inter-site material transfer challans',
      'Minimum stock warning alerts for site batching plants'
    ]
  },
  machinery: {
    title: 'Machinery & Heavy Fleet Operations',
    phase: 'Phase 6',
    icon: Truck,
    accent: 'rose',
    description: 'Maintain pavers, tandem rollers, pneumatic tyre rollers (PTR), tipper lorries, JCB excavators, and hot mix plants.',
    keyFeatures: [
      'Hourly meter & logbook entries tagged to road projects',
      'Diesel consumption efficiency monitoring (km/L or L/hr)',
      'Preventative maintenance schedules and fitness certificates',
      'Rental equipment cost accruals vs owned fleet ROI'
    ]
  },
  progress: {
    title: 'Site Progress & Measurement Book (MB)',
    phase: 'Phase 4',
    icon: Activity,
    accent: 'teal',
    description: 'Daily chainage progress tracking (e.g. Ch. 0/000 to Ch. 2/500), sub-grade, WMM, DBM, BC layers, and geotagged site photos.',
    keyFeatures: [
      'Chainage-based roadwork layer tracking',
      'Physical progress percentage vs financial billing',
      'Measurement Book (MB) draft record preparation',
      'Rainfall & weather delay site incident log'
    ]
  },
  reports: {
    title: 'Executive Analytics & PWD Audit Reports',
    phase: 'Phase 7',
    icon: FileBarChart,
    accent: 'violet',
    description: 'Comprehensive financial statements, contract profitability analysis, budget variance reports, and tender export formats.',
    keyFeatures: [
      'Project-wise profit & loss statement',
      'Budget variance alerts (Labour vs Material vs Other)',
      'Government / Local Body submission export sheets',
      'Auditor-ready expense transaction logs'
    ]
  },
  settings: {
    title: 'System Settings & Config',
    phase: 'Phase 8',
    icon: Settings,
    accent: 'slate',
    description: 'Customizable dropdown parameters for Local Bodies, Work Types, company branch offices, and role permissions.',
    keyFeatures: [
      'Add custom Local Body types (Panchayats, Municipalities)',
      'Manage roadwork classification templates',
      'Team permissions and user role assignments',
      'Automated database backup routines'
    ]
  }
};

export function UpcomingModule({ moduleId, onNavigateToProjects }) {
  const details = MODULE_DETAILS[moduleId] || {
    title: 'Upcoming Module',
    phase: 'Future Phase',
    icon: Clock,
    description: 'This module is under planned development for Kerala Roadways PMS.',
    keyFeatures: []
  };

  const Icon = details.icon;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-8 sm:p-10 text-center relative overflow-hidden">
        {/* Decorative corner banner */}
        <div className="absolute top-0 right-0 bg-[#0F8B78] text-white text-xs font-bold px-5 py-1.5 rounded-bl-xl uppercase tracking-wider shadow-2xs">
          Planned for {details.phase}
        </div>

        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-[#0F8B78]/10 text-[#0F8B78] border border-[#0F8B78]/25 mx-auto flex items-center justify-center mb-6 shadow-2xs">
          <Icon className="w-10 h-10" />
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172B4D] tracking-tight mb-3">
          {details.title}
        </h2>

        {/* Description */}
        <p className="text-[#64748B] max-w-2xl mx-auto text-base leading-relaxed mb-8">
          {details.description}
        </p>

        {/* Architecture Notice */}
        <div className="bg-slate-50 border border-[#E2E8F0] rounded-xl p-5 mb-8 text-left max-w-2xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-[#172B4D] uppercase tracking-wider mb-3">
            <ShieldCheck className="w-4 h-4 text-[#0F8B78]" />
            Phase 1 Database Compatibility
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed">
            All records in this module will link automatically via the primary <strong className="text-[#172B4D] font-mono">Project ID</strong> (e.g. <span className="font-mono text-[#0F8B78] bg-[#0F8B78]/10 px-1.5 py-0.5 rounded border border-[#0F8B78]/20">PRJ-101</span>) configured in the Phase 1 Projects schema.
          </p>
        </div>

        {/* Planned Features */}
        {details.keyFeatures.length > 0 && (
          <div className="max-w-2xl mx-auto text-left mb-8">
            <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-3">
              Key Features Planned in {details.phase}:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {details.keyFeatures.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-[#E2E8F0] text-xs text-[#172B4D]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0F8B78] mt-1.5 shrink-0"></span>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action button back to active module */}
        <div className="flex justify-center pt-2">
          <button
            onClick={onNavigateToProjects}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F8B78] hover:bg-[#0d7867] text-white font-semibold text-sm transition-all shadow-2xs hover:shadow"
          >
            <FolderKanban className="w-4 h-4" />
            Manage Active Projects (Phase 1)
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
