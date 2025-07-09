import { useState, useCallback } from "react";
import { CulturalPreferences } from "@/lib/types";

export const usePreferences = () => {
  const [preferences, setPreferences] = useState<CulturalPreferences>({
    music: [],
    movies: [],
    food: [],
    travel: [],
    books: [],
  });

  const addPreference = useCallback(
    (category: keyof CulturalPreferences, item: string) => {
      setPreferences((prev) => ({
        ...prev,
        [category]: [...(prev[category] || []), item].slice(0, 5), // Max 5 per category
      }));
    },
    []
  );

  const removePreference = useCallback(
    (category: keyof CulturalPreferences, item: string) => {
      setPreferences((prev) => ({
        ...prev,
        [category]: (prev[category] || []).filter((p) => p !== item),
      }));
    },
    []
  );

  const clearCategory = useCallback((category: keyof CulturalPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [category]: [],
    }));
  }, []);

  const getTotalPreferences = useCallback(() => {
    return Object.values(preferences).reduce(
      (total, items) => total + items.length,
      0
    );
  }, [preferences]);

  const isValidForAnalysis = useCallback(() => {
    const categoriesWithItems = Object.values(preferences).filter(
      (items) => items.length >= 2
    );
    return categoriesWithItems.length >= 3; // Need at least 3 categories with 2+ items each
  }, [preferences]);

  return {
    preferences,
    addPreference,
    removePreference,
    clearCategory,
    getTotalPreferences,
    isValidForAnalysis,
    setPreferences,
  };
};
