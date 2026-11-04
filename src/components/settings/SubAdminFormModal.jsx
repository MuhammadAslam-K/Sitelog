import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  User, 
  Mail, 
  Lock, 
  Briefcase, 
  Shield, 
  Save, 
  AlertCircle,
  Eye,
  Edit3,
  Ban,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { SYSTEM_MODULES, ACCESS_LEVELS } from '../../utils/constants.js';

export function SubAdminFormModal({
  isOpen,
  onClose,
  onSave,
  initialData = null
}) {
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    designation: 'Site Supervisor',
    status: 'Active',
    permissions: {}
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        username: initialData.username || '',
        email: initialData.email || '',
        password: '', // Blank unless updating password
        designation: initialData.designation || 'Site Supervisor',
        status: initialData.status || 'Active',
        permissions: initialData.permissions || {}
      });
    } else {
      // Default all modules to 'view'
      const initialPerms = {};
      SYSTEM_MODULES.forEach((mod) => {
        initialPerms[mod.id] = 'view';
      });

      setFormData({
        name: '',
        username: '',
        email: '',
        password: '',
        designation: 'Site Supervisor',
        status: 'Active',
        permissions: initialPerms
      });
    }
    setValidationErrors({});
  }, [initialData, isOpen]);

  const handlePermissionChange = (moduleId, level) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleId]: level
      }
    }));
  };

  const setAllPermissions = (level) => {
    const updated = {};
    SYSTEM_MODULES.forEach((mod) => {
      updated[mod.id] = level;
    });
    setFormData((prev) => ({
      ...prev,
      permissions: updated
    }));
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.username.trim()) errors.username = 'Username is required';
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errors.email = 'A valid email is required (for password recovery)';
    }

    if (!isEditMode) {
      if (!formData.password || formData.password.length < 4) {
        errors.password = 'Initial password must be at least 4 characters';
      }
    } else if (formData.password && formData.password.length < 4) {
      errors.password = 'Password must be at least 4 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave(formData, initialData?.userId || initialData?.id);
      onClose();
    } catch (err) {
      setValidationErrors((prev) => ({
        ...prev,
        submit: err.message || 'Failed to save sub-admin account.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? `Edit Sub-Admin: ${initialData.name}` : 'Create Sub-Admin / Staff Account'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {validationErrors.submit && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{validationErrors.submit}</span>
          </div>
        )}

        {/* Profile Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Full Legal Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Rahul K. Nair"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>
            {validationErrors.name && (
              <p className="text-[11px] text-rose-600 mt-1">{validationErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Username for Login <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Shield className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. rahul.site"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={isEditMode}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-mono rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-100 disabled:text-slate-500"
                required
              />
            </div>
            {validationErrors.username && (
              <p className="text-[11px] text-rose-600 mt-1">{validationErrors.username}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Registered Email (for Password Reset) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="e.g. rahul@keralaroadways.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>
            {validationErrors.email && (
              <p className="text-[11px] text-rose-600 mt-1">{validationErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isEditMode ? 'Change Password (leave empty to keep current)' : 'Account Password *'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                placeholder={isEditMode ? '••••••••' : 'Min 4 characters'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-mono rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required={!isEditMode}
              />
            </div>
            {validationErrors.password && (
              <p className="text-[11px] text-rose-600 mt-1">{validationErrors.password}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Designation / Role Title
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Site Supervisor, Field Engineer, Auditor"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Account Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="Active">Active (Can Log In)</option>
              <option value="Disabled">Disabled (Access Revoked)</option>
            </select>
          </div>
        </div>

        {/* Granular Module Access Control Matrix */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-700" />
                <span>Module Permissions & Access Matrix</span>
              </h4>
              <p className="text-[11px] text-slate-500">
                Configure whether this sub-admin can View, View & Edit, or has No Access to each module.
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setAllPermissions('view')}
                className="text-[10px] font-bold px-2 py-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors"
              >
                All View
              </button>
              <button
                type="button"
                onClick={() => setAllPermissions('edit')}
                className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
              >
                All Edit
              </button>
              <button
                type="button"
                onClick={() => setAllPermissions('none')}
                className="text-[10px] font-bold px-2 py-1 rounded bg-rose-100 text-rose-800 hover:bg-rose-200 transition-colors"
              >
                All None
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-200 bg-white rounded-xl border border-slate-200 overflow-hidden text-xs">
            {SYSTEM_MODULES.map((module) => {
              const currentLevel = formData.permissions[module.id] || 'none';

              return (
                <div 
                  key={module.id} 
                  className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 block truncate">
                      {module.label}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate block">
                      {module.description}
                    </span>
                  </div>

                  {/* 3 Radio Pills */}
                  <div className="flex items-center gap-1 shrink-0 bg-slate-100 p-1 rounded-xl">
                    {ACCESS_LEVELS.map((lvl) => {
                      const isSelected = currentLevel === lvl.id;
                      let activeStyle = '';
                      if (isSelected) {
                        if (lvl.id === 'none') activeStyle = 'bg-rose-600 text-white font-bold shadow-xs';
                        else if (lvl.id === 'view') activeStyle = 'bg-amber-500 text-slate-950 font-bold shadow-xs';
                        else if (lvl.id === 'edit') activeStyle = 'bg-emerald-700 text-white font-bold shadow-xs';
                      } else {
                        activeStyle = 'text-slate-600 hover:text-slate-900';
                      }

                      return (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() => handlePermissionChange(module.id, lvl.id)}
                          className={`px-2.5 py-1 text-[11px] rounded-lg transition-all ${activeStyle}`}
                        >
                          {lvl.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-xl transition-colors shadow-xs flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : isEditMode ? 'Update Sub-Admin' : 'Create Sub-Admin'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
