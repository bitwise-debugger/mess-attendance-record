import Papa from 'papaparse';

const SHEET_ID = '1T1vZtKmMtxPCk_7Mp-ymbNOZRUgpipqXZ97wxmu9EfI';

// Number of metadata/header rows to skip before actual student data begins
const HEADER_ROWS_TO_SKIP = 6;

export function buildSheetUrl(sheetName) {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
}

/**
 * Fetches and parses CSV from a Google Sheet.
 * The sheet has 6 metadata rows before actual data, so we skip them
 * and manually assign the known column headers.
 */
export async function fetchSheetData(sheetName) {
  const url = buildSheetUrl(sheetName);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch sheet "${sheetName}": ${response.status}`);
  }

  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: false,         // we'll assign headers manually
      skipEmptyLines: true,
      transform: (value) => value.trim(),
      complete: (results) => {
        const rows = results.data;

        if (!rows || rows.length <= HEADER_ROWS_TO_SKIP) {
          return reject(new Error('Sheet appears to be empty or has unexpected structure.'));
        }

        // Row index 2 (0-based) contains the real column headers
        const headers = rows[2].map((h) => h.trim());

        // Data rows start after the 6 metadata rows
        const dataRows = rows.slice(HEADER_ROWS_TO_SKIP);

        const normalized = dataRows
          .map((row) => {
            const obj = {};
            headers.forEach((h, i) => {
              obj[h] = (row[i] || '').trim();
            });
            return obj;
          })
          // Filter out rows that have no Roll No. (empty/summary rows)
          .filter((row) => row['Roll No.'] && row['Roll No.'].trim() !== '');

        resolve(normalized);
      },
      error: (err) => reject(new Error(`CSV parse error: ${err.message}`)),
    });
  });
}
