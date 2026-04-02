export function buildStudentMap(rows) {
  const map = {};
  for (const row of rows) {
    const rollKey = normalizeRoll(row['Roll No.'] || '');
    if (rollKey) map[rollKey] = row;
  }
  return map;
}

export function normalizeRoll(roll) {
  return roll.trim().toUpperCase();
}

export function parseMealSummary(studentRow) {
  return {
    mealCount:  studentRow['Meal Count']        || '0',
    messbill:   studentRow['Mess Bill']         || '0',
    arrears:    studentRow['Arrears with Fine'] || '0',
    grossTotal: studentRow['Gross Total']       || '0',
    collection: studentRow['Collection']        || '0',
    pending:    studentRow['Pending']           || '0',
  };
}

// Short month names matching the sheet naming convention e.g. "Feb_26"
export const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const MONTH_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Builds the sheet name from a month index (0-based) and full year.
 * e.g. month=1, year=2026 → "Feb_26"
 */
export function buildSheetName(month, year) {
  const yy = String(year).slice(-2);
  return `${MONTH_NAMES[month]}_${yy}`;
}

// The earliest year we have data for
export const MIN_YEAR = 2025;
