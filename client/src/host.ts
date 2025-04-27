import { useMemo } from "react";

export function useBackendHost(): string {
  return useMemo(() => {
    return import.meta.env.VITE_BACKEND_HOST || 'localhost';
  }, []);
}
