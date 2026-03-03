"use client";

import { useState, useEffect } from "react";
import { subscribeDispensers } from "@/lib/firebase/firestore";
import type { Dispenser } from "@/lib/types";

export function useDispensers() {
  const [dispensers, setDispensers] = useState<Dispenser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeDispensers((newDispensers) => {
      setDispensers(newDispensers);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { dispensers, isLoading };
}
