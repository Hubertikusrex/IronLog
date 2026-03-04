import { useState, useEffect, useRef } from 'react';
import { Trash2, ChevronDown, ChevronUp, Search, X, List } from 'lucide-react';
import { formatExerciseDetail } from '../utils/formatExercise';

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(startedAt, finishedAt) {
  const mins = Math.round((new Date(finishedAt) - new Date(startedAt)) / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function SessionCard({ session, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    if (pendingDelete) {
      onDelete(session.id);
    } else {
      setPendingDelete(true);
      setTimeout(() => setPendingDelete(false), 3000);
    }
  };

  return (
    <div className="session-card">
      <div className="session-card-header" onClick={() => setExpanded((v) => !v)}>
        <div className="session-card-info">
          <span className="session-card-name">{session.name || 'WORKOUT'}</span>
          <span className="session-card-meta">
            {formatDate(session.startedAt)} · {formatTime(session.startedAt)}
            {session.finishedAt && ` · ${formatDuration(session.startedAt, session.finishedAt)}`}
            {' · '}{session.exercises.length} exercise{session.exercises.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="session-card-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className={`btn-delete${pendingDelete ? ' confirm' : ''}`}
            onClick={handleDelete}
            title={pendingDelete ? 'Click again to confirm' : 'Delete session'}
          >
            <Trash2 size={14} />
            {pendingDelete && <span>CONFIRM</span>}
          </button>
          <button className="btn-expand" onClick={() => setExpanded((v) => !v)}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="session-card-exercises">
          {session.exercises.map((ex) => (
            <div key={ex.id} className="history-entry">
              <div className="entry-main">
                <span className="entry-name">{ex.exercise}</span>
                <span className="entry-detail">{formatExerciseDetail(ex)}</span>
                {ex.notes && <span className="entry-notes">{ex.notes}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AllWorkoutsOverlay({ sessions, onDelete, onClose }) {
  const [query, setQuery] = useState('');
  const searchRef = useRef(null);

  useEffect(() => {
    searchRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const sorted = [...sessions].sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));

  const filtered = query.trim()
    ? sorted.filter((s) => {
        const q = query.toLowerCase();
        return (
          (s.name || 'workout').toLowerCase().includes(q) ||
          s.exercises.some((e) => e.exercise.toLowerCase().includes(q))
        );
      })
    : sorted;

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="overlay-panel" onClick={(e) => e.stopPropagation()}>
        <div className="overlay-header">
          <h2 className="overlay-title">ALL WORKOUTS</h2>
          <button className="btn-expand" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        <div className="overlay-search">
          <Search size={16} className="search-icon" />
          <input
            ref={searchRef}
            className="input search-input"
            type="text"
            placeholder="SEARCH BY NAME OR EXERCISE…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className="search-clear" onClick={() => setQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="overlay-count">
          {filtered.length} / {sorted.length} workout{sorted.length !== 1 ? 's' : ''}
        </div>

        <div className="overlay-list">
          {filtered.length === 0 ? (
            <div className="empty-state">No workouts match your search.</div>
          ) : (
            filtered.map((s) => (
              <SessionCard key={s.id} session={s} onDelete={onDelete} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function WorkoutHistory({ sessions, onDelete }) {
  const [showAll, setShowAll] = useState(false);

  const sorted = [...sessions].sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
  const recent = sorted.slice(0, 5);

  if (sorted.length === 0) {
    return (
      <section className="panel">
        <h2 className="panel-title">RECENT SESSIONS</h2>
        <div className="empty-state">
          No workouts logged yet.<br />Start a workout above to begin tracking.
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="panel">
        <h2 className="panel-title">RECENT SESSIONS</h2>
        <div className="history-list">
          {recent.map((s) => (
            <SessionCard key={s.id} session={s} onDelete={onDelete} />
          ))}
        </div>
        {sorted.length > 5 && (
          <button className="btn-show-all" onClick={() => setShowAll(true)}>
            <List size={15} />
            ALL WORKOUTS ({sorted.length})
          </button>
        )}
      </section>

      {showAll && (
        <AllWorkoutsOverlay
          sessions={sessions}
          onDelete={onDelete}
          onClose={() => setShowAll(false)}
        />
      )}
    </>
  );
}
