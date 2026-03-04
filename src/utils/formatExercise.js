export function formatExerciseDetail(ex) {
  if (ex.type === 'duration') {
    return `${ex.mins} min`;
  }
  const wtStr = ex.weight ? `${ex.weight}${ex.unit}` : 'BW';
  if (ex.type === 'timed_sets') {
    return `${ex.sets}×${ex.secs}s — ${wtStr}`;
  }
  // default: reps (including legacy entries without a type field)
  return `${ex.sets}×${ex.reps} — ${wtStr}`;
}
