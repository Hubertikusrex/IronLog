import { useState, useRef, useCallback } from 'react';

export function useTimer() {
  const [elapsed, setElapsed] = useState(0); // ms
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const accumulatedRef = useRef(0);

  const start = useCallback(() => {
    if (running) return;
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setElapsed(accumulatedRef.current + (Date.now() - startTimeRef.current));
    }, 100);
    setRunning(true);
  }, [running]);

  const pause = useCallback(() => {
    if (!running) return;
    clearInterval(intervalRef.current);
    accumulatedRef.current += Date.now() - startTimeRef.current;
    setRunning(false);
  }, [running]);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    accumulatedRef.current = 0;
    setElapsed(0);
    setRunning(false);
    setLaps([]);
  }, []);

  const lap = useCallback(() => {
    const current = accumulatedRef.current + (running ? Date.now() - startTimeRef.current : 0);
    setLaps((prev) => [current, ...prev].slice(0, 5));
  }, [running]);

  return { elapsed, running, laps, start, pause, reset, lap };
}

export function useRestTimer() {
  const [restTime, setRestTime] = useState(0); // seconds remaining
  const [restRunning, setRestRunning] = useState(false);
  const intervalRef = useRef(null);

  const playBeep = () => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      osc.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // AudioContext not available
    }
  };

  const startRest = useCallback((seconds) => {
    clearInterval(intervalRef.current);
    setRestTime(seconds);
    setRestRunning(true);
    let remaining = seconds;
    intervalRef.current = setInterval(() => {
      remaining -= 1;
      setRestTime(remaining);
      if (remaining <= 0) {
        clearInterval(intervalRef.current);
        setRestRunning(false);
        playBeep();
      }
    }, 1000);
  }, []);

  const cancelRest = useCallback(() => {
    clearInterval(intervalRef.current);
    setRestRunning(false);
    setRestTime(0);
  }, []);

  return { restTime, restRunning, startRest, cancelRest };
}
