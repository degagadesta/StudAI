import { createContext, useContext, useCallback, useRef, ReactNode } from "react";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface CacheContextType {
  get: <T>(key: string) => T | null;
  set: <T>(key: string, data: T, ttl?: number) => void;
  invalidate: (key: string) => void;
  invalidateAll: () => void;
}

const CacheContext = createContext<CacheContextType | null>(null);

export function CacheProvider({ children }: { children: ReactNode }) {
  const cache = useRef<Map<string, CacheEntry<unknown>>>(new Map());
  const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  const get = useCallback(<T,>(key: string): T | null => {
    const entry = cache.current.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > DEFAULT_TTL) {
      cache.current.delete(key);
      return null;
    }

    return entry.data;
  }, []);

  const set = useCallback(<T,>(key: string, data: T, ttl: number = DEFAULT_TTL) => {
    cache.current.set(key, {
      data,
      timestamp: Date.now(),
    });
  }, []);

  const invalidate = useCallback((key: string) => {
    cache.current.delete(key);
  }, []);

  const invalidateAll = useCallback(() => {
    cache.current.clear();
  }, []);

  return (
    <CacheContext.Provider value={{ get, set, invalidate, invalidateAll }}>
      {children}
    </CacheContext.Provider>
  );
}

export function useCache() {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error("useCache must be used within a CacheProvider");
  }
  return context;
}
