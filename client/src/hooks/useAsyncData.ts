import { useState, useCallback, useEffect } from "react";

interface UseAsyncDataOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  retryCount?: number;
  retryDelay?: number;
}

interface UseAsyncDataState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  retry: () => Promise<void>;
  reset: () => void;
}

/**
 * Hook personnalisé pour gérer les états d'erreur et de chargement
 * avec support des tentatives automatiques
 */
export function useAsyncData<T>(
  asyncFn: () => Promise<T>,
  options: UseAsyncDataOptions<T> = {}
): UseAsyncDataState<T> {
  const {
    onSuccess,
    onError,
    retryCount = 3,
    retryDelay = 1000,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);

  const executeAsync = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFn();
      setData(result);
      setAttemptCount(0);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));

      if (attemptCount < retryCount) {
        // Tentative automatique
        setTimeout(() => {
          setAttemptCount((prev) => prev + 1);
        }, retryDelay);
      } else {
        setError(error);
        onError?.(error);
      }
    } finally {
      setLoading(false);
    }
  }, [asyncFn, onSuccess, onError, retryCount, retryDelay, attemptCount]);

  useEffect(() => {
    executeAsync();
  }, [executeAsync]);

  const retry = useCallback(async () => {
    setAttemptCount(0);
    await executeAsync();
  }, [executeAsync]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
    setAttemptCount(0);
  }, []);

  return { data, loading, error, retry, reset };
}

/**
 * Hook pour gérer les états de mutation (POST, PUT, DELETE)
 */
interface UseMutationState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  mutate: (input?: any) => Promise<T | null>;
  reset: () => void;
}

export function useMutation<T>(
  mutationFn: (input?: any) => Promise<T>,
  options: UseAsyncDataOptions<T> = {}
): UseMutationState<T> {
  const { onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (input?: any) => {
      try {
        setLoading(true);
        setError(null);
        const result = await mutationFn(input);
        setData(result);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [mutationFn, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return { data, loading, error, mutate, reset };
}
