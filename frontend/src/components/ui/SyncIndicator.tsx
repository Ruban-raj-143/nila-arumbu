import React from 'react';
import { useSync } from '../../hooks/useSync';
import { FiWifi, FiWifiOff, FiRefreshCw } from 'react-icons/fi';

export function SyncIndicator() {
  const { isSyncing, pendingCount, syncNow } = useSync();
  const online = navigator.onLine;

  if (!online) return (
    <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
      style={{ background: '#fff7ed', color: '#ea580c' }}>
      <FiWifiOff className="h-3.5 w-3.5" /> Offline
    </div>
  );

  if (isSyncing) return (
    <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
      style={{ background: '#eff6ff', color: '#3b82f6' }}>
      <FiRefreshCw className="h-3.5 w-3.5 animate-spin" /> Syncing…
    </div>
  );

  if (pendingCount > 0) return (
    <button onClick={syncNow}
      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-opacity hover:opacity-80"
      style={{ background: '#fffbeb', color: '#d97706' }}>
      <FiRefreshCw className="h-3.5 w-3.5" /> {pendingCount} pending
    </button>
  );

  return (
    <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
      style={{ background: '#f0fdf4', color: '#16a34a' }}>
      <FiWifi className="h-3.5 w-3.5" /> Synced
    </div>
  );
}
