/**
 * Nila Arumbu — React Query Key Factory
 * Centralised key definitions for cache invalidation.
 */
export const queryKeys = {
  // Auth
  me: () => ['auth', 'me'] as const,

  // Children
  children: {
    all: (centreId?: string) => ['children', { centreId }] as const,
    detail: (id: string) => ['children', id] as const,
    passport: (id: string) => ['children', id, 'passport'] as const,
    migrations: (id: string) => ['children', id, 'migrations'] as const,
  },

  // Attendance
  attendance: {
    byChild: (childId: string) => ['attendance', 'child', childId] as const,
    summary: (childId: string) => ['attendance', 'summary', childId] as const,
  },

  // Growth
  growth: {
    byChild: (childId: string) => ['growth', 'child', childId] as const,
    trend: (childId: string) => ['growth', 'trend', childId] as const,
  },

  // Risk
  risk: {
    latest: (childId: string) => ['risk', 'latest', childId] as const,
    history: (childId: string) => ['risk', 'history', childId] as const,
  },

  // Referrals
  referrals: {
    byChild: (childId: string) => ['referrals', 'child', childId] as const,
    detail: (id: string) => ['referrals', id] as const,
    byStatus: (status: string) => ['referrals', 'status', status] as const,
  },

  // Development
  development: {
    byChild: (childId: string) => ['development', 'child', childId] as const,
    summary: (childId: string) => ['development', 'summary', childId] as const,
  },

  // Learning
  learning: {
    byChild: (childId: string) => ['learning', 'child', childId] as const,
  },

  // Notifications
  notifications: {
    mine: () => ['notifications', 'me'] as const,
  },
};
