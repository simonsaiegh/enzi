"use client";

import { motion } from "framer-motion";
import {
  Sunrise,
  Sunset,
  Cookie,
  Pill,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import { formatTime, formatTimeAgo } from "@/lib/utils/dates";
import type { MealEvent } from "@/lib/types";

const iconMap: Record<string, LucideIcon> = {
  sunrise: Sunrise,
  sunset: Sunset,
  cookie: Cookie,
  pill: Pill,
  utensils: Utensils,
};

interface MealCardProps {
  meal: MealEvent;
  index?: number;
}

export function MealCard({ meal, index = 0 }: MealCardProps) {
  const Icon = iconMap[meal.dispenserIcon] || Utensils;
  const mealTime = meal.timestamp.toDate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-sm border border-border/50"
    >
      {/* Icon */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${meal.dispenserColor}20` }}
      >
        <Icon
          className="h-5 w-5"
          style={{ color: meal.dispenserColor }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{meal.dispenserName}</p>
        <p className="text-xs text-muted-foreground">
          {meal.memberName}
          {meal.amountGrams > 0 && ` · ${meal.amountGrams}g`}
          {meal.notes && ` · ${meal.notes}`}
        </p>
      </div>

      {/* Time */}
      <div className="text-right shrink-0">
        <p className="text-sm font-medium tabular-nums">{formatTime(mealTime)}</p>
        <p className="text-[10px] text-muted-foreground">
          {formatTimeAgo(mealTime)}
        </p>
      </div>
    </motion.div>
  );
}
