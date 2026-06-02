import React, { useState } from 'react';
import { FiCalendar, FiCheck, FiX, FiMinus, FiSave } from 'react-icons/fi';
import { useChildren } from '../../hooks/useChildren';
import { useRecordAttendance } from '../../hooks/useAttendance';
import { PageSpinner, Spinner } from '../../components/ui/Spinner';
import { useAuthStore } from '../../store/auth';

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'EXCUSED';

interface RowState {
  childId: string;
  name: string;
  status: AttendanceStatus;
}

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; icon: React.ElementType; active: string; inactive: string }> = {
  PRESENT: { label: 'Present', icon: FiCheck,  active: 'bg-green-600 text-white border-green-600',  inactive: 'bg-white text-gray-500 border-gray-200 hover:border-green-400' },
  ABSENT:  { label: 'Absent',  icon: FiX,      active: 'bg-red-600 text-white border-red-600',      inactive: 'bg-white text-gray-500 border-gray-200 hover:border-red-400' },
  EXCUSED: { label: 'Excused', icon: FiMinus,  active: 'bg-yellow-500 text-white border-yellow-500', inactive: 'bg-white text-gray-500 border-gray-200 hover:border-yellow-400' },
};

export const AttendancePage = () => {
  const { user } = useAuthStore();
  const { data: children = [], isLoading } = useChildren();
  const { mutateAsync: record } = useRecordAttendance();

  const today = new Date().toISOString().split('T')[0];
  const [sessionDate, setSessionDate] = useState(today);
  const [rows, setRows] = useState<RowState[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Initialise rows when children load
  React.useEffect(() => {
    if (children.length > 0 && rows.length === 0) {
      setRows(
        children.map((c) => ({
          childId: c.id,
          name: `${c.first_name} ${c.last_name}`,
          status: 'PRESENT',
        })),
      );
    }
  }, [children, rows.length]);

  const setStatus = (childId: string, status: AttendanceStatus) => {
    setRows((prev) => prev.map((r) => (r.childId === childId ? { ...r, status } : r)));
  };

  const markAll = (status: AttendanceStatus) => {
    setRows((prev) => prev.map((r) => ({ ...r, status })));
  };

  const handleSave = async () => {
    if (!user?.centre_id) return;
    setSaving(true);
    try {
      await Promise.all(
        rows.map((r) =>
          record({
            child_id: r.childId,
            centre_id: user.centre_id!,
            session_date: sessionDate,
            status: r.status,
          }),
        ),
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const presentCount = rows.filter((r) => r.status === 'PRESENT').length;
  const absentCount  = rows.filter((r) => r.status === 'ABSENT').length;
  const excusedCount = rows.filter((r) => r.status === 'EXCUSED').length;

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Attendance</h2>
          <p className="text-sm text-gray-500 mt-1">
            Mark attendance for all children in one session.
          </p>
        </div>

        {/* Date picker */}
        <div className="flex items-center gap-2">
          <FiCalendar className="h-4 w-4 text-gray-400" />
          <input
            type="date"
            value={sessionDate}
            max={today}
            onChange={(e) => setSessionDate(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Present', count: presentCount, color: 'text-green-700', bg: 'bg-green-50 border-green-100' },
          { label: 'Absent',  count: absentCount,  color: 'text-red-700',   bg: 'bg-red-50 border-red-100' },
          { label: 'Excused', count: excusedCount, color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-100' },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className={`rounded-2xl border p-4 text-center ${bg}`}>
            <p className={`text-2xl font-bold ${color}`}>{count}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Bulk actions */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 font-medium mr-1">Mark all:</span>
        {(['PRESENT', 'ABSENT', 'EXCUSED'] as AttendanceStatus[]).map((s) => {
          const cfg = STATUS_CONFIG[s];
          const Icon = cfg.icon;
          return (
            <button
              key={s}
              onClick={() => markAll(s)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${cfg.inactive}`}
            >
              <Icon className="h-3.5 w-3.5" />
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Attendance table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {rows.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-500">
            No children registered in your centre.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {rows.map((row) => (
              <li key={row.childId} className="flex items-center justify-between px-6 py-3.5">
                {/* Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <span className="text-indigo-700 font-semibold text-xs">
                      {row.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">{row.name}</p>
                </div>

                {/* Status buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {(['PRESENT', 'ABSENT', 'EXCUSED'] as AttendanceStatus[]).map((s) => {
                    const cfg = STATUS_CONFIG[s];
                    const Icon = cfg.icon;
                    const isActive = row.status === s;
                    return (
                      <button
                        key={s}
                        onClick={() => setStatus(row.childId, s)}
                        aria-label={cfg.label}
                        className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-colors ${
                          isActive ? cfg.active : cfg.inactive
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </button>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Save footer */}
        {rows.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {rows.length} children · {sessionDate}
            </p>
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm ${
                saved
                  ? 'bg-green-600 text-white'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60'
              }`}
            >
              {saving ? (
                <Spinner size="sm" className="text-white" />
              ) : saved ? (
                <FiCheck className="h-4 w-4" />
              ) : (
                <FiSave className="h-4 w-4" />
              )}
              {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Attendance'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
