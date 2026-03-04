import { useState, useEffect, useCallback } from 'react';
import { getExercises, saveExercise, deleteExercise } from '../utils/storage';

export function useExercises(user) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setExercises([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getExercises()
      .then(setExercises)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const addExercise = useCallback(async (name) => {
    const saved = await saveExercise({ name });
    if (saved) setExercises((prev) => [...prev, saved]);
  }, []);

  const removeExercise = useCallback(async (id) => {
    setExercises((prev) => prev.filter((e) => e.id !== id));
    await deleteExercise(id);
  }, []);

  return { exercises, loading, addExercise, removeExercise };
}
