import { 
  LayoutDashboard, 
  FolderKanban, 
  Coins, 
  Users, 
  Receipt, 
  Boxes, 
  Truck, 
  Activity, 
  FileBarChart, 
  Settings, 
  HardHat,
  ChevronRight,
  Sparkles,
  X,
  Lock
} from 'lucide-react';
import { NAVIGATION_ITEMS, COMPANY_NAME, COMPANY_TAGLINE } from '../../utils/constants.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { PWAInstallButton } from '../pwa/PWAInstallButton.jsx';

const ICON_MAP = {
  LayoutDashboard,
  FolderKanban,
  Coins,
  Users,
  Receipt,
  Boxes,
  Truck,
  Activity,
  FileBarChart,
  Settings
};

export function Sidebar({ currentSection, onSelectSection, isMobileOpen, onCloseMobile }) {
  const { currentUser, isSuperAdmin } = useAuth();

  const functionalItems = NAVIGATION_ITEMS.filter((item) => {
    if (!item.functional) return false;
    // Settings is only accessible to Super Admin
    if (item.id === 'settings' && !isSuperAdmin) return false;
    // If Sub-Admin, check if module has 'none' access
    if (!isSuperAdmin && currentUser?.permissions?.[item.id] === 'none') {
      return false;
    }
    return true;
  });

  const upcomingItems = NAVIGATION_ITEMS.filter((item) => !item.functional);

  const renderNavItem = (item) => {
    const IconComponent = ICON_MAP[item.icon] || FolderKanban;
    const isActive = currentSection === item.id;
    const userPerm = !isSuperAdmin ? currentUser?.permissions?.[item.id] : 'edit';
    const isViewOnly = !isSuperAdmin && userPerm === 'view';

    return (
      <button
        key={item.id}
        onClick={() => {
          onSelectSection(item.id);
          if (onCloseMobile) onCloseMobile();
        }}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
          isActive
            ? 'bg-emerald-700/80 text-white shadow-xs font-semibold'
            : item.functional
            ? 'text-slate-300 hover:text-white hover:bg-emerald-900/40'
            : 'text-slate-400 hover:text-slate-200 hover:bg-emerald-950/50'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <IconComponent
            className={`w-4 h-4 shrink-0 transition-transform ${
              isActive ? 'text-amber-300 scale-110' : 'text-slate-400 group-hover:text-amber-200'
            }`}
          />
          <span className="truncate">{item.label}</span>
        </div>

        {item.functional ? (
          <div className="flex items-center gap-1.5 shrink-0">
            {isViewOnly && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                View
              </span>
            )}
            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-amber-300"></div>}
          </div>
        ) : (
          <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/40 shrink-0">
            {item.phase || 'Soon'}
          </span>
        )}
      </button>
    );
  };

  const content = (
    <div className="flex flex-col h-full bg-emerald-950 text-slate-100 border-r border-emerald-900/70 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-emerald-900/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-emerald-600 flex items-center justify-center shadow-md text-emerald-950 font-black">
            <HardHat className="w-6 h-6 text-slate-900" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight text-white leading-tight">
              {COMPANY_NAME}
            </h1>
            <p className="text-[11px] font-medium text-emerald-400 leading-none mt-1">
              Kerala Roadways PMS
            </p>
          </div>
        </div>

        {onCloseMobile && (
          <button 
            onClick={onCloseMobile} 
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-emerald-900/60"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 scrollbar-thin">
        {/* Core Operations Modules */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Active Modules
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
          <div className="space-y-1">
            {functionalItems.map(renderNavItem)}
          </div>
        </div>

        {/* Future Modules */}
        <div>
          <div className="px-3 mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Upcoming Modules</span>
          </div>
          <div className="space-y-1">
            {upcomingItems.map(renderNavItem)}
          </div>
        </div>
      </div>

      {/* PWA In-App Installation Action */}
      <div className="px-4 py-2.5 border-t border-emerald-900/60 bg-emerald-950/60">
        <PWAInstallButton variant="sidebar" />
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-emerald-900/80 bg-emerald-950/70 text-xs text-slate-400">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-300 font-medium">Phase 1 Release</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-800 text-amber-300 text-[10px] font-mono font-bold">
            v1.0.0
          </span>
        </div>
        <p className="text-[10px] text-emerald-400/80 mt-1 truncate">
          Live Firestore Sync Active
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
