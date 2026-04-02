import { useState, useCallback, useRef } from 'react';
import { fetchSheetData } from '../services/sheetService';
import { buildStudentMap } from '../utils/helpers';

/**
 * Custom hook that manages fetching, caching, and exposing sheet data.
 * Cache prevents re-fetching the same month twice.
 */
export function useSheetData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [studentMap, setStudentMap] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(null);

  // In-memory cache: { [sheetName]: studentMap }
  const cache = useRef({});

  const loadMonth = useCallback(async (sheetName) => {
    if (!sheetName) return;

    // Return cached data if available
    if (cache.current[sheetName]) {
      setStudentMap(cache.current[sheetName]);
      setCurrentMonth(sheetName);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setStudentMap(null);

    try {
      const rows = await fetchSheetData(sheetName);

      if (!rows || rows.length === 0) {
        throw new Error('No data found in this sheet. It may be empty or the name is incorrect.');
      }

      const map = buildStudentMap(rows);
      cache.current[sheetName] = map;
      setStudentMap(map);
      setCurrentMonth(sheetName);
    } catch (err) {
      setError(err.message || 'Something went wrong while fetching data.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, studentMap, currentMonth, loadMonth };
}
