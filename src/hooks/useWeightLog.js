import { useState, useEffect, useCallback } from 'react';
import { getWeightLog, saveWeightEntry, deleteWeightEntry } from '../utils/storage';

export function useWeightLog(user) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setEntries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getWeightLog()
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const addEntry = useCallback(async (entry) => {
    const saved = await saveWeightEntry(entry);
    if (saved) setEntries((prev) => [...prev, saved]);
  }, []);

  const removeEntry = useCallback(async (id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    await deleteWeightEntry(id);
  }, []);

  return { entries, loading, addEntry, removeEntry };
}
