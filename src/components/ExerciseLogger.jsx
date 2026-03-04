import { useState } from 'react';
import { X, Plus, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import { formatExerciseDetail } from '../utils/formatExercise';

const TYPES = [
  { id: 'reps', label: 'REPS' },
  { id: 'timed_sets', label: 'TIMED' },
  { id: 'duration', label: 'DURATION' },
];

function ExerciseForm({ onAdd, libraryExercises, onOpenLibrary, defaultUnit }) {
  const [type, setType] = useState('reps');
  const [form, setForm] = useState({
    exercise: '',
    sets: '',
    reps: '',
    secs: '',   // seconds per set (timed_sets)
    mins: '',   // total minutes (duration)
    weight: '',
    unit: defaultUnit,
    notes: '',
  });
  const [flash, setFlash] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const isValid = () => {
    if (!form.exercise) return false;
    if (type === 'reps') return form.sets && form.reps;
    if (type === 'timed_sets') return form.sets && form.secs;
    if (type === 'duration') return form.mins;
    return false;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid()) return;

    const base = {
      id: crypto.randomUUID(),
      exercise: form.exercise,
      type,
      notes: form.notes.trim(),
    };

    const weight = form.weight ? parseFloat(form.weight) : null;
    const unit = form.unit;

    let entry;
    if (type === 'reps') {
      entry = { ...base, sets: parseInt(form.sets), reps: parseInt(form.reps), weight, unit };
    } else if (type === 'timed_sets') {
      entry = { ...base, sets: parseInt(form.sets), secs: parseInt(form.secs), weight, unit };
    } else {
      entry = { ...base, mins: parseFloat(form.mins) };
    }

    onAdd(entry);
    setForm((prev) => ({ exercise: '', sets: '', reps: '', secs: '', mins: '', weight: '', unit: prev.unit, notes: '' }));
    setFlash(true);
    setTimeout(() => setFlash(false), 500);
  };

  const weightFields = (
    <div className="form-row">
      <input
        className="input"
        name="weight"
        type="number"
        min="0"
        step="0.5"
        placeholder="WEIGHT (OPT)"
        value={form.weight}
        onChange={handleChange}
      />
      <button
        type="button"
        className="unit-toggle"
        onClick={() => setForm((prev) => ({ ...prev, unit: prev.unit === 'kg' ? 'lbs' : 'kg' }))}
      >
        {form.unit.toUpperCase()}
      </button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="logger-form" autoComplete="off">
      {/* Type selector */}
      <div className="type-selector">
        {TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`btn-toggle${type === t.id ? ' active' : ''}`}
            onClick={() => setType(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Exercise select from library */}
      <div className="form-row" style={{ gap: 8 }}>
        <select
          className="input"
          name="exercise"
          value={form.exercise}
          onChange={handleChange}
          disabled={libraryExercises.length === 0}
          style={{ flex: 1 }}
          required
        >
          <option value="">
            {libraryExercises.length === 0 ? '— Add exercises to library first —' : 'SELECT EXERCISE'}
          </option>
          {libraryExercises.map((ex) => (
            <option key={ex.id} value={ex.name}>{ex.name}</option>
          ))}
        </select>
        <button type="button" className="btn-secondary" onClick={onOpenLibrary} title="Open exercise library" style={{ whiteSpace: 'nowrap' }}>
          <BookOpen size={14} />
          LIBRARY
        </button>
      </div>

      {/* Type-specific fields */}
      {type === 'reps' && (
        <>
          <div className="form-row">
            <input className="input" name="sets" type="number" min="1" placeholder="SETS" value={form.sets} onChange={handleChange} required />
            <input className="input" name="reps" type="number" min="1" placeholder="REPS" value={form.reps} onChange={handleChange} required />
          </div>
          {weightFields}
        </>
      )}

      {type === 'timed_sets' && (
        <>
          <div className="form-row">
            <input className="input" name="sets" type="number" min="1" placeholder="SETS" value={form.sets} onChange={handleChange} required />
            <input className="input" name="secs" type="number" min="1" placeholder="SEC / SET" value={form.secs} onChange={handleChange} required />
          </div>
          {weightFields}
        </>
      )}

      {type === 'duration' && (
        <input className="input" name="mins" type="number" min="0.1" step="0.5" placeholder="DURATION (MIN)" value={form.mins} onChange={handleChange} required />
      )}

      <textarea className="input notes-input" name="notes" placeholder="NOTES (OPTIONAL)" value={form.notes} onChange={handleChange} rows={2} />

      <button type="submit" className={`btn-secondary btn-add-exercise${flash ? ' flash' : ''}`} disabled={!isValid()}>
        <Plus size={16} />
        ADD EXERCISE
      </button>
    </form>
  );
}

function todayName() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export default function ExerciseLogger({ onFinish, libraryExercises, onOpenLibrary }) {
  const [active, setActive] = useState(null);
  const [sessionName, setSessionName] = useState(todayName);

  const startSession = () => {
    setActive({ name: sessionName.trim() || null, startedAt: new Date().toISOString(), exercises: [] });
    setSessionName('');
  };

  const addExercise = (ex) => setActive((prev) => ({ ...prev, exercises: [...prev.exercises, ex] }));
  const removeExercise = (id) => setActive((prev) => ({ ...prev, exercises: prev.exercises.filter((e) => e.id !== id) }));

  const finishSession = () => {
    if (!active || active.exercises.length === 0) return;
    onFinish({
      id: crypto.randomUUID(),
      name: active.name,
      startedAt: active.startedAt,
      finishedAt: new Date().toISOString(),
      exercises: active.exercises,
    });
    setActive(null);
    setSessionName(todayName());
  };

  const defaultUnit = active?.exercises.findLast((e) => e.unit)?.unit ?? 'kg';
  const elapsed = active ? Math.floor((Date.now() - new Date(active.startedAt)) / 60000) : 0;

  if (!active) {
    return (
      <section className="panel">
        <h2 className="panel-title">START WORKOUT</h2>
        <div className="start-session">
          <input
            className="input"
            placeholder="WORKOUT NAME (OPTIONAL)"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && startSession()}
          />
          <div className="form-row" style={{ gap: 8 }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={startSession}>START WORKOUT</button>
            <button className="btn-secondary" onClick={onOpenLibrary} title="Manage exercise library">
              <BookOpen size={16} />
              LIBRARY
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="session-header">
        <div>
          <h2 className="panel-title" style={{ marginBottom: 2 }}>
            {active.name ? active.name.toUpperCase() : 'WORKOUT IN PROGRESS'}
          </h2>
          <span className="session-elapsed">
            {elapsed}m elapsed · {active.exercises.length} exercise{active.exercises.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {active.exercises.length > 0 && (
        <div className="session-exercise-list">
          {active.exercises.map((ex) => (
            <div key={ex.id} className="session-exercise-row">
              <div className="session-ex-main">
                <span className="session-ex-name">{ex.exercise}</span>
                <span className="session-ex-detail">{formatExerciseDetail(ex)}</span>
                {ex.notes && <span className="entry-notes">{ex.notes}</span>}
              </div>
              <button className="btn-remove-ex" onClick={() => removeExercise(ex.id)} title="Remove">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="session-add-divider">ADD EXERCISE</div>
      <ExerciseForm onAdd={addExercise} libraryExercises={libraryExercises} onOpenLibrary={onOpenLibrary} defaultUnit={defaultUnit} />

      <div className="session-actions">
        <button className="btn-primary" onClick={finishSession} disabled={active.exercises.length === 0}>
          <CheckCircle size={16} />
          FINISH WORKOUT
        </button>
        <button className="btn-danger" onClick={() => { setActive(null); setSessionName(todayName()); }}>
          <XCircle size={16} />
          CANCEL
        </button>
      </div>
    </section>
  );
}
