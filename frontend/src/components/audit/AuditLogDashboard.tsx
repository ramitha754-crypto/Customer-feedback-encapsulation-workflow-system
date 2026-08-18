import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw,
  Search,
  Filter,
  Shield,
  LogIn,
  LogOut,
  UserCog,
  MessageSquare,
  GitPullRequest,
  Cpu,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  Activity,
} from 'lucide-react';
import type { SystemAuditLog } from '../../types/feedback';

const PAGE_SIZE = 25;

// ── Action metadata ──────────────────────────────────────────────────────────

interface ActionMeta {
  label: string;
  icon: React.ReactNode;
  category: 'auth' | 'feedback' | 'user' | 'system';
  badgeClass: string; // references .badge-* or an inline style tag
}

const ACTION_META: Record<string, ActionMeta> = {
  LOGIN: {
    label: 'Login',
    icon: <LogIn size={13} />,
    category: 'auth',
    badgeClass: 'audit-badge-auth',
  },
  LOGOUT: {
    label: 'Logout',
    icon: <LogOut size={13} />,
    category: 'auth',
    badgeClass: 'audit-badge-auth',
  },
  CREATE_FEEDBACK: {
    label: 'Create Feedback',
    icon: <Plus size={13} />,
    category: 'feedback',
    badgeClass: 'audit-badge-feedback',
  },
  UPDATE_FEEDBACK: {
    label: 'Update Feedback',
    icon: <GitPullRequest size={13} />,
    category: 'feedback',
    badgeClass: 'audit-badge-feedback',
  },
  STAGE_CHANGED: {
    label: 'Stage Change',
    icon: <GitPullRequest size={13} />,
    category: 'feedback',
    badgeClass: 'audit-badge-feedback',
  },
  ENCAPSULATED: {
    label: 'Encapsulation',
    icon: <Cpu size={13} />,
    category: 'feedback',
    badgeClass: 'audit-badge-encapsulation',
  },
  DELETE_FEEDBACK: {
    label: 'Delete Feedback',
    icon: <Trash2 size={13} />,
    category: 'feedback',
    badgeClass: 'audit-badge-danger',
  },
  UPDATE_USER: {
    label: 'User Updated',
    icon: <UserCog size={13} />,
    category: 'user',
    badgeClass: 'audit-badge-user',
  },
  CREATE_USER: {
    label: 'User Created',
    icon: <UserCog size={13} />,
    category: 'user',
    badgeClass: 'audit-badge-user',
  },
  DELETE_USER: {
    label: 'User Deleted',
    icon: <Trash2 size={13} />,
    category: 'user',
    badgeClass: 'audit-badge-danger',
  },
  COMMENT_ADDED: {
    label: 'Comment',
    icon: <MessageSquare size={13} />,
    category: 'feedback',
    badgeClass: 'audit-badge-comment',
  },
};

function getActionMeta(action: string): ActionMeta {
  return (
    ACTION_META[action] ?? {
      label: action,
      icon: <Activity size={13} />,
      category: 'system',
      badgeClass: 'audit-badge-system',
    }
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(raw: string): { date: string; time: string } {
  try {
    const d = new Date(raw);
    const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return { date, time };
  } catch {
    return { date: raw, time: '' };
  }
}

function roleLabel(role: string | null): string {
  if (!role) return '—';
  return role.replace(/_/g, ' ');
}

// ── Category filter options ──────────────────────────────────────────────────

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Events' },
  { value: 'auth', label: 'Auth (Login / Logout)' },
  { value: 'feedback', label: 'Feedback Events' },
  { value: 'user', label: 'User Management' },
  { value: 'system', label: 'Other / System' },
];

const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  ...Object.entries(ACTION_META).map(([k, v]) => ({ value: k, label: v.label })),
];

// ── Summary stat card ────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
}

