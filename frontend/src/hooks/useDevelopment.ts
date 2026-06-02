/**
 * Nila Arumbu — Development Assessment Hooks
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type PagedResponse } from '../lib/api';
import { queryKeys } from '../lib/queryKeys';
import type { AssessmentRead } from '../lib/types';

export interface DevelopmentSummary {
  child_id: string;
  latest_status: string | null;
  latest_overall_score: number | null;
  assessment_count: number;
  trend: 'IMPROVING' | 'DECLINING' | 'STABLE' | 'INSUFFICIENT_DATA';
}

export function useDevelopmentSummary(childId: string) {
  return useQuery({
    queryKey: queryKeys.development.summary(childId),
    queryFn: () => api.get<DevelopmentSummary>(`/development/children/${childId}/summary`),
    enabled: !!childId,
    retry: false,
  });
}

export function useDevelopmentAssessments(childId: string) {
  return useQuery({
    queryKey: queryKeys.development.byChild(childId),
    queryFn: () =>
      api.get<PagedResponse<AssessmentRead>>(`/development/children/${childId}?size=10`),
    enabled: !!childId,
  });
}

export function useRecordAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post<AssessmentRead>('/development/assessments/', data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.development.byChild(data.child_id) });
      qc.invalidateQueries({ queryKey: queryKeys.development.summary(data.child_id) });
    },
  });
}
