"use client";

export const dynamic = "force-dynamic";

import { motion } from "framer-motion";
import Image from "next/image";
import { AppShell } from "@/components/layout/app-shell";
import { TodaySummary } from "@/components/dashboard/today-summary";
import { AlertBanner } from "@/components/dashboard/alert-banner";
import { ManualAddDialog } from "@/components/meal/manual-add-dialog";
import { MealCard } from "@/components/meal/meal-card";
import { NotificationPermissionPrompt } from "@/components/notifications/permission-prompt";
import { useMealsToday } from "@/lib/hooks/use-meals-today";
import { useAuth } from "@/providers/auth-provider";
import { Dog } from "lucide-react";

export default function HomePage() {
  const { memberName } = useAuth();
  const { meals, isLoading } = useMealsToday();

  return (
    <AppShell>
      {/* Immersive Fixed Background Image */}
      <div className="fixed inset-0 w-full h-[60vh] z-[-1] pointer-events-none">
        <Image
          src="/images/enzo-real.jpg"
          alt="Enzo"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Gradient that fades black/dark to transparent over the image */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent opacity-80" />
        {/* Thick gradient at the bottom that smoothly fades the image into the dark background of the app */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent" />
      </div>

      <div className="mx-auto max-w-lg min-h-screen">
        {/* Greeting overlay (sticky on top or just scrolling normally, let's make it scroll so it feels physical) */}
        <div className="relative pt-[20vh] pb-6 px-6">
          <div className="flex items-end justify-between">
            <div className="flex-1">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-4xl font-black text-white tracking-tight"
                style={{ textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}
              >
                Hola, <br />
                {memberName} 👋
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mt-2 text-lg font-medium text-white/90"
                style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
              >
                ¿Enzo ya comió hoy?
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <ManualAddDialog />
            </motion.div>
          </div>
        </div>

        {/* Content area: floats up over the gradient */}
        <div className="relative z-10 space-y-5 px-4 pb-24">
          {/* Alert banner */}
          <AlertBanner />

          {/* Today summary with glass effect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <TodaySummary />
          </motion.div>

          {/* Today's meals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest pl-2">
                Hoy
              </h2>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-20 animate-pulse rounded-2xl bg-white/5"
                  />
                ))}
              </div>
            ) : meals.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center border-2 border-dashed border-white/10 rounded-3xl bg-black/20 backdrop-blur-sm">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
                  <Dog className="h-8 w-8 text-white/40" />
                </div>
                <p className="text-base font-semibold text-white/80">
                  Sin comidas registradas
                </p>
                <p className="text-sm text-white/50 mt-1">
                  Escaneá un tag o agregá manualmente
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {meals.map((meal, i) => (
                  <MealCard key={meal.id} meal={meal} index={i} />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <NotificationPermissionPrompt />
    </AppShell>
  );
}
