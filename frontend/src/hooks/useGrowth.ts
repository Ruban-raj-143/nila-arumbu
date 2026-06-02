/**
 * Nila Arumbu — Growth Hooks
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type PagedResponse } from '../lib/api';
import { queryKeys } from '../lib/queryKeys';
import type { GrowthRecordRead } from '../lib/types';
import { db, enqueue } from '../store/db';

export interface GrowthTrend {
  child_id: string;
  records: GrowthRecordRead[];
  latest_status: string | null;
  trend_direction: 'IMPROVING' | 'DECLINING' | 'STABLE' | 'INSUFFICIENT_DATA';
}

export function useGrowthRecords(childId: string) {
  return useQuery({
    queryKey: queryKeys.growth.byChild(childId),
    queryFn: async () => {
      try {
        const res = await api.get<PagedResponse<GrowthRecordRead>>(
          `/growth/children/${childId}?size=20`,
        );
        await db.growthRecords.bulkPut(
          res.items.map((r) => ({ ...r, _syncStatus: 'synced' as const })),
        );
        return res.items;
      } catch {
        return db.growthRecords.where('child_id').equals(childId).toArray();
      }
    },
    enabled: !!childId,
  });
}

export function useGrowthTrend(childId: string) {
  return useQuery({
    queryKey: queryKeys.growth.trend(childId),
    queryFn: () => api.get<GrowthTrend>(`/growth/children/${childId}/trend`),
    enabled: !!childId,
    retry: false,
  });
}

export function useRecordGrowth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      child_id: string;
      recorded_date: string;
      weight_kg?: number;
      height_cm?: number;
      muac_cm?: number;
      notes?: string;
    }) => {
      try {
        const record = await api.post<GrowthRecordRead>('/growth', data);
        await db.growthRecords.put({ ...record, _syncStatus: 'synced' });
        return record;
      } catch {
        const tempId = `offline-gr-${Date.now()}`;
        const offline: GrowthRecordRead = {
          id: tempId,
          child_id: data.child_id,
          recorded_date: data.recorded_date,
          weight_kg: data.weight_kg ?? null,
          height_cm: data.height_cm ?? null,
          muac_cm: data.muac_cm ?? null,
          weight_for_age_z: null,
          height_for_age_z: null,
          // weight_for_height_z omitted
          nutrition_status: null,
          notes: data.notes ?? null,
          created_at: new Date().toISOString(),
        };
        await db.growthRecords.add({ ...offline, _syncStatus: 'pending' });
        await enqueue({
          action: 'CREATE',
          entity: 'GROWTH',
          endpoint: '/growth',
          method: 'POST',
          payload: data,
        });
        return offline;
      }
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.growth.byChild(data.child_id) });
      qc.invalidateQueries({ queryKey: queryKeys.growth.trend(data.child_id) });
    },
  });
}
