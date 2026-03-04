function handle401() {
  window.location.reload();
}

export async function getSessions() {
  const res = await fetch('/api/sessions', { credentials: 'include' });
  if (res.status === 401) { handle401(); return []; }
  if (!res.ok) throw new Error('Failed to load sessions');
  return res.json();
}

export async function saveSession(session) {
  const res = await fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(session),
  });
  if (res.status === 401) { handle401(); return; }
  if (!res.ok) throw new Error('Failed to save session');
}

export async function deleteSession(id) {
  const res = await fetch(`/api/sessions/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (res.status === 401) { handle401(); return; }
  if (!res.ok) throw new Error('Failed to delete session');
}

export async function getWeightLog() {
  const res = await fetch('/api/weight', { credentials: 'include' });
  if (res.status === 401) { handle401(); return []; }
  if (!res.ok) throw new Error('Failed to load weight log');
  return res.json();
}

export async function saveWeightEntry(entry) {
  const res = await fetch('/api/weight', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(entry),
  });
  if (res.status === 401) { handle401(); return; }
  if (!res.ok) throw new Error('Failed to save weight entry');
  return res.json();
}

export async function deleteWeightEntry(id) {
  const res = await fetch(`/api/weight/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (res.status === 401) { handle401(); return; }
  if (!res.ok) throw new Error('Failed to delete weight entry');
}

export async function getExercises() {
  const res = await fetch('/api/exercises', { credentials: 'include' });
  if (res.status === 401) { handle401(); return []; }
  if (!res.ok) throw new Error('Failed to load exercises');
  return res.json();
}

export async function saveExercise(exercise) {
  const res = await fetch('/api/exercises', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(exercise),
  });
  if (res.status === 401) { handle401(); return; }
  if (!res.ok) throw new Error('Failed to save exercise');
  return res.json();
}

export async function deleteExercise(id) {
  const res = await fetch(`/api/exercises/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (res.status === 401) { handle401(); return; }
  if (!res.ok) throw new Error('Failed to delete exercise');
}

export async function exportWorkouts() {
  const sessions = await getSessions();
  const blob = new Blob([JSON.stringify({ sessions }, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `workouts-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
