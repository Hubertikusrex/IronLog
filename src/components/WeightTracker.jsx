import { useState } from 'react';
import { Trash2, X } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Dot,
} from 'recharts';

const LBS_TO_KG = 0.4536;

function toKg(weight, unit) {
  return unit === 'lbs' ? weight * LBS_TO_KG : weight;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${d}.${m}.${y.slice(2)}`;
}

function filterByRange(entries, range) {
  if (range === 'ALL') return entries;
  const months = range === '1M' ? 1 : range === '3M' ? 3 : 6;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  return entries.filter((e) => new Date(e.date) >= cutoff);
}

function buildChartData(entries, range) {
  const filtered = filterByRange(entries, range);
  return filtered
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({
      date: formatDate(e.date),
      kg: parseFloat(toKg(e.weight, e.unit).toFixed(2)),
      orig: `${e.weight} ${e.unit}`,
    }));
}

const CustomDot = ({ cx, cy, index, dataLength }) => {
  if (index !== dataLength - 1) return null;
  return <Dot cx={cx} cy={cy} r={5} fill="#f5a623" stroke="#f5a623" />;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="tooltip-date">{label}</div>
      <div className="tooltip-value">{payload[0].payload.orig}</div>
      <div className="tooltip-date">{payload[0].value} kg</div>
    </div>
  );
};

const RANGES = ['1M', '3M', '6M', 'ALL'];

export default function WeightTracker({ entries, onAdd, onRemove }) {
  const [date, setDate] = useState(today());
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState('kg');
  const [note, setNote] = useState('');
  const [range, setRange] = useState('3M');
  const [confirmId, setConfirmId] = useState(null);
  const [showAll, setShowAll] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    const w = parseFloat(weight);
    if (!w || w <= 0) return;
    onAdd({
      id: crypto.randomUUID(),
      date,
      weight: w,
      unit,
      note: note.trim(),
    });
    setWeight('');
    setNote('');
  }

  function handleDelete(id) {
    if (confirmId === id) {
      onRemove(id);
      setConfirmId(null);
    } else {
      setConfirmId(id);
    }
  }

  const sorted = entries.slice().sort((a, b) => b.date.localeCompare(a.date));
  const recent = sorted.slice(0, 5);
  const chartData = buildChartData(entries, range);
  const dataLength = chartData.length;

  return (
    <section className="panel">
      <h2 className="panel-title">BODY WEIGHT</h2>

      {/* Input form */}
      <form className="logger-form" onSubmit={handleSubmit}>
        <div className="weight-input-row">
          <input
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <input
            type="number"
            className="input"
            placeholder="Weight"
            min="1"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
          />
          <button
            type="button"
            className="unit-toggle"
            onClick={() => setUnit((u) => (u === 'kg' ? 'lbs' : 'kg'))}
          >
            {unit}
          </button>
        </div>
        <input
          type="text"
          className="input"
          placeholder="Note (optional)"
          maxLength={80}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button type="submit" className="btn-primary">+ LOG WEIGHT</button>
      </form>

      {/* Chart */}
      {chartData.length >= 2 ? (
        <div className="chart-wrap" style={{ marginTop: 20 }}>
          <div className="chart-controls" style={{ marginBottom: 10 }}>
            <div className="metric-toggle">
              {RANGES.map((r) => (
                <button
                  key={r}
                  className={`btn-toggle${range === r ? ' active' : ''}`}
                  onClick={() => setRange(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={{ stroke: '#333' }} tickLine={false} />
              <YAxis tick={{ fill: '#888', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={{ stroke: '#333' }} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(245,166,35,0.2)', strokeWidth: 1 }} />
              <Line
                type="monotone"
                dataKey="kg"
                stroke="#f5a623"
                strokeWidth={2}
                dot={(props) => <CustomDot {...props} dataLength={dataLength} />}
                activeDot={{ r: 4, fill: '#f5a623' }}
                isAnimationActive
                animationDuration={600}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="chart-label">WEIGHT (kg)</div>
        </div>
      ) : entries.length > 0 ? (
        <div className="empty-state" style={{ marginTop: 16 }}>Log at least 2 entries to see the chart.</div>
      ) : null}

      {/* Recent list */}
      {recent.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <ul className="weight-list">
            {recent.map((e) => (
              <li key={e.id} className="weight-entry">
                <span className="weight-entry-date">{formatDate(e.date)}</span>
                <span className="weight-entry-val">{e.weight} {e.unit}</span>
                {e.note && <span className="weight-entry-note">{e.note}</span>}
                <button
                  className={`btn-delete${confirmId === e.id ? ' confirm' : ''}`}
                  onClick={() => handleDelete(e.id)}
                  onBlur={() => setConfirmId(null)}
                  title={confirmId === e.id ? 'Confirm delete' : 'Delete entry'}
                >
                  <Trash2 size={11} />
                  {confirmId === e.id ? 'CONFIRM' : 'DEL'}
                </button>
              </li>
            ))}
          </ul>
          {sorted.length > 5 && (
            <button className="btn-show-all" onClick={() => setShowAll(true)}>
              ALLE ZEIGEN ({sorted.length})
            </button>
          )}
        </div>
      )}

      {/* All entries overlay */}
      {showAll && (
        <div className="overlay-backdrop" onClick={(e) => e.target === e.currentTarget && setShowAll(false)}>
          <div className="overlay-panel">
            <div className="overlay-header">
              <span className="overlay-title">ALL WEIGHT ENTRIES ({sorted.length})</span>
              <button className="btn-expand" onClick={() => setShowAll(false)}><X size={18} /></button>
            </div>
            <div className="overlay-list">
              <ul className="weight-list">
                {sorted.map((e) => (
                  <li key={e.id} className="weight-entry">
                    <span className="weight-entry-date">{formatDate(e.date)}</span>
                    <span className="weight-entry-val">{e.weight} {e.unit}</span>
                    {e.note && <span className="weight-entry-note">{e.note}</span>}
                    <button
                      className={`btn-delete${confirmId === e.id ? ' confirm' : ''}`}
                      onClick={() => handleDelete(e.id)}
                      onBlur={() => setConfirmId(null)}
                      title={confirmId === e.id ? 'Confirm delete' : 'Delete entry'}
                    >
                      <Trash2 size={11} />
                      {confirmId === e.id ? 'CONFIRM' : 'DEL'}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
