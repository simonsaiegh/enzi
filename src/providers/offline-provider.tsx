"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useOnlineStatus } from "@/lib/hooks/use-online-status";
import { getQueueSize, enqueueAction, type OfflineAction } from "@/lib/offline/queue";
import { syncOfflineQueue } from "@/lib/offline/sync";
import { useToast } from "@/lib/hooks/use-toast";

interface OfflineContextValue {
  isOnline: boolean;
  queueSize: number;
  addToQueue: (action: Omit<OfflineAction, "id">) => Promise<void>;
  syncNow: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextValue>({
  isOnline: true,
  queueSize: 0,
  addToQueue: async () => {},
  syncNow: async () => {},
});

export function OfflineProvider({ children }: { children: ReactNode }) {
  const { isOnline } = useOnlineStatus();
  const [queueSize, setQueueSize] = useState(0);
  const { toast } = useToast();

  // Check queue size on mount
  useEffect(() => {
    getQueueSize().then(setQueueSize);
  }, []);

  // Sync when coming back online
  useEffect(() => {
    if (isOnline && queueSize > 0) {
      syncNow();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  const addToQueue = useCallback(
    async (action: Omit<OfflineAction, "id">) => {
      await enqueueAction(action);
      const size = await getQueueSize();
      setQueueSize(size);
    },
    []
  );

  const syncNow = useCallback(async () => {
    const result = await syncOfflineQueue();
    const size = await getQueueSize();
    setQueueSize(size);

    if (result.synced > 0) {
      toast({
        title: "Sincronizado",
        description: `${result.synced} accion(es) sincronizada(s)`,
      });
    }
    if (result.failed > 0) {
      toast({
        title: "Error de sincronizacion",
        description: `${result.failed} accion(es) fallaron`,
        variant: "destructive",
      });
    }
  }, [toast]);

  return (
    <OfflineContext.Provider
      value={{ isOnline, queueSize, addToQueue, syncNow }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  return useContext(OfflineContext);
}
