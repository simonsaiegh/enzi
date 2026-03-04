"use client";

import { motion } from "framer-motion";
import { Dog } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLastMeal } from "@/lib/hooks/use-last-meal";
import { useMealsToday } from "@/lib/hooks/use-meals-today";
import { formatTimeAgo, formatTime, getMinutesBetween } from "@/lib/utils/dates";
import { DEFAULT_ALERT_THRESHOLD_MINUTES } from "@/lib/utils/constants";
import { useEffect, useState } from "react";

export function TodaySummary() {
  const { lastMeal, isLoading: loadingLast } = useLastMeal();
  const { meals: mealsToday, isLoading: loadingToday } = useMealsToday();
  const [, setTick] = useState(0);

  // Update display every minute
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  if (loadingLast || loadingToday) {
    return (
      <div className="p-5 rounded-3xl bg-black/40 border border-white/5 backdrop-blur-md shadow-xl w-full">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 rounded bg-white/10" />
          <div className="h-8 w-32 rounded bg-white/10" />
          <div className="h-3 w-40 rounded bg-white/10" />
        </div>
      </div>
    );
  }

  const lastMealTime = lastMeal?.timestamp.toDate();
  const minutesSinceLast = lastMealTime
    ? getMinutesBetween(lastMealTime, new Date())
    : null;

  const isAlert =
    minutesSinceLast !== null &&
    minutesSinceLast > DEFAULT_ALERT_THRESHOLD_MINUTES;
  const isWarning =
    minutesSinceLast !== null &&
    minutesSinceLast > DEFAULT_ALERT_THRESHOLD_MINUTES * 0.75;

  const statusColor = isAlert
    ? "text-red-400"
    : isWarning
    ? "text-yellow-400"
    : "text-white";

  const borderColor = isAlert
    ? "border-red-500/30"
    : isWarning
    ? "border-yellow-500/30"
    : "border-white/10";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`p-5 rounded-3xl bg-black/50 backdrop-blur-xl shadow-2xl border ${borderColor} relative overflow-hidden transition-colors`}>
        {/* Subtle glow effect */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
        
        <div className="relative z-10 flex items-stretch justify-between gap-4">
          <div className="flex flex-col justify-center flex-1 py-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/40 mb-2">
              Última Comida
            </p>

            {lastMealTime && lastMeal ? (
              <>
                <p className={`text-4xl font-black leading-none tracking-tighter ${statusColor} mb-2`}>
                  {formatTimeAgo(lastMealTime)}
                </p>
                <p className="text-sm text-white/50 font-medium flex items-center gap-1.5 line-clamp-1">
                  <span className="text-white/80">{formatTime(lastMealTime)}</span>
                  <span>·</span>
                  <span className="truncate">{lastMeal.dispenserName}</span>
                </p>
              </>
            ) : (
              <p className="text-3xl font-black tracking-tighter text-white/30 my-2">
                Aún no comió
              </p>
            )}
          </div>

          {/* Large Meal count badge */}
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white/10 border border-white/20 px-6 py-4 shrink-0 shadow-inner backdrop-blur-md">
            <span className="text-5xl font-black text-white leading-none mb-1">
              {mealsToday.length}
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/50">
              Hoy
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
