import { useState, useCallback, useRef } from 'react';
import { fetchSheetData } from '../services/sheetService';
import { buildStudentMap } from '../utils/helpers';

export function useSheetData() {
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [studentMap, setStudentMap] = useState(null);
  const [colMeta,    setColMeta]    = useState([]);
  const [hasData,    setHasData]    = useState(false);

  // Cache: { [sheetName]: { studentMap, colMeta, hasData } }
  const cache = useRef({});

  const loadMonth = useCallback(async (sheetName) => {
    if (!sheetName) return;

    if (cache.current[sheetName]) {
      const c = cache.current[sheetName];
      setStudentMap(c.studentMap);
      setColMeta(c.colMeta);
      setHasData(c.hasData);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setStudentMap(null);
    setColMeta([]);
    setHasData(false);

    try {
      const { students, colMeta, hasData } = await fetchSheetData(sheetName);
      const map = buildStudentMap(students);
      cache.current[sheetName] = { studentMap: map, colMeta, hasData };
      setStudentMap(map);
      setColMeta(colMeta);
      setHasData(hasData);
    } catch (err) {
      setError(err.message || 'Something went wrong while fetching data.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, studentMap, colMeta, hasData, loadMonth };
}
