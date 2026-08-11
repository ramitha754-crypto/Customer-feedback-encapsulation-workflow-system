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

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Top Banner */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fafafa', letterSpacing: '-0.02em' }}>
          Executive SLA & Encapsulation Analytics
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#a1a1aa', marginTop: '4px' }}>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa', fontSize: '0.8rem', marginBottom: '8px' }}>
            <span>SLA On-Time Rate</span>
            <Clock size={16} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fafafa' }}>
            {slaOnTimeRate}%
          </div>
          <div style={{ fontSize: '0.72rem', color: '#71717a', marginTop: '4px' }}>
            {slaBreachedCount} active SLA breach(es)
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa', fontSize: '0.8rem', marginBottom: '8px' }}>
            <span>Mean Time to Encapsulate</span>
            <Cpu size={16} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fafafa' }}>
            3.8 hrs
          </div>
          <div style={{ fontSize: '0.72rem', color: '#71717a', marginTop: '4px' }}>
            {encapsulatedCount} specs generated
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa', fontSize: '0.8rem', marginBottom: '8px' }}>
            <span>Spec Fit Confidence</span>
            <CheckCircle2 size={16} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fafafa' }}>
            {avgConfidenceScore}%
          </div>
          <div style={{ fontSize: '0.72rem', color: '#71717a', marginTop: '4px' }}>
            Average PM Spec validation rating
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa', fontSize: '0.8rem', marginBottom: '8px' }}>
            <span>Active Sprint Shipping Velocity</span>
            <Activity size={16} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fafafa' }}>
            14 Specs/wk
          </div>
          <div style={{ fontSize: '0.72rem', color: '#71717a', marginTop: '4px' }}>
            Across 3 Engineering Pods
          </div>
        </div>
      </div>

      {/* Row 2: Monochromatic Visual Distribution Cards */}
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
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fafafa' }}>
                Feedback Ingestion by Category
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Volume breakdown across architectural areas</p>
            </div>
            <BarChart3 size={18} style={{ color: '#a1a1aa' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { category: 'Security & SSO Compliance', pct: 40, count: '6 Tickets', value: '$1.2M ARR' },
              { category: 'API & Rate Limiting ETL', pct: 25, count: '4 Tickets', value: '$850k ARR' },
              { category: 'BigData Telemetry Export', pct: 20, count: '3 Tickets', value: '$2.4M ARR' },
              { category: 'Governance & Custom RBAC', pct: 10, count: '2 Tickets', value: '$320k ARR' },
              { category: 'Billing & Cost Center', pct: 5, count: '1 Ticket', value: '$95k ARR' },
            ].map((cat, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#fafafa', marginBottom: '4px' }}>
                  <span>{cat.category}</span>
                  <span className="font-mono" style={{ color: '#a1a1aa' }}>{cat.count} ({cat.value})</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#09090b', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                  <div style={{
                    height: '100%',
                    width: `${cat.pct}%`,
                    backgroundColor: idx === 0 ? '#fafafa' : idx === 1 ? '#a1a1aa' : idx === 2 ? '#71717a' : '#3f3f46',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monochromatic Account Tier SLA Performance */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fafafa' }}>
                Account Tier SLA Performance
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Ingestion to triage turnaround by tier</p>
            </div>
            <PieChart size={18} style={{ color: '#a1a1aa' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { tier: 'Enterprise VIP (4h SLA)', account: 'Cyberdyne Defense & Acme Financial', avgTime: '2.1 hrs', status: 'SLA COMPLIANT' },
              { tier: 'Enterprise (12h SLA)', account: 'Globex Health Systems', avgTime: '14.2 hrs', status: '1 BREACH DETECTED' },
              { tier: 'Mid-Market (24h SLA)', account: 'Stark Logistics Corp', avgTime: '6.4 hrs', status: 'SLA COMPLIANT' },
              { tier: 'SMB (48h SLA)', account: 'Initech SaaS Solutions', avgTime: '12.0 hrs', status: 'SLA COMPLIANT' },
            ].map((t, idx) => (
              <div key={idx} style={{
                padding: '12px',
                backgroundColor: '#09090b',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fafafa' }}>
                    {t.tier}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#71717a' }}>
                    {t.account}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fafafa' }}>
                    {t.avgTime} avg
                  </div>
                  <span className="badge" style={{
                    backgroundColor: t.status.includes('BREACH') ? '#27272a' : '#18181b',
                    color: t.status.includes('BREACH') ? '#ffffff' : '#a1a1aa',
                    border: t.status.includes('BREACH') ? '1px solid #ffffff' : '1px solid var(--border-subtle)',
                    fontSize: '0.62rem'
                  }}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: SLA Response Time Matrix Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fafafa' }}>
            Encapsulated Specification Audit Log Summary
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>
            System activity metrics for recent customer feedback transformations
          </p>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-medium)', textAlign: 'left', color: '#a1a1aa' }}>
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
              <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)', color: '#fafafa' }}>
                <td className="font-mono" style={{ padding: '12px', fontWeight: 600 }}>{item.code}</td>
                <td style={{ padding: '12px' }}>{item.account.name}</td>
                <td style={{ padding: '12px' }}>{item.encapsulatedSpec?.title || 'Pending Encapsulation'}</td>
                <td style={{ padding: '12px', color: '#a1a1aa' }}>{item.encapsulatedSpec?.encapsulatedBy || '—'}</td>
                <td className="font-mono" style={{ padding: '12px' }}>
                  {item.encapsulatedSpec ? `${item.encapsulatedSpec.confidenceScore}%` : '—'}
                </td>
                <td style={{ padding: '12px' }}>
                  <span className="badge" style={{ backgroundColor: '#18181b', color: '#a1a1aa', border: '1px solid var(--border-subtle)' }}>
                    {item.stage.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
