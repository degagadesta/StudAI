import { useEffect, useRef, useState } from "react";

export type PomodoroPhase = "focus" | "shortBreak" | "longBreak";

const FOCUS_MINUTES = 25;
const SHORT_BREAK_MINUTES = 5;
const LONG_BREAK_MINUTES = 15;

export function usePomodoro(onFocusComplete: () => void | Promise<void>) {
  const [phase, setPhase] = useState<PomodoroPhase>("focus");
  const [remainingSeconds, setRemainingSeconds] = useState(FOCUS_MINUTES * 60);
  const remainingRef = useRef(FOCUS_MINUTES * 60);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const completionCallback = useRef(onFocusComplete);
  const finishInterval = useRef<() => void>(() => undefined);

  useEffect(() => {
    completionCallback.current = onFocusComplete;
  }, [onFocusComplete]);

  useEffect(() => {
    finishInterval.current = () => {
      setIsRunning(false);
      if (phase === "focus") {
        void completionCallback.current();
        setCompletedCycles((cycles) => {
          const nextCycle = cycles + 1;
          const nextPhase = nextCycle % 4 === 0 ? "longBreak" : "shortBreak";
          setPhase(nextPhase);
          const seconds = (nextPhase === "longBreak" ? LONG_BREAK_MINUTES : SHORT_BREAK_MINUTES) * 60;
          remainingRef.current = seconds;
          setRemainingSeconds(seconds);
          return nextCycle;
        });
      } else {
        setPhase("focus");
        remainingRef.current = FOCUS_MINUTES * 60;
        setRemainingSeconds(FOCUS_MINUTES * 60);
      }
    };
  }, [phase]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = window.setInterval(() => {
      if (remainingRef.current <= 1) {
          remainingRef.current = 0;
          setRemainingSeconds(0);
          finishInterval.current();
      } else {
        remainingRef.current -= 1;
        setRemainingSeconds(remainingRef.current);
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isRunning]);

  const reset = () => {
    setIsRunning(false);
    setPhase("focus");
    remainingRef.current = FOCUS_MINUTES * 60;
    setRemainingSeconds(FOCUS_MINUTES * 60);
    setCompletedCycles(0);
  };

  return {
    phase,
    remainingSeconds,
    completedCycles,
    isRunning,
    start: () => setIsRunning(true),
    pause: () => setIsRunning(false),
    reset,
  };
}
