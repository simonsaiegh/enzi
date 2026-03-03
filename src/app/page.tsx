"use client";

export const dynamic = "force-dynamic";

import { motion } from "framer-motion";
import { Dog } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { TodaySummary } from "@/components/dashboard/today-summary";
import { AlertBanner } from "@/components/dashboard/alert-banner";
import { ManualAddDialog } from "@/components/meal/manual-add-dialog";
import { MealCard } from "@/components/meal/meal-card";
import { NotificationPermissionPrompt } from "@/components/notifications/permission-prompt";
import { useMealsToday } from "@/lib/hooks/use-meals-today";
import { useAuth } from "@/providers/auth-provider";

export default function HomePage() {
  const { memberName } = useAuth();
  const { meals, isLoading } = useMealsToday();

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
              <Dog className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Enzi</h1>
              <p className="text-xs text-muted-foreground">
                Hola, {memberName}
              </p>
            </div>
          </div>
          <ManualAddDialog />
        </motion.div>

        {/* Alert banner */}
        <AlertBanner />

        {/* Today summary */}
        <TodaySummary />

        {/* Today's meals */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Hoy
            </h2>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-xl bg-muted"
                />
              ))}
            </div>
          ) : meals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center py-12 text-center"
            >
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <Dog className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Sin comidas registradas hoy
              </p>
              <p className="text-xs text-muted-foreground/70">
                Escaneá un tag NFC o agregá manualmente
              </p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {meals.map((meal, i) => (
                <MealCard key={meal.id} meal={meal} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>

      <NotificationPermissionPrompt />
    </AppShell>
  );
}
