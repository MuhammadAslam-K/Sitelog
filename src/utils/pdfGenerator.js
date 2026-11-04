/**
 * PDF Generation Utility for Wage Slips & Muster Rolls
 * Generates exact printable PDF matching the Kerala construction muster slip:
 * - Header: Name: <Employee Name>
 * - Columns: Date | WT (Attendance) | Wages | Adv.Amt | Balance
 * - Summary: Total Working Days, Total Amount, Total Advance Amount, Balance
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Formats a date string (YYYY-MM-DD) to D/M/YYYY or DD/MM/YYYY
 * @param {string} dateStr
 * @returns {string}
 */
function formatSlipDate(dateStr) {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      return `${day}/${month}/${year}`;
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

/**
 * Generates and downloads the Wage Slip PDF exactly matching the user's template
 * @param {string} employeeName - Name of the employee (e.g. "Yunus")
 * @param {Array} entries - Daily wage records for this employee
 * @param {Object} [meta] - Optional extra metadata like employeeId, role, projectName
 */
export function generateWageSlipPDF(employeeName, entries = [], meta = {}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const cleanName = (employeeName || meta.employeeName || 'Worker').trim();
  const sortedEntries = [...entries].sort((a, b) => {
    const dateA = a.date || '';
    const dateB = b.date || '';
    return dateA.localeCompare(dateB); // chronological
  });

  // Calculate working days: Present = 1, Half Day = 0.5, Absent = 0
  let workingDays = 0;
  let totalWages = 0;
  let totalAdvance = 0;
  let totalBalance = 0;

  sortedEntries.forEach((entry) => {
    const att = entry.attendance || 'Present';
    if (att === 'Present') {
      workingDays += 1;
    } else if (att === 'Half Day') {
      workingDays += 0.5;
    }
    // Absent contributes 0 days

    const w = Number(entry.wages) || 0;
    const adv = Number(entry.advance) || 0;
    const bal = entry.balance !== undefined ? Number(entry.balance) : (w - adv);

    totalWages += w;
    totalAdvance += adv;
    totalBalance += bal;
  });

  // Page geometry
  const startX = 20;
  const startY = 25;
  const tableWidth = 170;

  // Title / Company branding (subtle top header)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text('DAILY WAGE MUSTER SLIP', startX, startY - 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  const printDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  doc.text(`Generated: ${printDate}${meta.employeeId ? ` | ID: ${meta.employeeId}` : ''}`, 190, startY - 8, { align: 'right' });

  // Prepare table rows matching screenshot:
  // Date | WT | Wages | Adv.Amt | Balance
  const tableBody = [];

  sortedEntries.forEach((item) => {
    const dateStr = formatSlipDate(item.date);
    // User requirement: "in the WT section insed of x display it as what is there in the attendance"
    const wtText = item.attendance || 'Present';
    const wagesStr = item.wages !== undefined && Number(item.wages) > 0 ? String(item.wages) : (item.attendance === 'Absent / On Leave' ? '0' : String(item.wages || 0));
    const advStr = item.advance !== undefined && Number(item.advance) > 0 ? String(item.advance) : '';
    const balStr = item.balance !== undefined ? String(item.balance) : String((Number(item.wages) || 0) - (Number(item.advance) || 0));

    tableBody.push([dateStr, wtText, wagesStr, advStr, balStr]);
  });

  // Add blank rows if fewer than 7 entries to mimic the physical ledger sheet shown in screenshot
  const targetMinRows = Math.max(7, tableBody.length);
  while (tableBody.length < targetMinRows) {
    tableBody.push(['', '', '', '', '0']);
  }

  // Draw the table with exact column headers and style
  autoTable(doc, {
    startY: startY,
    margin: { left: startX, right: 210 - (startX + tableWidth) },
    tableWidth: tableWidth,
    theme: 'plain',
    head: [
      // Top header cell spanning all columns: "Name: <Employee Name>"
      [
        {
          content: `Name:${cleanName}`,
          colSpan: 5,
          styles: {
            halign: 'left',
            fontStyle: 'bold',
            fontSize: 11,
            fillColor: [248, 250, 252],
            textColor: [15, 23, 42],
            cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
            lineWidth: 0.35,
            lineColor: [30, 41, 59]
          }
        }
      ],
      // Column headers
      [
        { content: 'Date', styles: { halign: 'left' } },
        { content: 'WT', styles: { halign: 'center' } },
        { content: 'Wages', styles: { halign: 'right' } },
        { content: 'Adv.Amt', styles: { halign: 'right' } },
        { content: 'Balance', styles: { halign: 'right' } }
      ]
    ],
    body: tableBody,
    styles: {
      font: 'helvetica',
      fontSize: 10,
      textColor: [15, 23, 42],
      lineWidth: 0.35,
      lineColor: [30, 41, 59],
      cellPadding: { top: 3.5, bottom: 3.5, left: 3.5, right: 3.5 }
    },
    headStyles: {
      fontStyle: 'bold',
      fontSize: 10.5,
      textColor: [15, 23, 42],
      fillColor: [241, 245, 249],
      lineWidth: 0.35,
      lineColor: [30, 41, 59]
    },
    columnStyles: {
      0: { cellWidth: 38, halign: 'left' },
      1: { cellWidth: 38, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 34, halign: 'right' }
    },
    didDrawCell: function () {
      // Keep standard table border lines
    }
  });

  // Calculate bottom summary box Y position
  const finalY = doc.lastAutoTable.finalY;

  // Draw Summary Section exactly like the screenshot:
  // Total Working Days :1
  // Total Amount :1000
  // Total Advance Amount :
  // Balance :1000
  const boxHeight = 32;

  // Draw enclosing rectangle with the same table border style
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.35);
  doc.setFillColor(255, 255, 255);
  doc.rect(startX, finalY, tableWidth, boxHeight, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);

  const leftMargin = startX + 4;
  const lineSpacing = 6.8;
  let textY = finalY + 6.2;

  // Line 1: Total Working Days : <workingDays>
  doc.text(`Total Working Days :${workingDays}`, leftMargin, textY);
  textY += lineSpacing;

  // Line 2: Total Amount : <totalWages>
  doc.text(`Total Amount :${totalWages}`, leftMargin, textY);
  textY += lineSpacing;

  // Line 3: Total Advance Amount : <totalAdvance>
  const advText = totalAdvance > 0 ? String(totalAdvance) : '';
  doc.text(`Total Advance Amount :${advText}`, leftMargin, textY);
  textY += lineSpacing;

  // Line 4: Balance : <totalBalance>
  doc.text(`Balance :${totalBalance}`, leftMargin, textY);

  // Bottom footer notes / signature block
  const footerY = finalY + boxHeight + 14;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Employee Signature: _____________________', startX, footerY);
  doc.text('Site In-Charge: _____________________', startX + tableWidth - 60, footerY);

  // Trigger download
  const safeFilename = cleanName.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Wage_Slip_${safeFilename}.pdf`);
}

/**
 * Generates a full Daily Wage muster statement PDF for all filtered entries
 * @param {Array} wages - Wage list
 * @param {string} filterTitle - Description of filter applied
 */
export function generateConsolidatedWagesPDF(wages = [], filterTitle = 'Daily Wages Muster Roll') {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const startX = 14;
  const startY = 20;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('KERALA ROAD CONSTRUCTION - DAILY WAGES MUSTER', startX, startY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Filter / Period: ${filterTitle} | Total Records: ${wages.length}`, startX, startY + 6);
  doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 280, startY + 6, { align: 'right' });

  let totalWages = 0;
  let totalAdvance = 0;
  let totalBalance = 0;

  const rows = wages.map((w) => {
    const earned = Number(w.wages) || 0;
    const adv = Number(w.advance) || 0;
    const bal = w.balance !== undefined ? Number(w.balance) : (earned - adv);

    totalWages += earned;
    totalAdvance += adv;
    totalBalance += bal;

    return [
      w.wageId || '',
      formatSlipDate(w.date),
      w.employeeName || '',
      w.projectName || '',
      w.attendance || 'Present',
      `₹${earned}`,
      `₹${adv}`,
      `₹${bal}`,
      w.status || 'Pending'
    ];
  });

  autoTable(doc, {
    startY: startY + 12,
    margin: { left: startX, right: 14 },
    theme: 'grid',
    head: [[
      'Wage ID',
      'Date',
      'Employee Name',
      'Project Work Site',
      'Attendance (WT)',
      'Wages',
      'Adv. Amt',
      'Balance',
      'Status'
    ]],
    body: rows,
    styles: {
      fontSize: 8.5,
      cellPadding: 2.5
    },
    headStyles: {
      fillColor: [16, 85, 60], // Emerald-800
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 24 },
      2: { cellWidth: 42 },
      3: { cellWidth: 65 },
      4: { cellWidth: 30, halign: 'center' },
      5: { cellWidth: 24, halign: 'right' },
      6: { cellWidth: 24, halign: 'right' },
      7: { cellWidth: 24, halign: 'right' },
      8: { cellWidth: 20, halign: 'center' }
    }
  });

  // Footer totals
  const finalY = doc.lastAutoTable.finalY + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(
    `Summary Totals - Wages: ₹${totalWages} | Advances Paid: ₹${totalAdvance} | Net Balance: ₹${totalBalance}`,
    startX,
    finalY
  );

  doc.save(`Daily_Wages_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}
