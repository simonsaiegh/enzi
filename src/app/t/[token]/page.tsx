"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useRef, use } from "react";
import { motion } from "framer-motion";
import { Loader2, Dog, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { NamePrompt } from "@/components/auth/name-prompt";
import { MealConfirmation } from "@/components/meal/meal-confirmation";
import { callRegisterMeal } from "@/lib/firebase/functions";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import Link from "next/link";
import type { MealEvent } from "@/lib/types";

type PageState =
  | { type: "loading" }
  | { type: "needs-name" }
  | { type: "registering" }
  | {
      type: "success";
      eventId: string;
      event: Omit<MealEvent, "id">;
    }
  | {
      type: "duplicate";
      existingEvent: MealEvent;
    }
  | { type: "error"; message: string };

export default function NFCScanPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const { uid, memberName, isLoading: authLoading, needsName } = useAuth();
  const [state, setState] = useState<PageState>({ type: "loading" });
  const hasRegistered = useRef(false);

  useEffect(() => {
    if (authLoading) return;

    if (needsName) {
      setState({ type: "needs-name" });
      return;
    }

    if (!memberName) return;

    // If Firebase is not configured, we can't call Cloud Functions
    if (!isFirebaseConfigured || !uid) {
      setState({
        type: "error",
        message: "Firebase no está configurado. Configurá las variables de entorno para usar NFC.",
      });
      return;
    }

    // Prevent double registration on React StrictMode double-mount
    if (hasRegistered.current) return;
    hasRegistered.current = true;

    setState({ type: "registering" });

    callRegisterMeal(token, uid, memberName)
      .then((result) => {
        if (result.duplicate && result.existingEvent) {
          setState({
            type: "duplicate",
            existingEvent: result.existingEvent as MealEvent,
          });
        } else if (result.success && result.eventId) {
          setState({
            type: "success",
            eventId: result.eventId,
            event: result.event as Omit<MealEvent, "id">,
          });
        } else {
          setState({
            type: "error",
            message: result.error || "Error desconocido",
          });
        }
      })
      .catch((err) => {
        setState({
          type: "error",
          message:
            err?.message || "No se pudo registrar la comida. Intentá de nuevo.",
        });
      });
  }, [token, uid, memberName, authLoading, needsName]);

  // Reset ref if name just got set
  useEffect(() => {
    if (state.type === "needs-name" && !needsName && uid && memberName) {
      hasRegistered.current = false;
    }
  }, [state.type, needsName, uid, memberName]);

  if (state.type === "needs-name") {
    return <NamePrompt />;
  }

  if (state.type === "loading" || state.type === "registering") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10"
          >
            <Dog className="h-10 w-10 text-primary" />
          </motion.div>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Registrando comida...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (state.type === "success") {
    return (
      <MealConfirmation
        event={state.event}
        eventId={state.eventId}
      />
    );
  }

  if (state.type === "duplicate") {
    return (
      <MealConfirmation
        event={state.existingEvent}
        eventId={state.existingEvent.id}
        isDuplicate
        duplicateEvent={state.existingEvent}
      />
    );
  }

  // Error state
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10"
      >
        <AlertCircle className="h-10 w-10 text-destructive" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <h1 className="mb-2 text-xl font-bold">Error</h1>
        <p className="mb-8 text-sm text-muted-foreground">{state.message}</p>
      </motion.div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => {
            hasRegistered.current = false;
            setState({ type: "loading" });
          }}
        >
          Reintentar
        </Button>
        <Button asChild>
          <Link href="/">Ir al inicio</Link>
        </Button>
      </div>
    </div>
  );
}
