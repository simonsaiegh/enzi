"use client";

import { useState, useEffect } from "react";
import { subscribeMealsToday } from "@/lib/firebase/firestore";
import type { MealEvent } from "@/lib/types";

export function useMealsToday() {
  const [meals, setMeals] = useState<MealEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeMealsToday((newMeals) => {
      setMeals(newMeals);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { meals, isLoading };
}
