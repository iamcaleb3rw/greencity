'use client';

import { useState } from 'react';
import type { Report } from '@/db/schema';
import type { Status } from '@/db/schema';
import { updateReportStatus, deleteReport } from '@/lib/actions/reports';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getSeverityLabel, getSeverityColor, formatRelativeTime } from '@/lib/utils';
import { Trash2, RefreshCw, AlertTriangle } from 'lucide-react';

const STATUSES: Status[] = ['Reported', 'In Progress', 'Cleaned Up', 'Archived'];

function AdminRow({ report }: { report: Report }) {
  const [newStatus, setNewStatus] = useState<Status>(report.status as Status);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [token] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('admin_token') ?? '' : '');

  async function handleUpdate() {
    setLoading(true);
    const result = await updateReportStatus(report.id, newStatus, notes, token);
    if (!result.success) alert(result.error);
    setNotes('');
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    const result = await deleteReport(report.id, token);
    if (!result.success) alert(result.error);
    setDeleting(false);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-sm text-gray-900 leading-snug">{report.title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{report.districtName} · {formatRelativeTime(report.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-medium" style={{ color: getSeverityColor(report.severityLevel) }}>
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            {getSeverityLabel(report.severityLevel)}
          </span>
          <Badge label={report.status} variant="status" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={newStatus}
          onChange={e => setNewStatus(e.target.value as Status)}
          className="h-9 px-3 text-xs font-medium rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
        >
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <input
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Admin notes (optional)"
          className="flex-1 min-w-[140px] h-9 px-3 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 placeholder:text-gray-300 transition"
        />

        <Button size="sm" variant="outline" onClick={handleUpdate} loading={loading}>
          <RefreshCw className="w-3 h-3" /> Update
        </Button>

        <Button
          size="sm"
          variant="danger"
          onClick={handleDelete}
          loading={deleting}
        >
          <Trash2 className="w-3 h-3" />
          {confirmDelete ? 'Confirm?' : 'Delete'}
        </Button>
      </div>
    </div>
  );
}

export function AdminPanel({ reports }: { reports: Report[] }) {
  const [token, setToken] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  function authenticate() {
    localStorage.setItem('admin_token', token);
    setAuthenticated(true);
  }

  if (!authenticated) {
    return (
      <div className="max-w-sm mx-auto py-20 text-center space-y-4">
        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto">
          <span className="text-2xl">🔐</span>
        </div>
        <h2 className="text-lg font-bold text-gray-900">Admin Access</h2>
        <p className="text-sm text-gray-500">Enter your admin secret to continue</p>
        <div className="space-y-2">
          <input
            type="password"
            value={token}
            onChange={e => setToken(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && authenticate()}
            placeholder="Admin secret"
            className="w-full h-10 px-4 text-sm rounded-xl border border-gray-200 text-center focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
          />
          <Button variant="primary" className="w-full" onClick={authenticate}>
            Access Admin Panel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reports.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-10">No reports to manage.</p>
      ) : (
        reports.map(r => <AdminRow key={r.id} report={r} />)
      )}
    </div>
  );
}
