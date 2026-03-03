"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useLastMeal } from "@/lib/hooks/use-last-meal";
import { getMinutesBetween, formatDuration } from "@/lib/utils/dates";
import { DEFAULT_ALERT_THRESHOLD_MINUTES } from "@/lib/utils/constants";
import { useEffect, useState } from "react";

export function AlertBanner() {
  const { lastMeal } = useLastMeal();
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const lastMealTime = lastMeal?.timestamp.toDate();
  const minutesSinceLast = lastMealTime
    ? getMinutesBetween(lastMealTime, new Date())
    : null;

  const showAlert =
    minutesSinceLast !== null &&
    minutesSinceLast > DEFAULT_ALERT_THRESHOLD_MINUTES;

  return (
    <AnimatePresence>
      {showAlert && minutesSinceLast && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="flex items-center gap-3 rounded-xl bg-destructive/10 border border-destructive/20 p-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">
                Enzo no comió hace {formatDuration(minutesSinceLast)}
              </p>
              <p className="text-xs text-destructive/70">
                El umbral configurado es de{" "}
                {formatDuration(DEFAULT_ALERT_THRESHOLD_MINUTES)}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
