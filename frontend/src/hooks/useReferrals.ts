/**
 * Nila Arumbu — Referral Hooks
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type PagedResponse } from '../lib/api';
import { queryKeys } from '../lib/queryKeys';
import type { ReferralRead } from '../lib/types';

export function useChildReferrals(childId: string) {
  return useQuery({
    queryKey: queryKeys.referrals.byChild(childId),
    queryFn: () =>
      api.get<PagedResponse<ReferralRead>>(`/referrals/children/${childId}`),
    enabled: !!childId,
  });
}

export function useReferralsByStatus(status: string) {
  return useQuery({
    queryKey: queryKeys.referrals.byStatus(status),
    queryFn: () =>
      api.get<PagedResponse<ReferralRead>>(`/referrals/by-status/${status}`),
    enabled: !!status,
  });
}

export function useCreateReferral() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post<ReferralRead>('/referrals/', data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.referrals.byChild(data.child_id) });
    },
  });
}

export function useTransitionReferral() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      referralId,
      target_state,
      notes,
    }: {
      referralId: string;
      target_state: string;
      notes?: string;
    }) => api.post<ReferralRead>(`/referrals/${referralId}/transition`, { target_state, notes }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.referrals.byChild(data.child_id) });
      qc.invalidateQueries({ queryKey: queryKeys.referrals.detail(data.id) });
    },
  });
}
