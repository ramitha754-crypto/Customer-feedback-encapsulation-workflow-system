import React from 'react';
import { 
  BarChart3, 
  Clock, 
  Cpu, 
  CheckCircle2, 
  PieChart, 
  Activity
} from 'lucide-react';
import type { FeedbackItem } from '../../types/feedback';

interface AnalyticsDashboardProps {
  items: FeedbackItem[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ items }) => {
  const total = items.length;
  const encapsulatedCount = items.filter(i => i.encapsulatedSpec).length;
  const slaBreachedCount = items.filter(i => i.isSlaBreached).length;
  const slaOnTimeRate = total > 0 ? Math.round(((total - slaBreachedCount) / total) * 100) : 100;
  const avgConfidenceScore = encapsulatedCount > 0 
    ? Math.round(items.reduce((acc, i) => acc + (i.encapsulatedSpec?.confidenceScore || 0), 0) / encapsulatedCount)
    : 95;

  // Dynamic Category Stats
  const getCategoryName = (cat: string) => {
    switch (cat) {
      case 'SECURITY_COMPLIANCE': return 'Security & SSO Compliance';
      case 'PERFORMANCE_SLA': return 'Performance / SLA';
      case 'INTEGRATION_API': return 'API & ETL Integration';
      case 'USER_EXPERIENCE': return 'User Experience';
      case 'ANALYTICS_REPORTING': return 'Analytics & Reporting';
      case 'BILLING_GOVERNANCE': return 'Billing Governance';
      default: return cat;
    }
  };

  const categoryStats = items.reduce((acc, item) => {
    const cat = getCategoryName(item.category);
    if (!acc[cat]) acc[cat] = { count: 0, revenue: 0 };
    acc[cat].count += 1;
    
    const revMatch = item.account.annualRevenue?.match(/\$([\d,]+)/);
    if (revMatch) {
      acc[cat].revenue += parseInt(revMatch[1].replace(/,/g, ''), 10);
    }
    return acc;
  }, {} as Record<string, { count: number, revenue: number }>);

  const formatRevenue = (rev: number) => {
    if (rev === 0) return '$0 ARR';
    if (rev >= 1000000) return `$${(rev / 1000000).toFixed(1)}M ARR`;
    if (rev >= 1000) return `$${Math.round(rev / 1000)}k ARR`;
    return `$${rev} ARR`;
  };

  const sortedCategories = Object.entries(categoryStats)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([cat, stats]) => ({
      category: cat,
      count: `${stats.count} Ticket${stats.count > 1 ? 's' : ''}`,
      value: formatRevenue(stats.revenue),
      pct: Math.round((stats.count / (total || 1)) * 100)
    }));

  // Dynamic Tier Stats
  const tierStats = items.reduce((acc, item) => {
    const tier = item.account.tier;
    if (!acc[tier]) acc[tier] = { count: 0, breaches: 0, accounts: new Set<string>() };
    acc[tier].count += 1;
    if (item.isSlaBreached) acc[tier].breaches += 1;
    acc[tier].accounts.add(item.account.name);
    return acc;
  }, {} as Record<string, { count: number, breaches: number, accounts: Set<string> }>);

  const getTierName = (tier: string) => {
    switch(tier) {
      case 'ENTERPRISE_VIP': return 'Enterprise VIP';
      case 'ENTERPRISE': return 'Enterprise';
      case 'MID_MARKET': return 'Mid-Market';
      case 'SMB': return 'SMB';
      default: return tier;
    }
  };

  const getTierSla = (tier: string) => {
    switch(tier) {
      case 'ENTERPRISE_VIP': return '4h SLA';
      case 'ENTERPRISE': return '12h SLA';
      case 'MID_MARKET': return '24h SLA';
      case 'SMB': return '48h SLA';
      default: return '';
    }
  };

  const sortedTiers = Object.entries(tierStats).map(([tier, stats]) => {
    const accountsArray = Array.from(stats.accounts);
    const accountsStr = accountsArray.join(' & ');
    return {
      tier: `${getTierName(tier)} (${getTierSla(tier)})`,
      account: accountsStr.length > 35 ? accountsStr.substring(0, 35) + '...' : (accountsStr || 'No Accounts'),
      avgTime: 'Live Tracker',
      status: stats.breaches > 0 ? `${stats.breaches} BREACH DETECTED` : 'SLA COMPLIANT'
    };
  });

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Top Banner */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Executive SLA & Encapsulation Analytics
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Real-time metrics on customer feedback ingestion throughput ({total} total tickets), encapsulation latency, and revenue risk.
        </p>
      </div>

      {/* Row 1: Top KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '8px' }}>
            <span>SLA On-Time Rate</span>
            <Clock size={16} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {slaOnTimeRate}%
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {slaBreachedCount} active SLA breach(es)
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '8px' }}>
            <span>Mean Time to Encapsulate</span>
            <Cpu size={16} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Live
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {encapsulatedCount} specs generated
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '8px' }}>
            <span>Spec Fit Confidence</span>
            <CheckCircle2 size={16} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {avgConfidenceScore}%
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Average PM Spec validation rating
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '8px' }}>
            <span>Active Sprint Velocity</span>
            <Activity size={16} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Live
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Across Engineering Pods
          </div>
        </div>
      </div>

      {/* Row 2: Visual Distribution Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '28px'
      }}>
        {/* Monochromatic Bar Chart - Category Breakdown */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Feedback Ingestion by Category
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Volume breakdown across architectural areas</p>
            </div>
            <BarChart3 size={18} style={{ color: 'var(--text-secondary)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {sortedCategories.length > 0 ? sortedCategories.map((cat, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  <span>{cat.category}</span>
                  <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{cat.count} ({cat.value})</span>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--text-inverse)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                  <div style={{
                    height: '100%',
                    width: `${cat.pct}%`,
                    backgroundColor: idx === 0 ? 'var(--text-primary)' : idx === 1 ? 'var(--text-secondary)' : idx === 2 ? 'var(--text-muted)' : 'var(--text-dim)',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            )) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No data available.</div>
            )}
          </div>
        </div>

        {/* Monochromatic Account Tier SLA Performance */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Account Tier SLA Performance
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ingestion to triage turnaround by tier</p>
            </div>
            <PieChart size={18} style={{ color: 'var(--text-secondary)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {sortedTiers.length > 0 ? sortedTiers.map((t, idx) => (
              <div key={idx} style={{
                padding: '12px',
                backgroundColor: 'var(--text-inverse)',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {t.tier}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {t.account}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {t.avgTime}
                  </div>
                  <span className="badge" style={{
                    backgroundColor: t.status.includes('BREACH') ? 'var(--bg-card-active)' : 'var(--bg-card-hover)',
                    color: t.status.includes('BREACH') ? 'var(--text-primary)' : 'var(--text-secondary)',
                    border: t.status.includes('BREACH') ? '1px solid var(--text-primary)' : '1px solid var(--border-subtle)',
                    fontSize: '0.62rem'
                  }}>
                    {t.status}
                  </span>
                </div>
              </div>
            )) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No SLA data available.</div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: SLA Response Time Matrix Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Encapsulated Specification Audit Log Summary
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            System activity metrics for recent customer feedback transformations
          </p>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-medium)', textAlign: 'left', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '10px 12px' }}>Ticket Code</th>
              <th style={{ padding: '10px 12px' }}>Account</th>
              <th style={{ padding: '10px 12px' }}>Spec Title</th>
              <th style={{ padding: '10px 12px' }}>Encapsulated By</th>
              <th style={{ padding: '10px 12px' }}>Confidence Score</th>
              <th style={{ padding: '10px 12px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                <td className="font-mono" style={{ padding: '12px', fontWeight: 600 }}>{item.code}</td>
                <td style={{ padding: '12px' }}>{item.account.name}</td>
                <td style={{ padding: '12px' }}>{item.encapsulatedSpec?.title || 'Pending Encapsulation'}</td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{item.encapsulatedSpec?.encapsulatedBy || '—'}</td>
                <td className="font-mono" style={{ padding: '12px' }}>
                  {item.encapsulatedSpec ? `${item.encapsulatedSpec.confidenceScore}%` : '—'}
                </td>
                <td style={{ padding: '12px' }}>
                  <span className="badge" style={{ backgroundColor: 'var(--bg-card-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                    {item.stage.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>No tickets found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
