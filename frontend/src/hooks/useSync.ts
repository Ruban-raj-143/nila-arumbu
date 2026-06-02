/**
 * Nila Arumbu — Background Sync Hook
 * Processes the offline sync queue when connectivity is restored.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { getPendingOps, incrementRetry, removeOp } from '../store/db';

const MAX_RETRIES = 3;

export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sync = useCallback(async () => {
    if (!navigator.onLine) return;

    const ops = await getPendingOps();
    setPendingCount(ops.length);
    if (ops.length === 0) return;

    setIsSyncing(true);
    for (const op of ops) {
      if (op.retryCount >= MAX_RETRIES) {
        // Give up after max retries — leave for manual resolution
        continue;
      }
      try {
        if (op.method === 'POST') {
          await api.post(op.endpoint, op.payload);
        } else if (op.method === 'PATCH') {
          await api.patch(op.endpoint, op.payload);
        } else if (op.method === 'DELETE') {
          await api.delete(op.endpoint);
        }
        await removeOp(op.id!);
      } catch {
        await incrementRetry(op.id!);
      }
    }

    const remaining = await getPendingOps();
    setPendingCount(remaining.length);
    setIsSyncing(false);
  }, []);

  useEffect(() => {
    // Sync on mount and when coming back online
    sync();
    window.addEventListener('online', sync);

    // Poll every 30 seconds
    intervalRef.current = setInterval(sync, 30_000);

    return () => {
      window.removeEventListener('online', sync);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sync]);

  return { isSyncing, pendingCount, syncNow: sync };
}
