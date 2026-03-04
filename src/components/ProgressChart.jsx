import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function flattenExercises(sessions) {
  return sessions.flatMap((s) =>
    s.exercises.map((ex) => ({ ...ex, timestamp: s.startedAt }))
  );
}

// Volume calculation per exercise type:
// reps:        sets × reps × weight  (or sets × reps for bodyweight)
// timed_sets:  sets × secs           (seconds of work)
// duration:    mins                  (total minutes)
function calcVolume(ex) {
  if (ex.type === 'duration') return ex.mins;
  if (ex.type === 'timed_sets') return ex.sets * ex.secs;
  // reps (or legacy without type)
  return ex.sets * (ex.reps ?? 0) * (ex.weight ?? 1);
}

function calcMax(ex) {
  if (ex.type === 'duration') return ex.mins;
  if (ex.type === 'timed_sets') return ex.secs;
  return ex.weight ?? 0;
}

function getVolumeLabel(exercises) {
  if (!exercises.length) return 'VOLUME';
  const type = exercises[0].type ?? 'reps';
  if (type === 'duration') return 'TOTAL TIME (min)';
  if (type === 'timed_sets') return 'TOTAL WORK (sets × sec)';
  return 'TOTAL VOLUME (sets × reps × weight)';
}

function getMaxLabel(exercises) {
  if (!exercises.length) return 'MAX';
  const type = exercises[0].type ?? 'reps';
  if (type === 'duration') return 'DURATION (min)';
  if (type === 'timed_sets') return 'LONGEST SET (sec)';
  return 'MAX WEIGHT';
}

function getTooltipUnit(exercises, metric) {
  if (!exercises.length) return '';
  const type = exercises[0].type ?? 'reps';
  if (metric === 'max') {
    if (type === 'duration') return 'min';
    if (type === 'timed_sets') return 's';
    return exercises[0].unit ?? 'kg';
  }
  if (type === 'duration') return 'min';
  if (type === 'timed_sets') return 's';
  return 'vol';
}

function buildChartData(sessions, exercise, metric) {
  const exercises = flattenExercises(sessions).filter((e) => e.exercise.toLowerCase() === exercise.toLowerCase());
  const byDay = {};
  for (const e of exercises) {
    const key = new Date(e.timestamp).toDateString();
    if (!byDay[key]) byDay[key] = { date: e.timestamp, entries: [] };
    byDay[key].entries.push(e);
  }
  return Object.values(byDay)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((day) => {
      const value = metric === 'volume'
        ? Math.round(day.entries.reduce((sum, e) => sum + calcVolume(e), 0))
        : Math.max(...day.entries.map(calcMax));
      return { date: formatDate(day.date), value };
    });
}

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="tooltip-date">{label}</div>
      <div className="tooltip-value">{payload[0].value} {unit}</div>
    </div>
  );
};

export default function ProgressChart({ sessions, uniqueExercises }) {
  const [selectedExercise, setSelectedExercise] = useState(uniqueExercises[0] || '');
  const [metric, setMetric] = useState('volume');

  const allForExercise = flattenExercises(sessions).filter((e) => e.exercise.toLowerCase() === selectedExercise.toLowerCase());
  const data = selectedExercise ? buildChartData(sessions, selectedExercise, metric) : [];
  const tooltipUnit = getTooltipUnit(allForExercise, metric);
  const volumeLabel = getVolumeLabel(allForExercise);
  const maxLabel = getMaxLabel(allForExercise);

  return (
    <section className="panel">
      <h2 className="panel-title">PROGRESS</h2>

      <div className="chart-controls">
        <select
          className="input select-input"
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
        >
          {uniqueExercises.length === 0 && <option value="">No exercises logged</option>}
          {uniqueExercises.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>

        <div className="metric-toggle">
          <button className={`btn-toggle${metric === 'volume' ? ' active' : ''}`} onClick={() => setMetric('volume')}>VOLUME</button>
          <button className={`btn-toggle${metric === 'max' ? ' active' : ''}`} onClick={() => setMetric('max')}>MAX</button>
        </div>
      </div>

      {data.length < 2 ? (
        <div className="empty-state">
          {uniqueExercises.length === 0
            ? 'Finish a workout to see your progress chart.'
            : data.length === 1
            ? `Log ${selectedExercise} in another workout to see progress.`
            : 'Select an exercise to visualize progress.'}
        </div>
      ) : (
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={{ stroke: '#333' }} tickLine={false} />
              <YAxis tick={{ fill: '#888', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={{ stroke: '#333' }} tickLine={false} />
              <Tooltip content={<CustomTooltip unit={tooltipUnit} />} cursor={{ fill: 'rgba(245,166,35,0.08)' }} />
              <Bar dataKey="value" radius={0} isAnimationActive animationDuration={600}>
                {data.map((_, i) => (
                  <Cell key={i} fill={i === data.length - 1 ? '#f5a623' : '#3a3228'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="chart-label">{metric === 'volume' ? volumeLabel : maxLabel}</div>
        </div>
      )}
    </section>
  );
}
