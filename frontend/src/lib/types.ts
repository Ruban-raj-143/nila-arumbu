/**
 * Nila Arumbu — Shared TypeScript Types
 * Mirror of backend Pydantic schemas.
 */

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserRead {
  id: string;
  email: string;
  phone: string | null;
  full_name: string;
  is_active: boolean;
  role_id: string | null;
  centre_id: string | null;
  created_at: string;
  updated_at: string;
  role?: { id: string; name: string; description: string | null };
}

// ── Child ─────────────────────────────────────────────────────────────────────

export interface ChildRead {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  aadhaar_number: string | null;
  mother_name: string | null;
  father_name: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  centre_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChildCreate {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  aadhaar_number?: string;
  mother_name?: string;
  father_name?: string;
  guardian_name?: string;
  guardian_phone?: string;
  address?: string;
  centre_id?: string;
}

export interface ChildPassportRead {
  id: string;
  child_id: string;
  passport_number: string;
  current_risk_level: 'GREEN' | 'YELLOW' | 'RED';
  current_risk_score: string;
  total_attendance_sessions: number;
  attended_sessions: number;
  last_growth_recorded_at: string | null;
  last_assessment_at: string | null;
  active_referral_count: number;
  notes: string | null;
  updated_at: string;
}

// ── Attendance ────────────────────────────────────────────────────────────────

export interface AttendanceCreate {
  child_id: string;
  centre_id: string;
  session_date: string;
  status: 'PRESENT' | 'ABSENT' | 'EXCUSED';
  notes?: string;
}

export interface AttendanceRead {
  id: string;
  child_id: string;
  centre_id: string;
  session_date: string;
  status: 'PRESENT' | 'ABSENT' | 'EXCUSED';
  notes: string | null;
  created_at: string;
}

export interface AttendanceSummary {
  child_id: string;
  total_sessions: number;
  attended: number;
  absent: number;
  excused: number;
  attendance_rate: number;
}

// ── Growth ────────────────────────────────────────────────────────────────────

export interface GrowthRecordRead {
  id: string;
  child_id: string;
  recorded_date: string;
  weight_kg: number | null;
  height_cm: number | null;
  muac_cm: number | null;
  weight_for_age_z: number | null;
  height_for_age_z: number | null;
  nutrition_status: string | null;
  notes: string | null;
  created_at: string;
}

// ── Risk ──────────────────────────────────────────────────────────────────────

export type RiskLevel = 'GREEN' | 'YELLOW' | 'RED';

export interface RiskScoreRead {
  id: string;
  child_id: string;
  total_score: number;
  risk_level: RiskLevel;
  attendance_score: number;
  nutrition_score: number;
  development_score: number;
  caregiver_score: number;
  migration_score: number;
  contributing_factors: string[];
  weight_breakdown: Record<string, number>;
  explanation: string;
  created_at: string;
}

// ── Referral ──────────────────────────────────────────────────────────────────

export type ReferralStatus =
  | 'IDENTIFIED'
  | 'REFERRED'
  | 'APPOINTMENT_PENDING'
  | 'VISITED'
  | 'FOLLOWUP'
  | 'CLOSED';

export interface ReferralRead {
  id: string;
  child_id: string;
  reason: string;
  referral_type: string;
  status: ReferralStatus;
  referred_to: string | null;
  notes: string | null;
  escalated: boolean;
  escalation_reason: string | null;
  created_at: string;
  updated_at: string;
  status_logs: ReferralStatusLogRead[];
  allowed_transitions: string[];
}

export interface ReferralStatusLogRead {
  id: string;
  from_status: string | null;
  to_status: string;
  notes: string | null;
  created_at: string;
}

// ── Development ───────────────────────────────────────────────────────────────

export interface AssessmentRead {
  id: string;
  child_id: string;
  assessed_date: string;
  age_in_months: number;
  gross_motor_score: number;
  fine_motor_score: number;
  language_score: number;
  cognitive_score: number;
  social_emotional_score: number;
  overall_milestone_score: number;
  developmental_status: string;
  milestones: unknown[];
  notes: string | null;
  created_at: string;
}

// ── Learning ──────────────────────────────────────────────────────────────────

export interface LearningActivityRead {
  id: string;
  child_id: string;
  plan_date: string;
  age_in_months: string;
  risk_level: RiskLevel;
  developmental_status: string;
  centre_activities: string[];
  home_activities: string[];
  school_readiness_tasks: string[];
  notes: string | null;
  created_at: string;
}

// ── Centre ────────────────────────────────────────────────────────────────────

export interface CentreRead {
  id: string;
  name: string;
  code: string;
  district: string;
  block: string;
  village: string;
  pincode: string | null;
  is_active: string;
  created_at: string;
}
