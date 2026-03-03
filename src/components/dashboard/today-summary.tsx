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
      <Card className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-8 w-32 rounded bg-muted" />
          <div className="h-3 w-40 rounded bg-muted" />
        </div>
      </Card>
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
    ? "text-destructive"
    : isWarning
    ? "text-warning"
    : "text-success";

  const bgColor = isAlert
    ? "bg-destructive/5 border-destructive/20"
    : isWarning
    ? "bg-warning/5 border-warning/20"
    : "bg-success/5 border-success/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`p-4 border ${bgColor}`}>
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Dog className="h-6 w-6 text-primary" />
          </div>

          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Última comida
            </p>

            {lastMealTime && lastMeal ? (
              <>
                <p className={`text-lg font-bold ${statusColor}`}>
                  {formatTimeAgo(lastMealTime)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {lastMeal.dispenserName} · {formatTime(lastMealTime)} ·{" "}
                  {lastMeal.memberName}
                </p>
              </>
            ) : (
              <p className="text-lg font-bold text-muted-foreground">
                Sin registros
              </p>
            )}
          </div>

          {/* Meal count badge */}
          <div className="flex flex-col items-center rounded-xl bg-primary/10 px-3 py-2">
            <span className="text-xl font-bold text-primary">
              {mealsToday.length}
            </span>
            <span className="text-[10px] text-muted-foreground">hoy</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
