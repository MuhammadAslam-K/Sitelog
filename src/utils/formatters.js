/**
 * Formatting utilities for Kerala Road Construction Management System
 */

import { DEFAULT_SUPER_ADMIN } from './constants.js';

/**
 * Formats a number to Indian Rupee standard format (e.g., ₹1,25,00,000)
 * @param {number|string} amount
 * @returns {string}
 */
export function formatIndianCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  const numericAmount = Math.round(Number(amount));
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(numericAmount);
}

/**
 * Formats a number to Indian Rupee standard compact format (e.g., ₹1.25 Cr, ₹45.5 L)
 * @param {number|string} amount
 * @returns {string}
 */
export function formatIndianCompact(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  const num = Number(amount);
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  }
  if (num >= 1000) {
    return `₹${(num / 1000).toFixed(1)} K`;
  }
  return formatIndianCurrency(num);
}

/**
 * Formats an ISO date or YYYY-MM-DD into readable DD-MM-YYYY format
 * Strictly ensures day-first ordering (DD-MM-YYYY) without timezone shifts.
 * @param {string|Date} dateVal
 * @returns {string}
 */
export function formatDate(dateVal) {
  if (!dateVal) return '-';
  try {
    if (typeof dateVal === 'string') {
      const trimmed = dateVal.trim();
      // Directly parse YYYY-MM-DD or ISO string without UTC timezone offset corruption
      const match = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (match) {
        const year = match[1];
        const month = match[2].padStart(2, '0');
        const day = match[3].padStart(2, '0');
        return `${day}-${month}-${year}`;
      }
    }

    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return String(dateVal);
  }
}

/**
 * Parses user currency input to clean positive number
 * @param {string|number} value
 * @returns {number}
 */
export function parseCurrencyInput(value) {
  if (typeof value === 'number') return isNaN(value) ? 0 : Math.max(0, value);
  if (!value) return 0;
  const cleaned = String(value).replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
}

/**
 * Automatically calculates Total Budget = Other Total Expenses + Total Labour Expenses
 * @param {number} otherExp
 * @param {number} labourExp
 * @returns {number}
 */
export function calculateTotalBudget(otherExp, labourExp) {
  const o = Number(otherExp) || 0;
  const l = Number(labourExp) || 0;
  return Math.round((o + l) * 100) / 100;
}

/**
 * Returns canonical attribution label for the active user:
 * - Super Admin -> "Admin"
 * - Sub-Admin   -> User's full name (fallback to username/email)
 * @param {Object|null} user
 * @returns {string}
 */
export function getActorDisplayName(user) {
  if (!user) return 'Admin';

  const emailLower = (user.email || '').trim().toLowerCase();
  const isSuper =
    user.role === 'Super Admin' ||
    user.userId === DEFAULT_SUPER_ADMIN.userId ||
    emailLower === DEFAULT_SUPER_ADMIN.email.toLowerCase();

  if (isSuper) {
    return 'Admin';
  }

  return (user.name || user.username || user.email || 'Sub Admin').trim();
}

/**
 * Normalizes a stored createdBy / updatedBy / settledBy value for display:
 * Maps Super Admin identifiers (email, userId, name) to "Admin" and preserves sub-admin names.
 * @param {string|null|undefined} rawValue
 * @returns {string}
 */
export function formatRecordedBy(rawValue) {
  if (!rawValue) return 'Admin';
  const trimmed = String(rawValue).trim();
  if (!trimmed) return 'Admin';

  const lower = trimmed.toLowerCase();
  if (
    lower === 'admin' ||
    lower === 'super admin' ||
    lower === DEFAULT_SUPER_ADMIN.email.toLowerCase() ||
    lower === DEFAULT_SUPER_ADMIN.userId.toLowerCase() ||
    lower === DEFAULT_SUPER_ADMIN.name.toLowerCase()
  ) {
    return 'Admin';
  }

  return trimmed;
}

