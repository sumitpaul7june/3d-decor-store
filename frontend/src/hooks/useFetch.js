// Generic async data-fetching hook shared across all pages.
// Eliminates the repeated loading/error/useEffect boilerplate.
import { useState, useEffect, useCallback } from "react";

/**
 * useFetch(fetcher)
 *
 * @param {() => Promise<any>} fetcher - Async function that returns the data.
 *   Pass a stable reference (inline arrow fn is fine — the hook only runs on mount).
 *
 * @returns {{ data: any, loading: boolean, error: string, reload: () => void }}
 */
export function useFetch(fetcher) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
