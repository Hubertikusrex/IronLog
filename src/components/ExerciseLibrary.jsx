import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

export default function ExerciseLibrary({ exercises, onAdd, onRemove, onClose }) {
  const [name, setName] = useState('');
  const [confirmId, setConfirmId] = useState(null);

  const handleAdd = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setName('');
  };

  const handleDelete = (id) => {
    if (confirmId === id) {
      onRemove(id);
      setConfirmId(null);
    } else {
      setConfirmId(id);
    }
  };

  return (
    <div className="overlay-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="overlay-panel">
        <div className="overlay-header">
          <span className="overlay-title">EXERCISE LIBRARY</span>
          <button className="btn-icon" onClick={onClose} title="Close">
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
          <form onSubmit={handleAdd} className="form-row" style={{ gap: 8 }}>
            <input
              className="input"
              placeholder="EXERCISE NAME"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn-secondary" disabled={!name.trim()} style={{ whiteSpace: 'nowrap' }}>
              <Plus size={14} />
              ADD
            </button>
          </form>
        </div>

        <div className="overlay-list">
          {exercises.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              No exercises yet — add your first
            </div>
          ) : (
            exercises.map((ex) => (
              <div key={ex.id} className="weight-entry">
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{ex.name}</span>
                <button
                  className={`btn-delete${confirmId === ex.id ? ' confirm' : ''}`}
                  onClick={() => handleDelete(ex.id)}
                  onBlur={() => setConfirmId(null)}
                  title={confirmId === ex.id ? 'Click again to confirm' : 'Delete'}
                >
                  <Trash2 size={13} />
                  {confirmId === ex.id ? 'CONFIRM' : 'DELETE'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