function StatCard({ icon, label, value, sub }: StatCardProps) {
  return (
    <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 180px', minWidth: 0 }}>
      <div style={{
        width: '38px',
        height: '38px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-card-active)',
        border: '1px solid var(--border-medium)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary)',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', whiteSpace: 'nowrap' }}>
          {label}
        </div>
        {sub && <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '1px' }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Audit row ────────────────────────────────────────────────────────────────

function AuditRow({ log, isEven }: { log: SystemAuditLog; isEven: boolean }) {
  const meta = getActionMeta(log.action);
  const { date, time } = formatDateTime(log.timestamp);

  return (
    <tr style={{
      backgroundColor: isEven ? 'transparent' : 'var(--bg-card-hover)',
      borderBottom: '1px solid var(--border-subtle)',
      transition: 'background-color 0.12s ease',
    }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-card-active)')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = isEven ? 'transparent' : 'var(--bg-card-hover)')}
    >
      {/* Timestamp */}
      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
          {time}
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '1px' }}>
          {date}
        </div>
      </td>

      {/* Action badge */}
      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
        <span className={`audit-action-badge ${meta.badgeClass}`}>
          {meta.icon}
          {meta.label}
        </span>
      </td>

      {/* Actor */}
      <td style={{ padding: '10px 14px', verticalAlign: 'middle' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {log.actorName ?? <span style={{ color: 'var(--text-dim)' }}>System</span>}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '1px' }}>
          {roleLabel(log.actorRole)}
        </div>
      </td>

      {/* Details */}
      <td style={{ padding: '10px 14px', verticalAlign: 'middle' }}>
        <div style={{
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          maxWidth: '540px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
          title={log.details ?? undefined}
        >
          {log.details ?? '—'}
        </div>
      </td>

      {/* Log ID */}
      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          {log.id.slice(0, 20)}…
        </span>
      </td>
    </tr>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────

export const AuditLogDashboard: React.FC = () => {
  const [logs, setLogs] = useState<SystemAuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(0);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [categoryFilter, actionFilter]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(page * PAGE_SIZE),
      });
      if (debouncedSearch) params.set('search', debouncedSearch);

      const res = await fetch(`/api/audit-logs?${params.toString()}`, { credentials: 'include' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const data: { logs: SystemAuditLog[]; total: number } = await res.json();

      // Client-side category + action filter (backend search covers text; category is derived from action)
      let filtered = data.logs;
      if (categoryFilter) {
        filtered = filtered.filter(l => getActionMeta(l.action).category === categoryFilter);
      }
      if (actionFilter) {
        filtered = filtered.filter(l => l.action === actionFilter);
      }

      setLogs(filtered);
      setTotal(data.total);
      setLastRefreshed(new Date());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, categoryFilter, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // ── Derived stats from current page ────────────────────────────────────────
  const authCount = logs.filter(l => getActionMeta(l.action).category === 'auth').length;
  const feedbackCount = logs.filter(l => getActionMeta(l.action).category === 'feedback').length;
  const userCount = logs.filter(l => getActionMeta(l.action).category === 'user').length;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1400px', margin: '0 auto' }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={22} />
            System Audit Log
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            Immutable record of every action — logins, logouts, feedback changes, user management.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {lastRefreshed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              <Clock size={11} />
              {lastRefreshed.toLocaleTimeString()}
            </div>
          )}
          <button
            className="btn btn-outline"
            onClick={fetchLogs}
            disabled={loading}
            style={{ height: '36px', padding: '0 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            <span style={{ fontSize: '0.8rem' }}>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <StatCard icon={<Activity size={18} />} label="Total Events" value={total.toLocaleString()} />
        <StatCard icon={<LogIn size={18} />} label="Auth Events" value={authCount} sub="this page" />
        <StatCard icon={<GitPullRequest size={18} />} label="Feedback Events" value={feedbackCount} sub="this page" />
        <StatCard icon={<UserCog size={18} />} label="User Events" value={userCount} sub="this page" />
      </div>

      {/* ── Filters bar ── */}
      <div className="glass-panel" style={{ padding: '14px 18px', marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            id="audit-search"
            type="text"
            className="input"
            placeholder="Search actor, action, details…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '32px', height: '36px' }}
          />
        </div>

        {/* Category filter */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <Filter size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <select
            id="audit-category-filter"
            className="select"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            style={{ height: '36px', width: '180px' }}
          >
            {CATEGORY_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Action filter */}
        <div style={{ flexShrink: 0 }}>
          <select
            id="audit-action-filter"
            className="select"
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            style={{ height: '36px', width: '180px' }}
          >
            {ACTION_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Clear filters */}
        {(search || categoryFilter || actionFilter) && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { setSearch(''); setCategoryFilter(''); setActionFilter(''); }}
            style={{ height: '36px', padding: '0 12px', fontSize: '0.78rem' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="glass-panel" style={{ padding: '14px 18px', marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center', border: '1px solid var(--border-bright)' }}>
          <AlertTriangle size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Failed to load audit logs: <strong>{error}</strong>
          </span>
          <button className="btn btn-outline btn-sm" onClick={fetchLogs} style={{ marginLeft: 'auto' }}>Retry</button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="glass-panel" style={{ overflow: 'hidden', marginBottom: '16px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '150px' }} />
              <col style={{ width: '160px' }} />
              <col style={{ width: '190px' }} />
              <col style={{ width: 'auto' }} />
              <col style={{ width: '160px' }} />
            </colgroup>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-card)' }}>
                {['Timestamp', 'Action', 'Actor', 'Details', 'Event ID'].map(h => (
                  <th
                    key={h}
                    style={{
                      padding: '10px 14px',
                      textAlign: 'left',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      Loading audit events…
                    </div>
                  </td>
                </tr>
              )}
              {!loading && logs.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <Shield size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                    No audit events match your filters.
                  </td>
                </tr>
              )}
              {!loading && logs.map((log, i) => (
                <AuditRow key={log.id} log={log} isEven={i % 2 === 0} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pagination ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Showing {Math.min(page * PAGE_SIZE + 1, total)}–{Math.min((page + 1) * PAGE_SIZE, total)} of <strong style={{ color: 'var(--text-primary)' }}>{total.toLocaleString()}</strong> events
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn btn-outline btn-sm"
            disabled={page === 0 || loading}
            onClick={() => setPage(p => Math.max(0, p - 1))}
            style={{ height: '32px', padding: '0 10px' }}
          >
            <ChevronLeft size={14} />
          </button>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', minWidth: '80px', textAlign: 'center' }}>
            Page {page + 1} / {totalPages || 1}
          </span>
          <button
            className="btn btn-outline btn-sm"
            disabled={page >= totalPages - 1 || loading}
            onClick={() => setPage(p => p + 1)}
            style={{ height: '32px', padding: '0 10px' }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

    </div>
  );
};
