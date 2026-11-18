/**
 * Wage Calculation & Synchronization Utilities
 * Maps daily muster roll entries, attendance standings, and payment statuses
 * directly into employee wage ledger balances (Pending, Paid, and Total).
 */

/**
 * Calculates the true remaining payable balance for a single daily wage entry.
 * - Handles over-advances (advance > wages, or advance on leave) so excess cash
 *   always offsets other pending days even if status was auto-set to 'Paid'.
 * - When status is 'Paid' and advance <= wages (or over-advance was explicitly settled),
 *   the remaining payable balance is strictly 0.
 * @param {Object} entry
 * @returns {number}
 */
export function getWagePayableBalance(entry) {
  if (!entry) return 0;
  const isLeave = entry.attendance === 'Absent / On Leave';
  const wages = isLeave ? 0 : (Number(entry.wages) || 0);
  const advance = Number(entry.advance) || 0;
  const status = entry.status;

  // Over-advance exists whenever cash disbursed exceeds wages earned for that shift
  const isOverAdvance = advance > wages;

  if (status === 'Paid') {
    if (isOverAdvance && !entry.overAdvanceSettled) {
      return Math.round((wages - advance) * 100) / 100;
    }
    return 0;
  }

  if (isLeave) {
    return -advance;
  }

  const rawBalance = entry.balance !== undefined ? Number(entry.balance) : (wages - advance);
  if (!status && rawBalance <= 0 && wages > 0 && !isOverAdvance) {
    return 0;
  }
  return Math.round((wages - advance) * 100) / 100;
}

/**
 * Calculates the total money disbursed/paid out for a single daily wage entry.
 * - Uses `settledPaidAmount` when explicitly batch-settled alongside an over-advance offset.
 * - When status is 'Paid', returns Math.max(wages, advance) so over-advances count full cash paid.
 * - When 'Pending' / 'Partial' / 'Advance on Leave', returns the advance disbursed.
 * @param {Object} entry
 * @returns {number}
 */
export function getWagePaidAmount(entry) {
  if (!entry) return 0;
  if (typeof entry.settledPaidAmount === 'number' && !isNaN(entry.settledPaidAmount)) {
    return entry.settledPaidAmount;
  }

  const isLeave = entry.attendance === 'Absent / On Leave';
  const wages = isLeave ? 0 : (Number(entry.wages) || 0);
  const advance = Number(entry.advance) || 0;
  const status = entry.status;

  if (isLeave) {
    return advance;
  }
  if (status === 'Paid') {
    return Math.max(wages, advance);
  }
  return advance;
}

/**
 * Calculates live wage balances for an employee from their daily wage entries
 * @param {Object} employee - The employee document
 * @param {Array} dailyWageEntries - All daily wage entries from the database
 * @returns {Object} { pendingWages, paidWages, totalWages, advanceOwed, wageEntriesCount }
 */
export function calculateEmployeeWageReflection(employee, dailyWageEntries = []) {
  if (!employee) {
    return { pendingWages: 0, paidWages: 0, totalWages: 0, advanceOwed: 0, wageEntriesCount: 0 };
  }

  // Filter entries for this specific employee
  const employeeEntries = dailyWageEntries.filter(
    (w) => w.employeeId === employee.employeeId
  );

  // If no daily wage records exist yet for this employee, fallback to the baseline values on the employee document
  if (employeeEntries.length === 0) {
    const pending = Number(employee.pendingWages) || 0;
    const paid = Number(employee.paidWages) || 0;
    const total = Number(employee.totalWages) || (pending + paid);
    return {
      pendingWages: pending,
      paidWages: paid,
      totalWages: total,
      advanceOwed: 0,
      wageEntriesCount: 0,
      hasLiveEntries: false
    };
  }

  let totalEarned = 0;
  let totalPaid = 0;
  let netPending = 0;

  const statusBreakdown = {
    Paid: 0,
    Pending: 0,
    Partial: 0,
    'Advance on Leave': 0
  };

  // Sort employee entries by date descending
  const sortedEntries = [...employeeEntries].sort((a, b) => {
    const dateA = a.date || '';
    const dateB = b.date || '';
    return dateB.localeCompare(dateA);
  });

  sortedEntries.forEach((entry) => {
    const isLeave = entry.attendance === 'Absent / On Leave';
    const wages = isLeave ? 0 : (Number(entry.wages) || 0);
    const advance = Number(entry.advance) || 0;
    const rawBalance = wages - advance;

    // Determine effective status
    let status = entry.status;
    if (!status) {
      if (isLeave) {
        status = advance > 0 ? 'Advance on Leave' : 'Pending';
      } else if (rawBalance === 0 && wages > 0) {
        status = 'Paid';
      } else if (advance > 0) {
        status = 'Partial';
      } else {
        status = 'Pending';
      }
    }

    if (statusBreakdown[status] !== undefined) {
      statusBreakdown[status]++;
    }

    totalEarned += wages;
    totalPaid += getWagePaidAmount(entry);
    netPending += getWagePayableBalance(entry);
  });

  const pendingWages = Math.max(0, netPending);
  const advanceOwed = netPending < 0 ? Math.abs(netPending) : 0;
  const totalWages = totalEarned;

  return {
    pendingWages: Math.round(pendingWages * 100) / 100,
    paidWages: Math.round(totalPaid * 100) / 100,
    totalWages: Math.round(totalWages * 100) / 100,
    advanceOwed: Math.round(advanceOwed * 100) / 100,
    wageEntriesCount: sortedEntries.length,
    statusBreakdown,
    entries: sortedEntries,
    hasLiveEntries: true
  };
}
