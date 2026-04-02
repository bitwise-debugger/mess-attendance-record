export function normalizeRoll(roll) {
  return roll.trim().toUpperCase();
}

export function buildSheetName(month, year) {
  return `${MONTH_NAMES[month]}_${String(year).slice(-2)}`;
}

export const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const MONTH_FULL  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
export const MIN_YEAR    = 2025;

export function buildStudentMap(rows) {
  const map = {};
  for (const row of rows) {
    const key = normalizeRoll(row['Roll No.'] || '');
    if (key) map[key] = row;
  }
  return map;
}

/**
 * Parses meal count string. Handles multiple formats:
 *   "B/L:30 |D:24 | Total: 54"   — local CSV format
 *   "B:1"                         — live sheet sparse format
 *   "D:20"                        — dinner only
 */
export function parseMealCount(str) {
  if (!str) return { bl: 0, d: 0, total: 0 };
  // B/L:N  or  B:N  (both map to bl slot)
  const bl    = str.match(/B(?:\/L)?\s*:\s*([\d,]+)/i);
  const d     = str.match(/\bD\s*:\s*([\d,]+)/i);
  const total = str.match(/Total\s*:\s*([\d,]+)/i);
  const blVal    = bl    ? parseInt(bl[1].replace(/,/g,''),    10) : 0;
  const dVal     = d     ? parseInt(d[1].replace(/,/g,''),     10) : 0;
  const totalVal = total ? parseInt(total[1].replace(/,/g,''), 10) : blVal + dVal;
  return { bl: blVal, d: dVal, total: totalVal };
}

/**
 * Builds per-day attendance from a student's raw column array + colMeta.
 *
 * Cell value semantics (confirmed from data):
 *   empty string → absent
 *   numeric string (e.g. "150", "190") → attended; value = price paid for that meal
 *
 * Returns ordered array of ALL days in the sheet:
 *   { date, dayOfWeek, blPrice, dPrice, cost }
 *   blPrice / dPrice = 0 if absent, >0 if attended
 *   cost = blPrice + dPrice
 */
export function parseDailyAttendance(rawCols, colMeta) {
  const dayMap = {};   // date → { date, dayOfWeek, blPrice, dPrice }
  const order  = [];   // unique dates in sheet order

  for (const { colIndex, date, dayOfWeek, mealType } of colMeta) {
    if (!dayMap[date]) {
      dayMap[date] = { date, dayOfWeek, blPrice: 0, dPrice: 0 };
      order.push(date);
    }
    const raw   = (rawCols[colIndex] || '').trim();
    const price = raw ? parseInt(raw.replace(/,/g, ''), 10) || 0 : 0;
    if (!price) continue;   // absent

    if (mealType.toUpperCase() === 'D') {
      dayMap[date].dPrice = price;
    } else {
      // B, L, S → all the same B/L slot
      dayMap[date].blPrice = price;
    }
  }

  return order.map((date) => {
    const d = dayMap[date];
    return { ...d, cost: d.blPrice + d.dPrice };
  });
}

// Day-of-week helpers
const DOW_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Groups daily attendance into calendar months, each with a 7-column week grid.
 * Returns [{ monthLabel, weeks: [[ cell|null × 7 ]] }]
 * cell = day object from parseDailyAttendance, null = empty grid slot
 */
export function buildCalendarGrid(days) {
  if (!days.length) return [];

  // Group by month label ("Feb", "Mar", …)
  const groups = {};
  const order  = [];
  for (const day of days) {
    const month = day.date.split('-')[1];
    if (!groups[month]) { groups[month] = []; order.push(month); }
    groups[month].push(day);
  }

  return order.map((month) => {
    const mDays   = groups[month];
    const firstDow = DOW_INDEX[mDays[0].dayOfWeek] ?? 0;
    const cells   = [...Array(firstDow).fill(null), ...mDays];
    const weeks   = [];
    for (let i = 0; i < cells.length; i += 7) {
      const w = cells.slice(i, i + 7);
      while (w.length < 7) w.push(null);
      weeks.push(w);
    }
    return { monthLabel: month, weeks };
  });
}
