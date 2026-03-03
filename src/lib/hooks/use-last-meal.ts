"use client";

import { useState, useEffect } from "react";
import { subscribeLastMeal } from "@/lib/firebase/firestore";
import type { MealEvent } from "@/lib/types";

export function useLastMeal() {
  const [lastMeal, setLastMeal] = useState<MealEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeLastMeal((meal) => {
      setLastMeal(meal);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { lastMeal, isLoading };
}
