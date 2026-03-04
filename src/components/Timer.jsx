import { useState } from 'react';
import { Play, X } from 'lucide-react';
import { useRestTimer } from '../hooks/useTimer';

const PRESETS = [
  { label: '3m', secs: 180 },
  { label: '5m', secs: 300 },
];

// Accepts "M", "M:S", "M:SS" — returns total seconds or 0 if invalid
function parseInput(val) {
  const trimmed = val.trim();
  if (!trimmed) return 0;
  if (trimmed.includes(':')) {
    const [m, s] = trimmed.split(':');
    const mins = parseInt(m) || 0;
    const secs = parseInt(s) || 0;
    return mins * 60 + secs;
  }
  return (parseInt(trimmed) || 0) * 60;
}

function formatCountdown(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function RestTimer() {
  const [input, setInput] = useState('');
  const { restTime, restRunning, startRest, cancelRest } = useRestTimer();

  const parsedSecs = parseInput(input);

  const handleStart = () => {
    if (parsedSecs <= 0) return;
    startRest(parsedSecs);
  };

  const handlePreset = (secs) => {
    setInput(`${secs / 60}:00`);
    startRest(secs);
  };

  const handleCancel = () => {
    cancelRest();
    setInput('');
  };

  return (
    <section className="panel rest-timer-panel">
      <h2 className="panel-title">REST TIMER</h2>

      {restRunning ? (
        <div className="rest-active">
          <div className={`rest-countdown${restTime <= 5 ? ' rest-urgent' : ''}`}>
            {formatCountdown(restTime)}
          </div>
          <button className="btn-danger" onClick={handleCancel}>
            <X size={16} /> CANCEL
          </button>
        </div>
      ) : (
        <div className="rest-idle">
          <div className="rest-input-row">
            <input
              className="input rest-input"
              type="text"
              inputMode="numeric"
              placeholder="M or M:SS"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            />
            <button className="btn-icon" onClick={handleStart} disabled={parsedSecs <= 0}>
              <Play size={16} /> START
            </button>
          </div>
          <div className="rest-presets">
            {PRESETS.map((p) => (
              <button key={p.secs} className="btn-secondary" onClick={() => handlePreset(p.secs)}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
