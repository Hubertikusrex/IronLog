import { useState, useEffect, useCallback } from 'react';
import { getSessions, saveSession, deleteSession } from '../utils/storage';

export function useWorkouts(user) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setSessions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getSessions()
      .then(setSessions)
      .catch(() => setError('Could not reach server'))
      .finally(() => setLoading(false));
  }, [user]);

  const addSession = useCallback(async (session) => {
    setSessions((prev) => [...prev, session]);
    await saveSession(session);
  }, []);

  const removeSession = useCallback(async (id) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    await deleteSession(id);
  }, []);

  const allExercises = sessions.flatMap((s) => s.exercises);
  const normalizeEx = (name) => name.trim().replace(/\b\w/g, (c) => c.toUpperCase());
  const uniqueExercises = [...new Set(allExercises.map((e) => normalizeEx(e.exercise)))].filter(Boolean);

  return { sessions, loading, error, addSession, removeSession, uniqueExercises };
}
