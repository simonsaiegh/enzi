"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Clock, ChevronDown, Dog } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { MealCard } from "@/components/meal/meal-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMealHistory } from "@/lib/firebase/firestore";
import { useDispensers } from "@/lib/hooks/use-dispensers";
import { formatDate, isToday, isYesterday } from "@/lib/utils/dates";
import type { MealEvent } from "@/lib/types";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

interface DayGroup {
  label: string;
  meals: MealEvent[];
}

function groupByDay(meals: MealEvent[]): DayGroup[] {
  const groups: Map<string, MealEvent[]> = new Map();

  meals.forEach((meal) => {
    const date = meal.timestamp.toDate();
    const key = date.toDateString();

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(meal);
  });

  return Array.from(groups.entries()).map(([key, dayMeals]) => {
    const date = new Date(key);
    let label: string;
    if (isToday(date)) {
      label = "Hoy";
    } else if (isYesterday(date)) {
      label = "Ayer";
    } else {
      label = formatDate(date);
    }
    return { label, meals: dayMeals };
  });
}

export default function HistorialPage() {
  const [meals, setMeals] = useState<MealEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [dispenserFilter, setDispenserFilter] = useState<string | undefined>();
  const { dispensers } = useDispensers();

  const loadMeals = useCallback(
    async (reset = false) => {
      setIsLoading(true);
      try {
        const result = await getMealHistory(
          20,
          reset ? undefined : lastDoc ?? undefined,
          dispenserFilter
        );
        setMeals((prev) =>
          reset ? result.meals : [...prev, ...result.meals]
        );
        setLastDoc(result.lastDoc);
        setHasMore(result.hasMore);
      } catch (err) {
        console.error("Error loading meals:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [lastDoc, dispenserFilter]
  );

  // Load on mount and when filter changes
  useEffect(() => {
    setMeals([]);
    setLastDoc(null);
    setHasMore(false);
    // We need to call loadMeals with reset=true
    const load = async () => {
      setIsLoading(true);
      try {
        const result = await getMealHistory(20, undefined, dispenserFilter);
        setMeals(result.meals);
        setLastDoc(result.lastDoc);
        setHasMore(result.hasMore);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [dispenserFilter]);

  const dayGroups = groupByDay(meals);

  return (
    <AppShell>
      <div className="mx-auto max-w-lg space-y-4 p-4 pt-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-lg font-bold">Historial</h1>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <Badge
            variant={!dispenserFilter ? "default" : "outline"}
            className="cursor-pointer shrink-0 select-none"
            onClick={() => setDispenserFilter(undefined)}
          >
            Todos
          </Badge>
          {dispensers.map((d) => (
            <Badge
              key={d.id}
              variant={dispenserFilter === d.id ? "default" : "outline"}
              className="cursor-pointer shrink-0 select-none"
              onClick={() =>
                setDispenserFilter(dispenserFilter === d.id ? undefined : d.id)
              }
            >
              <div
                className="mr-1 h-2 w-2 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              {d.name}
            </Badge>
          ))}
        </div>

        {/* Meal list grouped by day */}
        {isLoading && meals.length === 0 ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        ) : meals.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Dog className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Sin registros
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {dayGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </p>
                <div className="space-y-2">
                  {group.meals.map((meal, i) => (
                    <MealCard key={meal.id} meal={meal} index={i} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load more */}
        {hasMore && (
          <div className="flex justify-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => loadMeals()}
              disabled={isLoading}
            >
              {isLoading ? "Cargando..." : "Cargar más"}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
