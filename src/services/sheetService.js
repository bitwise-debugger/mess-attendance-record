import Papa from 'papaparse';

const SHEET_ID = '1T1vZtKmMtxPCk_7Mp-ymbNOZRUgpipqXZ97wxmu9EfI';

/*
 * Sheet structure (0-based row indices):
 *   Row 0  — title / totals metadata
 *   Row 1  — date range / bill info
 *   Row 2  — column headers
 *            col 0  : Sr.#  (empty in some sheets)
 *            col 1  : Hostel
 *            col 2  : Room #
 *            col 3  : Roll No.
 *            col 4  : Name
 *            col 5  : Meal Count
 *            col 6  : Heads (total bill) — present in some sheets, empty in others
 *            col 7  : Mess Bill
 *            col 8  : Arrears with Fine
 *            col 9  : Gross Total
 *            col 10 : Collection
 *            col 11 : Pending
 *            col 12 : 'Day' label
 *            col 13+: attendance columns (pairs: B/L col, D col per day)
 *   Row 3  — date labels  (1-Feb, , 2-Feb, , …)
 *   Row 4  — meal types   (B/L/D at col12; then B,D,B,D,… OR all empty)
 *   Row 5  — price reference row (per-meal prices)
 *   Row 6+ — student data
 *
 * Cell value semantics for attendance columns:
 *   empty string → absent
 *   numeric string (e.g. "150", "190") → attended; value IS the price paid
 *
 * When row 4 has no individual B/L/D labels (live sheet template),
 * we infer: first col of each date pair = B/L, second = D.
 */

export function buildSheetUrl(sheetName) {
  // The /export endpoint returns the full sheet data correctly.
  // The /gviz/tq endpoint returns a truncated/template version for this sheet.
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&sheet=${encodeURIComponent(sheetName)}`;
}

export async function fetchSheetData(sheetName) {
  const url = buildSheetUrl(sheetName);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch sheet "${sheetName}": ${response.status}`);
  }

  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: false,
      skipEmptyLines: false,
      transform: (v) => v.trim(),
      complete: ({ data: rows }) => {
        if (!rows || rows.length < 7) {
          return reject(new Error('Sheet has unexpected structure or is empty.'));
        }

        const dayRow   = rows[2];  // day-of-week names
        const datesRow = rows[3];  // date labels
        const mealsRow = rows[4];  // B/L/D labels (may be empty after col 12)

        // ── Build colMeta ──────────────────────────────────────────────
        // Detect whether row 4 has explicit meal-type labels
        const hasExplicitLabels = mealsRow
          .slice(13)
          .some((v) => v && v !== 'B/L/D');

        const colMeta = [];
        let currentDate      = '';
        let currentDayOfWeek = '';
        let pairOffset       = 0; // 0 = first col of pair (B/L), 1 = second (D)

        for (let i = 13; i < datesRow.length; i++) {
          // Advance current date when we hit a labelled date cell
          if (datesRow[i]) {
            currentDate      = datesRow[i];
            currentDayOfWeek = dayRow[i] || '';
            pairOffset       = 0;
          } else {
            pairOffset = 1;
          }

          if (!currentDate) continue;

          let mealType;
          if (hasExplicitLabels) {
            mealType = mealsRow[i] || '';
            if (!mealType || mealType === 'B/L/D') continue;
          } else {
            // Infer from position: first col of pair = B/L, second = D
            mealType = pairOffset === 0 ? 'B' : 'D';
          }

          colMeta.push({ colIndex: i, date: currentDate, dayOfWeek: currentDayOfWeek, mealType });
        }

        // ── Info headers from row 2, cols 0-11 ────────────────────────
        const infoHeaders = rows[2].slice(0, 12).map((h) => h.trim());

        // ── Student rows start at index 6 ─────────────────────────────
        const students = rows
          .slice(6)
          .filter((row) => row[3] && row[3].trim())
          .map((row) => {
            const obj = { _raw: row };
            infoHeaders.forEach((h, i) => { obj[h] = (row[i] || '').trim(); });
            return obj;
          });

        if (students.length === 0) {
          return reject(new Error('No student records found in this sheet.'));
        }

        // Check if sheet has any actual attendance data at all
        const hasData = students.some((s) =>
          colMeta.some(({ colIndex }) => (s._raw[colIndex] || '').trim() !== '')
        );

        resolve({ students, colMeta, hasData });
      },
      error: (err) => reject(new Error(`CSV parse error: ${err.message}`)),
    });
  });
}
