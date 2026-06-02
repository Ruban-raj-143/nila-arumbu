/**
 * Nila Arumbu — Attendance Hooks
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type PagedResponse } from '../lib/api';
import { queryKeys } from '../lib/queryKeys';
import type { AttendanceCreate, AttendanceRead, AttendanceSummary } from '../lib/types';
import { db, enqueue } from '../store/db';

export function useChildAttendance(childId: string) {
  return useQuery({
    queryKey: queryKeys.attendance.byChild(childId),
    queryFn: async () => {
      try {
        const res = await api.get<PagedResponse<AttendanceRead>>(
          `/attendance/children/${childId}?size=50`,
        );
        await db.attendance.bulkPut(
          res.items.map((r) => ({ ...r, _syncStatus: 'synced' as const })),
        );
        return res.items;
      } catch {
        return db.attendance.where('child_id').equals(childId).toArray();
      }
    },
    enabled: !!childId,
  });
}

export function useAttendanceSummary(childId: string) {
  return useQuery({
    queryKey: queryKeys.attendance.summary(childId),
    queryFn: () => api.get<AttendanceSummary>(`/attendance/children/${childId}/summary`),
    enabled: !!childId,
  });
}

export function useRecordAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: AttendanceCreate) => {
      try {
        const record = await api.post<AttendanceRead>('/attendance', data);
        await db.attendance.put({ ...record, _syncStatus: 'synced' });
        return record;
      } catch {
        // Offline queue
        const tempId = `offline-att-${Date.now()}`;
        const offline: AttendanceRead = {
          id: tempId,
          ...data,
          notes: data.notes ?? null,
          created_at: new Date().toISOString(),
        };
        await db.attendance.add({ ...offline, _syncStatus: 'pending' });
        await enqueue({
          action: 'CREATE',
          entity: 'ATTENDANCE',
          endpoint: '/attendance',
          method: 'POST',
          payload: data,
        });
        return offline;
      }
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.attendance.byChild(data.child_id) });
      qc.invalidateQueries({ queryKey: queryKeys.attendance.summary(data.child_id) });
    },
  });
}
