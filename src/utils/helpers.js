/**
 * Converts an array of student row objects into a hashmap keyed by Roll No.
 * Enables O(1) lookup instead of O(n) array search.
 * The actual column name in the sheet is "Roll No." (with a period).
 */
export function buildStudentMap(rows) {
  const map = {};
  for (const row of rows) {
    const rollKey = normalizeRoll(row['Roll No.'] || '');
    if (rollKey) {
      map[rollKey] = row;
    }
  }
  return map;
}

/**
 * Normalizes a roll number: trim + uppercase for case-insensitive matching.
 */
export function normalizeRoll(roll) {
  return roll.trim().toUpperCase();
}

/**
 * Parses meal attendance from a student row.
 * The sheet stores meal count in the "Meal Count" column directly.
 * Individual day columns follow the pattern "B/L/D" sub-headers under date columns.
 * For now we surface the pre-computed Meal Count and bill fields.
 */
export function parseMealSummary(studentRow) {
  return {
    mealCount: studentRow['Meal Count'] || '0',
    messbill:  studentRow['Mess Bill']  || '0',
    arrears:   studentRow['Arrears with Fine'] || '0',
    grossTotal: studentRow['Gross Total'] || '0',
    collection: studentRow['Collection'] || '0',
    pending:    studentRow['Pending']    || '0',
  };
}

/**
 * Available months — extend as new sheets are added.
 */
export const AVAILABLE_MONTHS = [
  { label: 'February 2026', value: 'Feb_26' },
  { label: 'March 2026',    value: 'Mar_26' },
  { label: 'April 2026',    value: 'Apr_26' },
];
