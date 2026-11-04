/**
 * Wage Calculation & Synchronization Utilities
 * Maps daily muster roll entries, attendance standings, and payment statuses
 * directly into employee wage ledger balances (Pending, Paid, and Total).
 */

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
    const wages = Number(entry.wages) || 0;
    const advance = Number(entry.advance) || 0;
    const balance = Number(entry.balance) !== undefined ? Number(entry.balance) : (wages - advance);
    const isLeave = entry.attendance === 'Absent / On Leave';
    
    // Determine effective status
    let status = entry.status;
    if (!status) {
      if (isLeave) {
        status = advance > 0 ? 'Advance on Leave' : 'Pending';
      } else if (balance <= 0 && wages > 0) {
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

    if (isLeave) {
      // Absent worker scenario: ₹0 wages earned, but advance is cash paid out
      totalPaid += advance;
      if (status !== 'Paid') {
        netPending -= advance; // Reduces pending wages liability or creates advance owed
      }
    } else if (status === 'Paid') {
      // Wage has been fully disbursed/settled
      totalEarned += wages;
      totalPaid += wages;
      // 0 remains pending for this shift
    } else if (status === 'Pending') {
      // No advance paid, entire earned wage is pending
      totalEarned += wages;
      netPending += wages;
    } else if (status === 'Partial') {
      // Partial status: advance was paid, remaining balance is pending
      totalEarned += wages;
      totalPaid += advance;
      netPending += balance;
    } else {
      // Fallback
      totalEarned += wages;
      totalPaid += advance;
      netPending += balance;
    }
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
