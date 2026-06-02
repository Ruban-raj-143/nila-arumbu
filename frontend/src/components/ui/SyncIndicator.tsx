import React from 'react';
import { useSync } from '../../hooks/useSync';
import { FiWifi, FiWifiOff, FiRefreshCw } from 'react-icons/fi';

export function SyncIndicator() {
  const { isSyncing, pendingCount, syncNow } = useSync();
  const online = navigator.onLine;

  if (!online) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
        <FiWifiOff className="h-3.5 w-3.5" />
        Offline
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium">
        <FiRefreshCw className="h-3.5 w-3.5 animate-spin" />
        Syncing…
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <button
        onClick={syncNow}
        className="flex items-center gap-1.5 text-xs text-amber-600 font-medium hover:text-amber-700"
      >
        <FiRefreshCw className="h-3.5 w-3.5" />
        {pendingCount} pending
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
      <FiWifi className="h-3.5 w-3.5" />
      Synced
    </div>
  );
}
