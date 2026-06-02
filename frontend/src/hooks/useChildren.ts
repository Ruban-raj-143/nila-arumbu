/**
 * Nila Arumbu — Children Hooks
 * Offline-first: reads from IndexedDB, syncs with backend.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type PagedResponse } from '../lib/api';
import { queryKeys } from '../lib/queryKeys';
import type { ChildCreate, ChildRead } from '../lib/types';
import { db, enqueue } from '../store/db';

// ── List children ─────────────────────────────────────────────────────────────

export function useChildren(centreId?: string) {
  return useQuery({
    queryKey: queryKeys.children.all(centreId),
    queryFn: async () => {
      const path = centreId
        ? `/children?centre_id=${centreId}&size=100`
        : '/children?size=100';
      const res = await api.get<PagedResponse<ChildRead>>(path);
      // Update IndexedDB for offline use
      try {
        await db.children.clear();
        await db.children.bulkPut(
          res.items.map((c) => ({ ...c, _syncStatus: 'synced' as const })),
        );
      } catch {
        // IndexedDB failure is non-fatal — continue with server data
      }
      return res.items;
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

// ── Single child ──────────────────────────────────────────────────────────────

export function useChild(childId: string) {
  return useQuery({
    queryKey: queryKeys.children.detail(childId),
    queryFn: async () => {
      try {
        const child = await api.get<ChildRead>(`/children/${childId}`);
        await db.children.put({ ...child, _syncStatus: 'synced' });
        return child;
      } catch {
        return db.children.get(childId) ?? null;
      }
    },
    enabled: !!childId,
  });
}

// ── Register child ────────────────────────────────────────────────────────────

export function useRegisterChild() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: ChildCreate) => {
      try {
        const child = await api.post<ChildRead>('/children', data);
        await db.children.put({ ...child, _syncStatus: 'synced' });
        return child;
      } catch {
        // Offline — create locally and queue for sync
        const tempId = `offline-${Date.now()}`;
        const offlineChild: ChildRead = {
          id: tempId,
          ...data,
          aadhaar_number: data.aadhaar_number ?? null,
          mother_name: data.mother_name ?? null,
          father_name: data.father_name ?? null,
          guardian_name: data.guardian_name ?? null,
          guardian_phone: data.guardian_phone ?? null,
          centre_id: data.centre_id ?? null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await db.children.add({ ...offlineChild, _syncStatus: 'pending' });
        await enqueue({
          action: 'CREATE',
          entity: 'CHILD',
          endpoint: '/children',
          method: 'POST',
          payload: data,
        });
        return offlineChild;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.children.all() });
    },
  });
}
