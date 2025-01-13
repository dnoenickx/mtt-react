import { useEffect, useRef, useState } from 'react';

interface UseAutoSaveOptions {
  interval: number; // Save interval in milliseconds
  onSave: () => void; // Callback to perform save
  pollingInterval?: number; // How often to check timeUntilNextSave
}

export function useAutoSave({
  interval,
  onSave,
  pollingInterval = 500, // Default check every 500ms
}: UseAutoSaveOptions) {
  const [isAutoSaving, setIsAutoSaving] = useState(true);
  const [timeUntilNextSave, setTimeUntilNextSave] = useState(interval);
  const lastSaveTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<number | null>(null);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = () => {
    if (timerRef.current) return; // Prevent multiple timers
    timerRef.current = window.setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastSaveTimeRef.current;

      setTimeUntilNextSave(Math.max(interval - elapsed, 0));

      if (elapsed >= interval) {
        onSave();
        lastSaveTimeRef.current = now;
        stopTimer(); // Automatically stop after save
      }
    }, pollingInterval);
  };

  const resetTimer = () => {
    lastSaveTimeRef.current = Date.now();
    setTimeUntilNextSave(interval);
    stopTimer();
    if (isAutoSaving) startTimer();
  };

  const toggleAutoSave = () => {
    setIsAutoSaving((prev) => {
      if (prev) stopTimer();
      else resetTimer();
      return !prev;
    });
  };

  useEffect(() => {
    if (isAutoSaving) startTimer();
    return () => stopTimer();
  }, [isAutoSaving, interval, pollingInterval]);

  return {
    isAutoSaving,
    timeUntilNextSave,
    toggleAutoSave,
    resetTimer,
  };
}
