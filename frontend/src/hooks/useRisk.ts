/**
 * Nila Arumbu — Risk Engine Hooks
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type PagedResponse } from '../lib/api';
import { queryKeys } from '../lib/queryKeys';
import type { RiskScoreRead } from '../lib/types';

export function useLatestRisk(childId: string) {
  return useQuery({
    queryKey: queryKeys.risk.latest(childId),
    queryFn: () => api.get<RiskScoreRead>(`/risk/children/${childId}/latest`),
    enabled: !!childId,
    retry: false,
  });
}

export function useRiskHistory(childId: string) {
  return useQuery({
    queryKey: queryKeys.risk.history(childId),
    queryFn: () => api.get<PagedResponse<RiskScoreRead>>(`/risk/children/${childId}/history`),
    enabled: !!childId,
  });
}

export function useCalculateRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post<RiskScoreRead>('/risk/calculate', data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.risk.latest(data.child_id) });
      qc.invalidateQueries({ queryKey: queryKeys.risk.history(data.child_id) });
    },
  });
}
