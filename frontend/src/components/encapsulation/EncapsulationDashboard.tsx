import React, { useState } from 'react';
import { Cpu, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Search, FileText } from 'lucide-react';
import type { FeedbackItem } from '../../types/feedback';

interface EncapsulationDashboardProps {
  items: FeedbackItem[];
  onStartEncapsulation: (item: FeedbackItem) => void;
  onOpenDetails: (item: FeedbackItem) => void;
}

export const EncapsulationDashboard: React.FC<EncapsulationDashboardProps> = ({
  items,
  onStartEncapsulation,
  onOpenDetails,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const pendingItems = items.filter(i => !i.encapsulatedSpec);
  const encapsulatedItems = items.filter(i => !!i.encapsulatedSpec);

  const filteredPending = pendingItems.filter(i =>
    i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEncapsulated = encapsulatedItems.filter(i =>
    i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (i.encapsulatedSpec?.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P0_CRITICAL': return '#ef4444';
      case 'P1_HIGH': return '#f97316';
      case 'P2_MEDIUM': return '#eab308';
      case 'P3_LOW': return '#22c55e';
      default: return '#a1a1aa';
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <div style={{
            padding: '8px',
            backgroundColor: 'var(--text-primary)',
            color: 'var(--text-inverse)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Cpu size={20} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Encapsulation Engine
          </h1>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Transform raw customer feedback into structured engineering specifications & epic requirements.
        </p>
      </div>

      {/* KPI Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Awaiting Encapsulation</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: pendingItems.length > 0 ? '#f97316' : '#22c55e' }}>
            {pendingItems.length}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>raw tickets pending spec</div>
        </div>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Encapsulated</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {encapsulatedItems.length}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>specs generated</div>
        </div>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Conversion Rate</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {items.length > 0 ? Math.round((encapsulatedItems.length / items.length) * 100) : 0}%
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>feedback → spec pipeline</div>
        </div>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Avg Confidence</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {encapsulatedItems.length > 0
              ? Math.round(encapsulatedItems.reduce((acc, i) => acc + (i.encapsulatedSpec?.confidenceScore || 0), 0) / encapsulatedItems.length)
              : '—'}%
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>spec fit score</div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          className="input"
          placeholder="Search by ticket code, title, or account..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingLeft: '38px', width: '100%', maxWidth: '480px' }}
        />
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>

        {/* LEFT: Pending Encapsulation */}
        <div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)'
          }}>
            <AlertTriangle size={16} style={{ color: '#f97316' }} />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Awaiting Encapsulation
            </h2>
            <span className="badge" style={{ backgroundColor: 'var(--bg-card-active)', color: '#f97316', border: '1px solid #f97316', fontSize: '0.65rem' }}>
              {filteredPending.length}
            </span>
          </div>

          {filteredPending.length === 0 ? (
            <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
              <CheckCircle2 size={32} style={{ color: '#22c55e', margin: '0 auto 12px' }} />
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>All Clear!</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>No pending feedback to encapsulate.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredPending.map(item => (
                <div key={item.id} className="glass-panel" style={{
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s ease',
                  borderLeft: `3px solid ${getPriorityColor(item.priority)}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.code}</span>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px', lineHeight: 1.3 }}>
                        {item.title}
                      </div>
                    </div>
                    {item.isSlaBreached && (
                      <span className="badge" style={{ backgroundColor: 'var(--bg-card-active)', color: '#ef4444', border: '1px solid #ef4444', fontSize: '0.6rem', whiteSpace: 'nowrap' }}>
                        <AlertTriangle size={10} /> SLA
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                    {item.account.name} • {item.category.replace(/_/g, ' ')}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onStartEncapsulation(item)}
                      style={{ fontSize: '0.72rem' }}
                    >
                      <Sparkles size={12} />
                      <span>Encapsulate</span>
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => onOpenDetails(item)}
                      style={{ fontSize: '0.72rem' }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Already Encapsulated */}
        <div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)'
          }}>
            <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Encapsulated Specs
            </h2>
            <span className="badge" style={{ backgroundColor: 'var(--bg-card-active)', color: '#22c55e', border: '1px solid #22c55e', fontSize: '0.65rem' }}>
              {filteredEncapsulated.length}
            </span>
          </div>

          {filteredEncapsulated.length === 0 ? (
            <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
              <FileText size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>No Specs Yet</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Encapsulate tickets from the left panel to build specs.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredEncapsulated.map(item => (
                <div key={item.id} className="glass-panel" style={{
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s ease',
                  borderLeft: '3px solid #22c55e'
                }}
                onClick={() => onOpenDetails(item)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div>
                      <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.code}</span>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {item.encapsulatedSpec?.title}
                      </div>
                    </div>
                    <span className="badge font-mono" style={{
                      backgroundColor: 'var(--bg-card-hover)',
                      color: (item.encapsulatedSpec?.confidenceScore || 0) >= 90 ? '#22c55e' : '#eab308',
                      border: `1px solid ${(item.encapsulatedSpec?.confidenceScore || 0) >= 90 ? '#22c55e' : '#eab308'}`,
                      fontSize: '0.65rem'
                    }}>
                      {item.encapsulatedSpec?.confidenceScore}% fit
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {item.account.name} • {item.encapsulatedSpec?.suggestedPriority?.replace(/_/g, ' ')}
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {item.encapsulatedSpec?.coreProblem?.substring(0, 120)}
                    {(item.encapsulatedSpec?.coreProblem?.length || 0) > 120 ? '...' : ''}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      By {item.encapsulatedSpec?.encapsulatedBy} • Epic: <span className="font-mono">{item.encapsulatedSpec?.targetEpicLink}</span>
                    </span>
                    <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
