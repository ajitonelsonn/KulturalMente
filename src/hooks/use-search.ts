// src/hooks/use-search.ts
import { useState, useEffect, useCallback } from "react";
import { QlooEntity } from "@/lib/types";
import { qlooService } from "@/lib/qloo-service";
import { useDebounce } from "./use-debounce";

export const useSearch = (category?: string) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<QlooEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 300);

  const search = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const searchResults = await qlooService.searchEntities(
          searchQuery,
          category
        );
        setResults(searchResults.slice(0, 6)); // Limit to 6 results
      } catch (err) {
        setError("Search failed. Please try again.");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [category]
  );

  useEffect(() => {
    search(debouncedQuery);
  }, [debouncedQuery, search]);

  const clearSearch = useCallback(() => {
    setQuery("");
    setResults([]);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    clearSearch,
  };
};
