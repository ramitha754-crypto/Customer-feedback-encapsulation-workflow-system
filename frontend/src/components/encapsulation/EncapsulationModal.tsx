import React, { useState } from 'react';
import { X, Cpu, CheckCircle2, Sparkles } from 'lucide-react';
import type { FeedbackItem, EncapsulatedSpec, PriorityLevel } from '../../types/feedback';

interface EncapsulationModalProps {
  item: FeedbackItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveSpec: (feedbackId: string, spec: EncapsulatedSpec) => void;
  currentUser: string;
}

export const EncapsulationModal: React.FC<EncapsulationModalProps> = ({
  item,
  isOpen,
  onClose,
  onSaveSpec,
  currentUser,
}) => {
  if (!isOpen || !item) return null;

  // Initialize or pre-populate encapsulation form state
  const existingSpec = item.encapsulatedSpec;

  const [title, setTitle] = useState(
    existingSpec?.title || `Architectural Spec: ${item.title}`
  );
  const [coreProblem, setCoreProblem] = useState(
    existingSpec?.coreProblem || `Customer reported bottleneck regarding: ${item.rawContent.substring(0, 140)}...`
  );
  const [businessImpact, setBusinessImpact] = useState(
    existingSpec?.businessImpact || `Impacts ${item.account.name} (${item.account.annualRevenue}). Escalation risk under ${item.priority}.`
  );
  const [technicalScopeText, setTechnicalScopeText] = useState(
    existingSpec?.technicalScope?.join('\n') || 
    `• Implement scalable handler middleware for endpoint.\n• Add Redis token bucket cache rate limit rules.\n• Update client API response headers.`
  );
  const [acceptanceCriteriaText, setAcceptanceCriteriaText] = useState(
    existingSpec?.acceptanceCriteria?.join('\n') || 
    `• Requests within threshold complete < 50ms.\n• Over-limit calls return 429 Retry-After header.\n• SOC2 compliant audit log emission.`
  );
  const [targetEpicLink, setTargetEpicLink] = useState(
    existingSpec?.targetEpicLink || `EPIC-CORE-${Math.floor(100 + Math.random() * 900)}`
  );
  const [suggestedPriority, setSuggestedPriority] = useState<PriorityLevel>(
    existingSpec?.suggestedPriority || item.priority
  );
  const [confidenceScore, setConfidenceScore] = useState<number>(
    existingSpec?.confidenceScore || 94
  );

  const [isGenerating, setIsGenerating] = useState(false);

  const handleAutoExtract = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setTitle(`Structured Spec: ${item.title}`);
      setCoreProblem(`Core Technical Friction: Unoptimized resource allocation under peak concurrency for ${item.account.name}.`);
      setBusinessImpact(`High ARR Risk ($${item.account.annualRevenue}). Immediate engineering scope required to satisfy SLA contract.`);
      setTechnicalScopeText(
        `• Refactor controller pipeline to support stream processing.\n• Add automated unit & load tests for 10x throughput peak.\n• Expose tenant configuration parameters via Admin Console.`
      );
      setAcceptanceCriteriaText(
        `• Zero data loss during token refresh handshakes.\n• Response latency remains < 120ms at p99.\n• Automated regression check passes build pipeline.`
      );
      setConfidenceScore(96);
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSpec: EncapsulatedSpec = {
      id: existingSpec?.id || `spec-${Date.now()}`,
      feedbackId: item.id,
      title,
      coreProblem,
      businessImpact,
      technicalScope: technicalScopeText.split('\n').filter(l => l.trim().length > 0),
      acceptanceCriteria: acceptanceCriteriaText.split('\n').filter(l => l.trim().length > 0),
      suggestedPriority,
      targetEpicLink,
      encapsulatedBy: currentUser,
      encapsulatedAt: new Date().toISOString(),
      confidenceScore,
    };

    onSaveSpec(item.id, newSpec);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      backgroundColor: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(10px)',
    }}>
      <div className="glass-modal" style={{
        width: '100%',
        maxWidth: '1080px',
        maxHeight: '90vh',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header Bar */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-medium)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Feedback Encapsulation Engine
                </h2>
                <span className="badge badge-encapsulated font-mono">
                  {item.code}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Transforming raw customer feedback into a structured engineering spec & epic requirement.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleAutoExtract}
              disabled={isGenerating}
            >
              <Sparkles size={14} />
              <span>{isGenerating ? 'Extracting...' : 'Auto-Extract Spec'}</span>
            </button>

            <button 
              className="btn btn-ghost"
              onClick={onClose}
              style={{ padding: '6px' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body: Split Screen Layout (Raw Feedback vs Encapsulated Form) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '380px 1fr',
          flex: 1,
          overflow: 'hidden'
        }}>
          {/* Left Column: Raw Feedback Snapshot */}
          <div style={{
            backgroundColor: 'var(--text-inverse)',
            borderRight: '1px solid var(--border-medium)',
            padding: '24px',
            overflowY: 'auto'
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
              Raw Feedback Snapshot
            </div>

            {/* Account Card */}
            <div style={{
              padding: '12px',
              backgroundColor: 'var(--bg-card)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {item.account.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {item.account.tier.replace('_', ' ')} • {item.account.annualRevenue}
              </div>
            </div>

            {/* Raw Content Box */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Subject / Title
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                {item.title}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Verbatim Customer Message
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                padding: '12px',
                backgroundColor: 'var(--bg-card)',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                fontStyle: 'italic'
              }}>
                "{item.rawContent}"
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <div>Submitted By: {item.submittedBy}</div>
              <div>Category: {item.category.replace('_', ' ')}</div>
              <div>Priority: {item.priority}</div>
            </div>
          </div>

          {/* Right Column: Encapsulated Spec Builder Form */}
          <form onSubmit={handleSubmit} style={{
            padding: '24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Title */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
                Encapsulated Feature / Spec Title
              </label>
              <input
                type="text"
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Core Problem Statement */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
                Core Problem Statement (Structured)
              </label>
              <textarea
                className="textarea"
                rows={2}
                value={coreProblem}
                onChange={(e) => setCoreProblem(e.target.value)}
                required
              />
            </div>

            {/* Business Impact & Revenue Risk */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
                Quantified Business & Revenue Impact
              </label>
              <textarea
                className="textarea"
                rows={2}
                value={businessImpact}
                onChange={(e) => setBusinessImpact(e.target.value)}
                required
              />
            </div>

            {/* Technical Scope Points */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
                Technical Requirements & Actionable Scope (Line items)
              </label>
              <textarea
                className="textarea font-mono"
                rows={3}
                value={technicalScopeText}
                onChange={(e) => setTechnicalScopeText(e.target.value)}
                required
              />
            </div>

            {/* Acceptance Criteria */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
                Acceptance Criteria & Quality Gates (Line items)
              </label>
              <textarea
                className="textarea font-mono"
                rows={3}
                value={acceptanceCriteriaText}
                onChange={(e) => setAcceptanceCriteriaText(e.target.value)}
                required
              />
            </div>

            {/* Grid for Epic Link, Priority & Confidence */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Target Epic / JIRA Link
                </label>
                <input
                  type="text"
                  className="input font-mono"
                  value={targetEpicLink}
                  onChange={(e) => setTargetEpicLink(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Encapsulated Priority
                </label>
                <select
                  className="select"
                  value={suggestedPriority}
                  onChange={(e) => setSuggestedPriority(e.target.value as PriorityLevel)}
                >
                  <option value="P0_CRITICAL">P0 Critical</option>
                  <option value="P1_HIGH">P1 High</option>
                  <option value="P2_MEDIUM">P2 Medium</option>
                  <option value="P3_LOW">P3 Low</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Spec Confidence Score (%)
                </label>
                <input
                  type="number"
                  className="input font-mono"
                  min={50}
                  max={100}
                  value={confidenceScore}
                  onChange={(e) => setConfidenceScore(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Submit Action Row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--border-medium)',
              paddingTop: '16px',
              marginTop: '8px'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Encapsulating as <strong style={{ color: 'var(--text-primary)' }}>{currentUser}</strong>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <CheckCircle2 size={16} />
                  <span>Save Spec & Advance to Encapsulated Stage</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
