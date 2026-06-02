/**
 * Nila Arumbu — Analytics Hooks
 */
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface PlatformSummary {
  total_children: number;
  total_centres: number;
  total_workers: number;
  risk_distribution: Record<string, number>;
  open_referrals: number;
  escalated_referrals: number;
  attendance_rate_today: number;
  as_of: string;
}

export interface CentreRiskSummary {
  centre_id: string;
  centre_name: string;
  total_children: number;
  green_count: number;
  yellow_count: number;
  red_count: number;
  unassessed_count: number;
}

export interface ReferralAgingReport {
  status: string;
  count: number;
  avg_days_in_status: number;
  oldest_days: number;
  escalated_count: number;
}

export function usePlatformSummary() {
  return useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: () => api.get<PlatformSummary>('/analytics/summary'),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useCentreRiskSummary() {
  return useQuery({
    queryKey: ['analytics', 'centres', 'risk'],
    queryFn: () => api.get<CentreRiskSummary[]>('/analytics/centres/risk'),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useReferralAging() {
  return useQuery({
    queryKey: ['analytics', 'referrals', 'aging'],
    queryFn: () => api.get<ReferralAgingReport[]>('/analytics/referrals/aging'),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}
