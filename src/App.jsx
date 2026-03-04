import { useState } from 'react';
import { Download, LogOut } from 'lucide-react';
import ExerciseLogger from './components/ExerciseLogger';
import ExerciseLibrary from './components/ExerciseLibrary';
import RestTimer from './components/Timer';
import WorkoutHistory from './components/WorkoutHistory';
import ProgressChart from './components/ProgressChart';
import WeightTracker from './components/WeightTracker';
import LoginPage from './components/LoginPage';
import { useWorkouts } from './hooks/useWorkouts';
import { useWeightLog } from './hooks/useWeightLog';
import { useAuth } from './hooks/useAuth';
import { useExercises } from './hooks/useExercises';
import { exportWorkouts } from './utils/storage';
import './App.css';

export default function App() {
  const { user, authLoading, login, logout, loginError } = useAuth();
  const { sessions, loading, error, addSession, removeSession, uniqueExercises } = useWorkouts(user);
  const { entries: weightEntries, addEntry: addWeightEntry, removeEntry: removeWeightEntry } = useWeightLog(user);
  const { exercises, addExercise, removeExercise } = useExercises(user);
  const [libraryOpen, setLibraryOpen] = useState(false);

  if (authLoading) {
    return (
      <div className="login-backdrop">
        <div className="loading-auth">LOADING…</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={login} error={loginError} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-brand">
            <span className="brand-mark">▮</span>
            <h1 className="brand-name">IRON LOG</h1>
          </div>
          <div className="header-actions">
            <span className="header-user">{user.username}</span>
            <button className="btn-export" onClick={exportWorkouts} title="Export workout data">
              <Download size={16} />
              EXPORT
            </button>
            <button className="btn-export" onClick={logout} title="Sign out">
              <LogOut size={16} />
              LOGOUT
            </button>
          </div>
        </div>
      </header>

      {error && <div className="server-error">{error} — is the server running?</div>}

      {libraryOpen && (
        <ExerciseLibrary
          exercises={exercises}
          onAdd={addExercise}
          onRemove={removeExercise}
          onClose={() => setLibraryOpen(false)}
        />
      )}

      <main className="app-main">
        <div className="col col-left">
          <ExerciseLogger
            onFinish={addSession}
            libraryExercises={exercises}
            onOpenLibrary={() => setLibraryOpen(true)}
          />
          <RestTimer />
        </div>
        <div className="col col-right">
          {loading
            ? <div className="panel"><div className="empty-state">Loading…</div></div>
            : <WorkoutHistory sessions={sessions} onDelete={removeSession} />
          }
          {!loading && <ProgressChart sessions={sessions} uniqueExercises={uniqueExercises} />}
          <WeightTracker entries={weightEntries} onAdd={addWeightEntry} onRemove={removeWeightEntry} />
        </div>
      </main>
    </div>
  );
}
