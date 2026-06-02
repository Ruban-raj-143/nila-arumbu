/**
 * Nila Arumbu — Offline-First IndexedDB (Dexie)
 * Stores all domain entities locally for offline operation.
 * Sync queue tracks pending operations for background sync.
 */
import Dexie, { type Table } from 'dexie';
import type {
  AttendanceRead,
  ChildRead,
  GrowthRecordRead,
  ReferralRead,
  RiskScoreRead,
} from '../lib/types';

// ── Sync queue entry ──────────────────────────────────────────────────────────

export type SyncAction = 'CREATE' | 'UPDATE' | 'DELETE';
export type SyncEntity =
  | 'CHILD'
  | 'ATTENDANCE'
  | 'GROWTH'
  | 'REFERRAL'
  | 'RISK'
  | 'ASSESSMENT'
  | 'ENGAGEMENT';

export interface SyncOperation {
  id?: number;
  action: SyncAction;
  entity: SyncEntity;
  endpoint: string;          // e.g. "/children"
  method: 'POST' | 'PATCH' | 'DELETE';
  payload: unknown;
  retryCount: number;
  lastAttemptAt?: number;
  createdAt: number;
}

// ── Database ──────────────────────────────────────────────────────────────────

export class NilaArumbuDB extends Dexie {
  children!: Table<ChildRead & { _syncStatus: 'synced' | 'pending' | 'failed' }, string>;
  attendance!: Table<AttendanceRead & { _syncStatus: 'synced' | 'pending' | 'failed' }, string>;
  growthRecords!: Table<GrowthRecordRead & { _syncStatus: 'synced' | 'pending' | 'failed' }, string>;
  referrals!: Table<ReferralRead & { _syncStatus: 'synced' | 'pending' | 'failed' }, string>;
  riskScores!: Table<RiskScoreRead & { _syncStatus: 'synced' | 'pending' | 'failed' }, string>;
  syncQueue!: Table<SyncOperation, number>;

  constructor() {
    super('NilaArumbuDB');
    this.version(1).stores({
      children: 'id, centre_id, _syncStatus',
      attendance: 'id, child_id, session_date, _syncStatus',
      growthRecords: 'id, child_id, recorded_date, _syncStatus',
      referrals: 'id, child_id, status, _syncStatus',
      riskScores: 'id, child_id, risk_level, _syncStatus',
      syncQueue: '++id, entity, action, createdAt',
    });
  }
}

export const db = new NilaArumbuDB();

// ── Sync queue helpers ────────────────────────────────────────────────────────

export async function enqueue(op: Omit<SyncOperation, 'id' | 'retryCount' | 'createdAt'>): Promise<void> {
  await db.syncQueue.add({ ...op, retryCount: 0, createdAt: Date.now() });
}

export async function getPendingOps(): Promise<SyncOperation[]> {
  return db.syncQueue.orderBy('createdAt').toArray();
}

export async function removeOp(id: number): Promise<void> {
  await db.syncQueue.delete(id);
}

export async function incrementRetry(id: number): Promise<void> {
  await db.syncQueue
    .where('id')
    .equals(id)
    .modify((op) => {
      op.retryCount += 1;
      op.lastAttemptAt = Date.now();
    });
}
