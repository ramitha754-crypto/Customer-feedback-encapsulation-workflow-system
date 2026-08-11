import React, { useState } from 'react';
import { 
  X, 
  Cpu, 
  AlertTriangle, 
  MessageSquare, 
  History, 
  Send
} from 'lucide-react';
import type { FeedbackItem, WorkflowStage } from '../../types/feedback';

interface FeedbackDetailsDrawerProps {
  item: FeedbackItem | null;
  isOpen: boolean;
  onClose: () => void;
  onStageChange: (feedbackId: string, newStage: WorkflowStage) => void;
  onAddComment: (feedbackId: string, message: string) => void;
  onStartEncapsulation: (item: FeedbackItem) => void;
  currentUser: string;
}

export const FeedbackDetailsDrawer: React.FC<FeedbackDetailsDrawerProps> = ({
  item,
  isOpen,
  onClose,
  onStageChange,
  onAddComment,
  onStartEncapsulation,
  currentUser: _currentUser,
}) => {
  const [commentInput, setCommentInput] = useState('');

  if (!isOpen || !item) return null;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    onAddComment(item.id, commentInput.trim());
    setCommentInput('');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      display: 'flex',
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
    }}>
      <div className="glass-modal" style={{
        width: '100%',
        maxWidth: '720px',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid var(--border-medium)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Drawer Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-medium)',
          backgroundColor: '#121215',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#a1a1aa' }}>
                {item.code}
              </span>
              <span className="badge" style={{ backgroundColor: '#18181b', color: '#fafafa', border: '1px solid var(--border-medium)' }}>
                {item.category.replace('_', ' ')}
              </span>
              {item.isSlaBreached && (
                <span className="badge badge-breach">
                  <AlertTriangle size={10} /> SLA BREACH
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fafafa', lineHeight: 1.3 }}>
              {item.title}
            </h2>
          </div>

          <button 
            className="btn btn-ghost"
            onClick={onClose}
            style={{ padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body Scroll Container */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* Stage Controls Bar */}
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#09090b',
            borderRadius: '8px',
            border: '1px solid var(--border-medium)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>
              Workflow Stage:
            </div>
            <select
              className="select"
              value={item.stage}
              onChange={(e) => onStageChange(item.id, e.target.value as WorkflowStage)}
              style={{ width: '180px', fontSize: '0.8rem' }}
            >
              <option value="inbox">Inbox</option>
              <option value="triaged">Triaged</option>
              <option value="encapsulated">Encapsulated</option>
              <option value="backlog">In Backlog</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Customer Account Snapshot */}
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', marginBottom: '8px' }}>
              Customer Account Details
            </div>
            <div style={{
              padding: '16px',
              backgroundColor: '#121215',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fafafa' }}>
                  {item.account.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '2px' }}>
                  Tier: {item.account.tier.replace('_', ' ')}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="font-mono" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fafafa' }}>
                  {item.account.annualRevenue}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '2px' }}>
                  Target SLA: {item.account.slaTierHours}h Max Window
                </div>
              </div>
            </div>
          </div>

          {/* Raw Verbatim Feedback */}
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', marginBottom: '8px' }}>
              Raw Feedback Message
            </div>
            <div style={{
              padding: '16px',
              backgroundColor: '#09090b',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
              color: '#a1a1aa',
              lineHeight: 1.6,
              fontStyle: 'italic'
            }}>
              "{item.rawContent}"
            </div>
          </div>

          {/* Encapsulated Spec Section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>
                Encapsulated Specification Document
              </div>
              {!item.encapsulatedSpec && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    onClose();
                    onStartEncapsulation(item);
                  }}
                >
                  <Cpu size={12} />
                  <span>Encapsulate Spec</span>
                </button>
              )}
            </div>

            {item.encapsulatedSpec ? (
              <div style={{
                padding: '20px',
                backgroundColor: '#121215',
                borderRadius: '8px',
                border: '1px solid var(--border-medium)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fafafa' }}>
                      {item.encapsulatedSpec.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '2px' }}>
                      Encapsulated by {item.encapsulatedSpec.encapsulatedBy} • {new Date(item.encapsulatedSpec.encapsulatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="badge badge-encapsulated font-mono">
                    {item.encapsulatedSpec.confidenceScore}% Spec Fit
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', marginBottom: '4px' }}>
                    Core Problem Definition
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#fafafa', lineHeight: 1.4 }}>
                    {item.encapsulatedSpec.coreProblem}
                  </p>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', marginBottom: '4px' }}>
                    Business Impact & Risk
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#fafafa', lineHeight: 1.4 }}>
                    {item.encapsulatedSpec.businessImpact}
                  </p>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', marginBottom: '4px' }}>
                    Technical Scope Line Items
                  </div>
                  <ul style={{ paddingLeft: '20px', fontSize: '0.8rem', color: '#a1a1aa', lineHeight: 1.5 }}>
                    {item.encapsulatedSpec.technicalScope.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', marginBottom: '4px' }}>
                    Acceptance Criteria
                  </div>
                  <ul style={{ paddingLeft: '20px', fontSize: '0.8rem', color: '#a1a1aa', lineHeight: 1.5 }}>
                    {item.encapsulatedSpec.acceptanceCriteria.map((ac, i) => (
                      <li key={i}>{ac}</li>
                    ))}
                  </ul>
                </div>

                {item.encapsulatedSpec.targetEpicLink && (
                  <div style={{
                    padding: '8px 12px',
                    backgroundColor: '#09090b',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.78rem'
                  }}>
                    <span style={{ color: '#a1a1aa' }}>Linked JIRA / Engineering Epic:</span>
                    <span className="font-mono" style={{ color: '#fafafa', fontWeight: 600 }}>
                      {item.encapsulatedSpec.targetEpicLink}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                padding: '24px',
                textAlign: 'center',
                backgroundColor: '#09090b',
                borderRadius: '8px',
                border: '1px dashed var(--border-medium)',
                color: '#71717a',
                fontSize: '0.82rem'
              }}>
                No encapsulated specification generated for this raw item yet.
              </div>
            )}
          </div>

          {/* Audit Trail Timeline */}
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <History size={14} />
              <span>Audit Trail History</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {item.auditTrail.map((log) => (
                <div key={log.id} style={{
                  padding: '10px 12px',
                  backgroundColor: '#09090b',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.78rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 600, color: '#fafafa' }}>{log.actor} ({log.actorRole.replace('_', ' ')})</span>
                    <span className="font-mono" style={{ color: '#71717a', fontSize: '0.7rem' }}>
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ color: '#a1a1aa' }}>{log.details}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Comments Section */}
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={14} />
              <span>Team Collaboration Thread ({item.comments.length})</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {item.comments.map((cm) => (
                <div key={cm.id} style={{
                  padding: '12px',
                  backgroundColor: '#121215',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: '#fafafa' }}>{cm.author} ({cm.role})</span>
                    <span className="font-mono" style={{ color: '#71717a' }}>
                      {new Date(cm.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#a1a1aa' }}>{cm.message}</p>
                </div>
              ))}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="input"
                placeholder="Add internal note or PM comment..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
              />
              <button type="submit" className="btn btn-secondary">
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
