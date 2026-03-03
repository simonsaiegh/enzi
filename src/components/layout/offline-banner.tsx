"use client";

import { motion, AnimatePresence } from "framer-motion";
import { WifiOff } from "lucide-react";
import { useOffline } from "@/providers/offline-provider";

export function OfflineBanner() {
  const { isOnline, queueSize } = useOffline();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-muted px-4 py-2 text-center"
        >
          <WifiOff className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            Sin conexión
            {queueSize > 0 && ` · ${queueSize} pendiente(s)`}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
