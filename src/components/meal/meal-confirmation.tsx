"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Check, Undo2, Home, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { callUndoMeal } from "@/lib/firebase/functions";
import { formatTimeAgo } from "@/lib/utils/dates";
import { useToast } from "@/lib/hooks/use-toast";
import Link from "next/link";
import type { MealEvent } from "@/lib/types";

interface MealConfirmationProps {
  event: Omit<MealEvent, "id"> & { id?: string };
  eventId: string;
  isDuplicate?: boolean;
  duplicateEvent?: MealEvent;
}

export function MealConfirmation({
  event,
  eventId,
  isDuplicate,
  duplicateEvent,
}: MealConfirmationProps) {
  const { uid } = useAuth();
  const { toast } = useToast();
  const [isUndoing, setIsUndoing] = useState(false);
  const [undone, setUndone] = useState(false);
  const [, setTick] = useState(0);

  // Update "hace X" every 30s
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleUndo = useCallback(async () => {
    if (!uid || !eventId || isUndoing) return;
    setIsUndoing(true);
    try {
      const result = await callUndoMeal(eventId, uid);
      if (result.success) {
        setUndone(true);
        toast({ title: "Comida deshecha", description: "Se eliminó el registro" });
      }
    } catch {
      toast({
        title: "Error",
        description: "No se pudo deshacer. Puede que haya pasado el tiempo límite.",
        variant: "destructive",
      });
    } finally {
      setIsUndoing(false);
    }
  }, [uid, eventId, isUndoing, toast]);

  if (isDuplicate && duplicateEvent) {
    const dupTime = duplicateEvent.timestamp.toDate();
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-warning/10"
        >
          <Clock className="h-10 w-10 text-warning" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h1 className="mb-2 text-xl font-bold">Ya se registró</h1>
          <p className="mb-1 text-muted-foreground">
            {duplicateEvent.dispenserName} por {duplicateEvent.memberName}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatTimeAgo(dupTime)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              <Home className="h-4 w-4" />
              Ir al inicio
            </Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  if (undone) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted"
        >
          <Undo2 className="h-10 w-10 text-muted-foreground" />
        </motion.div>
        <h1 className="mb-2 text-xl font-bold">Deshecho</h1>
        <p className="mb-8 text-muted-foreground">Se eliminó el registro</p>
        <Button asChild variant="outline" size="lg">
          <Link href="/">
            <Home className="h-4 w-4" />
            Ir al inicio
          </Link>
        </Button>
      </div>
    );
  }

  const eventTime = event.timestamp
    ? typeof event.timestamp === "object" && "toDate" in event.timestamp
      ? event.timestamp.toDate()
      : new Date()
    : new Date();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-6">
      {/* Success checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-success/10"
      >
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
        >
          <Check className="h-12 w-12 text-success" strokeWidth={3} />
        </motion.div>
      </motion.div>

      {/* Event info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <h1 className="mb-1 text-2xl font-bold">Comida registrada</h1>
        <div
          className="mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1"
          style={{ backgroundColor: `${event.dispenserColor}20` }}
        >
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: event.dispenserColor }}
          />
          <span className="text-sm font-medium">{event.dispenserName}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {formatTimeAgo(eventTime)} · {event.memberName}
        </p>
        {event.amountGrams > 0 && (
          <p className="text-sm text-muted-foreground">
            {event.amountGrams}g
          </p>
        )}
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex flex-col gap-3 w-full max-w-xs"
      >
        <Button
          variant="outline"
          size="lg"
          onClick={handleUndo}
          disabled={isUndoing}
          className="w-full"
        >
          {isUndoing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="h-4 w-4 rounded-full border-2 border-foreground border-t-transparent"
            />
          ) : (
            <>
              <Undo2 className="h-4 w-4" />
              Deshacer
            </>
          )}
        </Button>

        <Button asChild size="lg" className="w-full">
          <Link href="/">
            <Home className="h-4 w-4" />
            Ir al inicio
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
