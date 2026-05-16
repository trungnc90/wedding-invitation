"use client";

import { useState, useEffect } from "react";

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Computes the remaining time between `now` and `targetDate`.
 * Returns zeros if the target date is in the past.
 */
export function computeTimeRemaining(
  targetDate: Date,
  now: Date
): TimeRemaining {
  const diff = targetDate.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

interface CountdownTimerProps {
  weddingDate: string; // ISO date string
}

export default function CountdownTimer({ weddingDate }: CountdownTimerProps) {
  const [mounted, setMounted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0, hours: 0, minutes: 0, seconds: 0,
  });

  useEffect(() => {
    setMounted(true);
    const target = new Date(weddingDate);
    setTimeRemaining(computeTimeRemaining(target, new Date()));

    const interval = setInterval(() => {
      setTimeRemaining(computeTimeRemaining(target, new Date()));
    }, 1000);

    return () => clearInterval(interval);
  }, [weddingDate]);

  const units = [
    { label: "Ngày", value: timeRemaining.days },
    { label: "Giờ", value: timeRemaining.hours },
    { label: "Phút", value: timeRemaining.minutes },
    { label: "Giây", value: timeRemaining.seconds },
  ];

  return (
    <div className="flex justify-center gap-3 sm:gap-4 md:gap-[1em]">
      {units.map((unit) => (
        <div key={unit.label} className="flex flex-col items-center">
          <span className="text-2xl sm:text-3xl md:text-[1.8em] font-bold text-white">
            {String(unit.value).padStart(2, "0")}
          </span>
          <span className="text-[10px] sm:text-xs md:text-[0.5em] text-white/80 mt-1">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}
