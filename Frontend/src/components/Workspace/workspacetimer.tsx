import React, { useState, useEffect, useRef } from "react";
import { Timer, Play, Pause, RotateCcw } from "lucide-react";

const PRESETS = [15, 25, 50]; // Quick preset minutes

export default function StudyTimer() {
  const [initialMinutes, setInitialMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const timerRef = useRef<HTMLDivElement>(null);

  // Countdown logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        timerRef.current &&
        !timerRef.current.contains(event.target as Node)
      ) {
        setIsTimerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format seconds to MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Change duration and reset remaining time
  const handleSetDuration = (mins: number) => {
    const validMins = Math.max(1, Math.min(mins, 180)); // Limit between 1m and 180m
    setIsRunning(false);
    setInitialMinutes(validMins);
    setSecondsLeft(validMins * 60);
  };

  // Reset back to initial chosen time
  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(initialMinutes * 60);
  };

  return (
    <div className="relative" ref={timerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsTimerOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
          isRunning || isTimerOpen
            ? "bg-accent text-inverse border-accent"
            : "bg-surface text-secondary border-default hover:text-primary hover:bg-surface-hover"
        }`}
      >
        <Timer
          size={15}
          className={isRunning ? "text-inverse animate-pulse" : ""}
        />
        <span>Timer</span>
        <span className="font-mono text-[11px] opacity-90 pl-1 border-l border-default">
          {formatTime(secondsLeft)}
        </span>
      </button>

      {/* Timer Dropdown Popover */}
      {isTimerOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-surface border border-default rounded-xl shadow-xl p-3.5 z-50 flex flex-col items-center gap-3">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted font-semibold">
              Countdown Session
            </p>
            <p
              className={`text-3xl font-mono font-bold mt-0.5 ${
                secondsLeft === 0
                  ? "text-error animate-bounce"
                  : "text-primary"
              }`}
            >
              {formatTime(secondsLeft)}
            </p>
          </div>

          {/* Quick Presets */}
          {!isRunning && (
            <div className="w-full flex flex-col gap-2 pt-2 border-t border-default">
              <div className="flex items-center justify-between gap-1">
                {PRESETS.map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => handleSetDuration(mins)}
                    className={`flex-1 py-1 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                      initialMinutes === mins
                        ? "bg-accent text-inverse border-accent"
                        : "bg-elevated text-secondary border-default hover:text-primary hover:bg-surface-hover"
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>

              {/* Custom Minutes Input */}
              <div className="flex items-center justify-between text-xs text-secondary px-1">
                <span>Custom:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={initialMinutes}
                    onChange={(e) =>
                      handleSetDuration(Number(e.target.value) || 1)
                    }
                    className="w-12 px-1.5 py-0.5 text-center bg-elevated text-primary border border-default rounded outline-none text-xs focus:border-accent"
                  />
                  <span>min</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Controls */}
          <div className="flex items-center gap-2 w-full pt-2 border-t border-default">
            <button
              type="button"
              onClick={() => {
                if (secondsLeft === 0) handleReset();
                setIsRunning(!isRunning);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-accent text-inverse rounded-lg text-xs font-medium hover:bg-accent-hover transition-colors cursor-pointer"
            >
              {isRunning ? <Pause size={13} /> : <Play size={13} />}
              <span>
                {isRunning ? "Pause" : secondsLeft === 0 ? "Restart" : "Start"}
              </span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 border border-default hover:bg-error/10 text-error rounded-lg transition-colors cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
