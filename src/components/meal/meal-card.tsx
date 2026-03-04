"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sunrise,
  Sunset,
  Cookie,
  Pill,
  Utensils,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { formatTime, formatTimeAgo } from "@/lib/utils/dates";
import { callUndoMeal } from "@/lib/firebase/functions";
import { useAuth } from "@/providers/auth-provider";
import type { MealEvent } from "@/lib/types";
import Image from "next/image";

const iconMap: Record<string, LucideIcon> = {
  sunrise: Sunrise,
  sunset: Sunset,
  cookie: Cookie,
  pill: Pill,
  utensils: Utensils,
};

/** Returns true if hour is between 6:00 and 18:59 */
function isDaytime(date: Date): boolean {
  const h = date.getHours();
  return h >= 6 && h < 19;
}

interface MealCardProps {
  meal: MealEvent;
  index?: number;
  onDeleted?: () => void;
}

// --- Sky decoration components ---

function Stars() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Stars */}
      {[
        { top: "15%", left: "10%", size: 2, delay: 0 },
        { top: "25%", left: "75%", size: 1.5, delay: 0.5 },
        { top: "10%", left: "50%", size: 1, delay: 1 },
        { top: "35%", left: "85%", size: 2, delay: 0.3 },
        { top: "20%", left: "30%", size: 1.5, delay: 0.8 },
        { top: "8%", left: "65%", size: 1, delay: 1.2 },
        { top: "30%", left: "15%", size: 1, delay: 0.6 },
        { top: "12%", left: "90%", size: 1.5, delay: 0.2 },
      ].map((star, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
          }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
        />
      ))}
      {/* Moon */}
      <div
        className="absolute h-5 w-5 rounded-full bg-yellow-50 shadow-[0_0_12px_rgba(254,252,232,0.6)]"
        style={{ top: "12%", left: "75%" }}
      />
      {/* Shooting star */}
      <motion.div
        className="absolute h-[1px] w-8 bg-gradient-to-r from-transparent via-white to-transparent"
        style={{ top: "18%", left: "40%", transform: "rotate(-30deg)" }}
        animate={{ x: [0, 40], y: [0, 20], opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 4 }}
      />
    </div>
  );
}

function Clouds() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Sun */}
      <div className="absolute" style={{ top: "-6px", right: "50px" }}>
        <div className="relative">
          {/* Sun rays */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-white/30"
                style={{
                  width: 2,
                  height: 8,
                  transform: `rotate(${i * 45}deg) translateY(-18px)`,
                }}
              />
            ))}
          </motion.div>
          {/* Sun body */}
          <div className="h-7 w-7 rounded-full bg-yellow-300 shadow-[0_0_16px_rgba(253,224,71,0.5)]" />
        </div>
      </div>
      {/* Cloud 1 */}
      <svg
        className="absolute opacity-40"
        style={{ bottom: "-2px", right: "2%" }}
        width="50"
        height="20"
        viewBox="0 0 50 20"
      >
        <ellipse cx="16" cy="14" rx="12" ry="6" fill="white" />
        <ellipse cx="28" cy="10" rx="10" ry="8" fill="white" />
        <ellipse cx="38" cy="14" rx="10" ry="6" fill="white" />
      </svg>
      {/* Cloud 2 */}
      <motion.svg
        className="absolute opacity-30"
        style={{ bottom: "0px", left: "15%" }}
        width="40"
        height="16"
        viewBox="0 0 40 16"
        animate={{ x: [0, 6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <ellipse cx="12" cy="10" rx="10" ry="5" fill="white" />
        <ellipse cx="22" cy="7" rx="8" ry="7" fill="white" />
        <ellipse cx="30" cy="10" rx="8" ry="5" fill="white" />
      </motion.svg>
    </div>
  );
}

export function MealCard({ meal, index = 0, onDeleted }: MealCardProps) {
  const Icon = iconMap[meal.dispenserIcon] || Utensils;
  const mealTime = meal.timestamp.toDate();
  const isDay = isDaytime(mealTime);
  const { uid } = useAuth();

  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const handleDelete = async () => {
    if (!uid) return;
    setDeleting(true);
    try {
      await callUndoMeal(meal.id, uid);
      setDeleted(true);
      onDeleted?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      if (msg.includes("deadline") || msg.includes("5 min")) {
        alert("Ya pasaron más de 5 minutos, no se puede deshacer.");
      } else {
        alert(msg);
      }
    } finally {
      setDeleting(false);
    }
  };

  if (deleted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      className="relative overflow-hidden rounded-xl shadow-sm cursor-pointer select-none"
      style={{
        background: isDay
          ? "linear-gradient(135deg, #FBBF24 0%, #F59E0B 40%, #F97316 100%)"
          : "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1e3a5f 100%)",
        minHeight: 76,
      }}
      onClick={() => setShowDelete((s) => !s)}
    >
      {/* Sky decorations */}
      {isDay ? <Clouds /> : <Stars />}

      {/* Content */}
      <div className="relative z-10 flex items-center gap-3 p-3">
        {/* Icon */}
        <div className="shrink-0 flex items-center justify-center mr-1">
          {meal.dispenserIcon === "utensils" ? (
            <div className="relative h-14 w-11">
              <Image
                src="/icons/food.png"
                alt="Bolsa de Comida"
                fill
                className="object-contain drop-shadow-md"
              />
            </div>
          ) : (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg shadow-inner"
              style={{
                backgroundColor: isDay ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)",
              }}
            >
              <Icon
                className="h-5 w-5"
                style={{ color: "white" }}
              />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
          <p className="font-semibold text-sm truncate text-white">
            {meal.dispenserName}
          </p>
          <p className="text-xs text-white/75">
            {meal.memberName}
            {meal.amountGrams > 0 && ` · ${meal.amountGrams}g`}
            {meal.notes && ` · ${meal.notes}`}
          </p>
        </div>

        {/* Time */}
        <div className="text-right shrink-0" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
          <p className="text-sm font-bold tabular-nums text-white">
            {formatTime(mealTime)}
          </p>
          <p className="text-[10px] text-white/60">
            {formatTimeAgo(mealTime)}
          </p>
        </div>

        {/* Delete button */}
        <AnimatePresence>
          {showDelete && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5, width: 0 }}
              animate={{ opacity: 1, scale: 1, width: "auto" }}
              exit={{ opacity: 0, scale: 0.5, width: 0 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              disabled={deleting}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors disabled:opacity-50"
              style={{
                backgroundColor: isDay ? "rgba(220,38,38,0.2)" : "rgba(248,113,113,0.2)",
              }}
              title="Eliminar registro"
            >
              <Trash2 className={`h-4 w-4 ${deleting ? "animate-pulse" : ""} ${isDay ? "text-red-700" : "text-red-300"}`} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
