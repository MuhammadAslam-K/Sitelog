import React, { useState } from 'react';
import { 
  Settings, 
  Users, 
  ShieldCheck, 
  UserPlus, 
  KeyRound, 
  Mail, 
  Lock, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Power,
  ShieldAlert,
  Building2,
  Boxes,
  Coins,
  Receipt,
  Eye,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { SYSTEM_MODULES, ACCESS_LEVELS, DEFAULT_SUPER_ADMIN } from '../../utils/constants.js';

export function SettingsView({
  systemUsers = [],
  onAddNewSubAdmin,
  onEditSubAdmin,
  onDeleteSubAdmin,
  onToggleUserStatus,
  onOpenPasswordReset
}) {
  const { currentUser, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('subAdmins');

  const subAdmins = systemUsers.filter((u) => u.role !== 'Super Admin');
  const superAdmin = systemUsers.find((u) => u.role === 'Super Admin') || DEFAULT_SUPER_ADMIN;

  const getPermissionBadge = (level) => {
    switch (level) {
      case 'edit':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#0F8B78]/10 text-[#0F8B78] border border-[#0F8B78]/25">
            Edit
          </span>
        );
      case 'view':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F4B740]/15 text-[#b27918] border border-[#F4B740]/30">
            View
          </span>
        );
      case 'none':
      default:
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-[#64748B]">
            None
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#0F8B78]/10 text-[#0F8B78] border border-[#0F8B78]/20">
              Phase 8
            </span>
            <span className="text-xs text-[#64748B] font-medium">System Administration & Access Control</span>
          </div>
          <h2 className="text-2xl font-black text-[#172B4D] tracking-tight flex items-center gap-2">
            <Settings className="w-7 h-7 text-[#0F8B78]" />
            <span>Settings & Access Control (RBAC)</span>
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Manage super admin credentials, email verification password resets, and configure granular permissions for sub-admins.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenPasswordReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#172B4D] bg-white hover:bg-slate-50 border border-[#E2E8F0] rounded-xl transition-all shadow-2xs"
          >
            <KeyRound className="w-4 h-4 text-[#0F8B78]" />
            <span>Reset Password via Email</span>
          </button>

          {isSuperAdmin && (
            <button
              onClick={onAddNewSubAdmin}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#0F8B78] hover:bg-[#0d7867] rounded-xl transition-all shadow-2xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Sub-Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Super Admin Identity Showcase Banner */}
      <div className="p-5 rounded-2xl bg-[#172B4D] text-white shadow-2xs border border-[#213963] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0F8B78] text-white flex items-center justify-center font-black text-lg shadow-md shrink-0 border border-teal-400/30">
            MA
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-extrabold text-white">
                {superAdmin.name || 'Muhammad Aslam'}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F4B740] text-slate-950">
                Super Admin
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-teal-200 border border-white/15">
                Username: {superAdmin.username}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-amber-300" />
                Recovery Email: <strong className="text-white">{superAdmin.email || 'aslamka.2k3@gmail.com'}</strong>
              </span>
              <span>•</span>
              <span className="text-teal-300">Unrestricted Access to All Modules</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenPasswordReset}
            className="px-3.5 py-2 text-xs font-bold text-slate-950 bg-[#F4B740] hover:bg-amber-300 rounded-xl transition-colors shadow-2xs"
          >
            Change / Reset Password
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E2E8F0]">
        <nav className="flex space-x-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('subAdmins')}
            className={`pb-3 flex items-center gap-2 transition-all ${
              activeTab === 'subAdmins'
                ? 'border-b-2 border-[#0F8B78] text-[#0F8B78]'
                : 'text-[#64748B] hover:text-[#172B4D]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Sub-Admin Directory & Permissions ({subAdmins.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 flex items-center gap-2 transition-all ${
              activeTab === 'security'
                ? 'border-b-2 border-[#0F8B78] text-[#0F8B78]'
                : 'text-[#64748B] hover:text-[#172B4D]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Authentication Rules & Recovery Policy</span>
          </button>
        </nav>
      </div>

      {/* Tab 1: Sub-Admin Directory */}
      {activeTab === 'subAdmins' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-xl border border-[#E2E8F0] text-xs">
            <div>
              <h4 className="font-bold text-[#172B4D]">Configured Sub-Admins & Staff Accounts</h4>
              <p className="text-[#64748B]">
                Sub-admins have custom access configured per module (View Only, View & Edit, or No Access).
              </p>
            </div>
            {isSuperAdmin && (
              <button
                onClick={onAddNewSubAdmin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#0F8B78] bg-[#0F8B78]/10 hover:bg-[#0F8B78]/20 border border-[#0F8B78]/25 rounded-lg transition-colors shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Sub-Admin</span>
              </button>
            )}
          </div>

          {subAdmins.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center">
              <div className="w-12 h-12 bg-slate-100 text-[#64748B] rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#172B4D]">No Sub-Admins Configured Yet</h4>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1 mb-4">
                Create sub-admins to give your site supervisors, engineers, and accountants selected access to specific PMS modules.
              </p>
              {isSuperAdmin && (
                <button
                  onClick={onAddNewSubAdmin}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#0F8B78] hover:bg-[#0d7867] rounded-xl transition-all shadow-2xs"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create First Sub-Admin</span>
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-xl border border-[#E2E8F0] shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#64748B] font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Username & Email</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Module Permissions Matrix</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {subAdmins.map((user) => (
                    <tr key={user.userId || user.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Designation */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#172B4D]">{user.name}</div>
                        <div className="text-[11px] text-[#0F8B78] font-medium">
                          {user.designation || 'Site Supervisor'}
                        </div>
                      </td>

                      {/* Username & Email */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-[#172B4D]">
                          {user.username}
                        </div>
                        <div className="text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-[#64748B]" />
                          <span>{user.email}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            user.status === 'Active'
                              ? 'bg-[#0F8B78]/10 text-[#0F8B78] border border-[#0F8B78]/25'
                              : 'bg-rose-50 text-[#DC5353] border border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.status === 'Active' ? 'bg-[#0F8B78]' : 'bg-[#DC5353]'
                            }`}
                          />
                          <span>{user.status || 'Active'}</span>
                        </span>
                      </td>

                      {/* Permissions Breakdown */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-md">
                          {SYSTEM_MODULES.slice(0, 5).map((m) => {
                            const level = user.permissions?.[m.id] || 'none';
                            return (
                              <div
                                key={m.id}
                                className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-slate-50 border border-[#E2E8F0]"
                              >
                                <span className="text-[#64748B] font-medium truncate max-w-[80px]">
                                  {m.label.split(' ')[0]}:
                                </span>
                                {getPermissionBadge(level)}
                              </div>
                            );
                          })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onEditSubAdmin(user)}
                            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F8B78] hover:bg-[#0F8B78]/10 transition-colors"
                            title="Edit Sub-Admin & Permissions"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onToggleUserStatus(user)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              user.status === 'Active'
                                ? 'text-[#F4B740] hover:bg-amber-50'
                                : 'text-[#0F8B78] hover:bg-[#0F8B78]/10'
                            }`}
                            title={user.status === 'Active' ? 'Disable Account' : 'Activate Account'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onDeleteSubAdmin(user)}
                            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#DC5353] hover:bg-rose-50 transition-colors"
                            title="Delete Sub-Admin"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Security & Recovery Policy */}
      {activeTab === 'security' && (
        <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] space-y-5 shadow-2xs">
          <div>
            <h3 className="text-base font-bold text-[#172B4D] tracking-tight">
              Kerala Roadways Security & Password Recovery Architecture
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Strict identity validation protocols for administrative and site workforce logins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0] space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-[#172B4D]">
                <ShieldCheck className="w-4 h-4 text-[#0F8B78]" />
                <span>Super Admin Account Policy</span>
              </div>
              <p className="text-[#64748B] leading-relaxed">
                The primary Super Admin has master authority over all tenders, roadwork contracts, workforce rosters, muster rolls, and site materials.
              </p>
              <div className="pt-2 border-t border-[#E2E8F0] space-y-1 font-mono text-[11px] text-[#172B4D]">
                <div>Username: <strong>Muhammad Aslam</strong></div>
                <div>Role: <strong>Super Admin</strong></div>
                <div>Primary Email: <strong>aslamka.2k3@gmail.com</strong></div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0] space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-[#172B4D]">
                <KeyRound className="w-4 h-4 text-[#0F8B78]" />
                <span>Password Reset by Registered Email</span>
              </div>
              <p className="text-[#64748B] leading-relaxed">
                When a user clicks "Reset Password", the system requires entering the exact registered email ID. If the email matches the registry, identity is validated and a new password can be configured immediately.
              </p>
              <div className="pt-2">
                <button
                  onClick={onOpenPasswordReset}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-[#0F8B78] hover:bg-[#0d7867] rounded-lg transition-colors shadow-2xs"
                >
                  Launch Reset Flow Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
