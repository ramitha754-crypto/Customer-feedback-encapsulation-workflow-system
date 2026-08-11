import React, { useState } from 'react';
import { 
  Inbox, 
  CheckSquare, 
  Cpu, 
  Layers, 
  PlayCircle, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  AlertTriangle,
  Plus
} from 'lucide-react';
import type { FeedbackItem, WorkflowStage } from '../../types/feedback';

interface KanbanBoardProps {
  items: FeedbackItem[];
  onStageChange: (feedbackId: string, newStage: WorkflowStage) => void;
  onOpenDetails: (item: FeedbackItem) => void;
  onStartEncapsulation: (item: FeedbackItem) => void;
  onOpenSubmitModal: () => void;
}

const STAGES: { id: WorkflowStage; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'inbox', label: 'Inbox', icon: <Inbox size={15} />, description: 'Raw incoming customer feedback' },
  { id: 'triaged', label: 'Triaged', icon: <CheckSquare size={15} />, description: 'Reviewed & prioritized by support' },
  { id: 'encapsulated', label: 'Encapsulated', icon: <Cpu size={15} />, description: 'Converted to structured tech spec' },
  { id: 'backlog', label: 'In Backlog', icon: <Layers size={15} />, description: 'Scheduled for engineering epic' },
  { id: 'in_progress', label: 'In Progress', icon: <PlayCircle size={15} />, description: 'Active development in sprint' },
  { id: 'resolved', label: 'Resolved', icon: <CheckCircle size={15} />, description: 'Shipped & customer verified' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  items,
  onStageChange,
  onOpenDetails,
  onStartEncapsulation,
  onOpenSubmitModal,
}) => {
  const [filterTier, setFilterTier] = useState<string>('ALL');

  const getItemsByStage = (stageId: WorkflowStage) => {
    return items.filter(item => {
      const matchStage = item.stage === stageId;
      const matchTier = filterTier === 'ALL' || item.account.tier === filterTier;
      return matchStage && matchTier;
    });
  };

  const getNextStage = (current: WorkflowStage): WorkflowStage | null => {
    const sequence: WorkflowStage[] = ['inbox', 'triaged', 'encapsulated', 'backlog', 'in_progress', 'resolved'];
    const idx = sequence.indexOf(current);
    if (idx < sequence.length - 1) return sequence[idx + 1];
    return null;
  };

  const getPrevStage = (current: WorkflowStage): WorkflowStage | null => {
    const sequence: WorkflowStage[] = ['inbox', 'triaged', 'encapsulated', 'backlog', 'in_progress', 'resolved'];
    const idx = sequence.indexOf(current);
    if (idx > 0) return sequence[idx - 1];
    return null;
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fafafa', letterSpacing: '-0.02em' }}>
            Encapsulation Workflow Pipeline
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#a1a1aa', marginTop: '4px' }}>
            Track feedback progression from raw customer ingestion to encapsulated spec and sprint release.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            className="select"
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            style={{ width: '180px' }}
          >
            <option value="ALL">All Account Tiers</option>
            <option value="ENTERPRISE_VIP">Enterprise VIP</option>
            <option value="ENTERPRISE">Enterprise</option>
            <option value="MID_MARKET">Mid-Market</option>
            <option value="SMB">SMB</option>
          </select>

          <button 
            className="btn btn-primary"
            onClick={onOpenSubmitModal}
          >
            <Plus size={16} />
            <span>Ingest Feedback</span>
          </button>
        </div>
      </div>

      {/* Kanban Columns Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, minmax(220px, 1fr))',
        gap: '16px',
        overflowX: 'auto',
        paddingBottom: '24px'
      }}>
        {STAGES.map((stage) => {
          const stageItems = getItemsByStage(stage.id);

          return (
            <div
              key={stage.id}
              style={{
                backgroundColor: '#121215',
                borderRadius: '10px',
                border: '1px solid var(--border-medium)',
                display: 'flex',
                flexDirection: 'column',
                height: '75vh',
                minWidth: '220px'
              }}
            >
              {/* Stage Header */}
              <div style={{
                padding: '14px',
                borderBottom: '1px solid var(--border-medium)',
                backgroundColor: '#09090b',
                borderTopLeftRadius: '10px',
                borderTopRightRadius: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.85rem', color: '#fafafa' }}>
                    {stage.icon}
                    <span>{stage.label}</span>
                  </div>
                  <span className="badge" style={{ backgroundColor: '#27272a', color: '#fafafa', borderRadius: '12px', padding: '2px 8px' }}>
                    {stageItems.length}
                  </span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#71717a' }}>
                  {stage.description}
                </div>
              </div>

              {/* Items List inside Column */}
              <div style={{
                padding: '12px',
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {stageItems.map((item) => {
                  const nextStage = getNextStage(item.stage);
                  const prevStage = getPrevStage(item.stage);

                  return (
                    <div
                      key={item.id}
                      className="glass-panel"
                      style={{
                        padding: '14px',
                        backgroundColor: '#18181b',
                        border: '1px solid var(--border-medium)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onClick={() => onOpenDetails(item)}
                    >
                      {/* Ticket Code & Priority */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span className="font-mono" style={{ fontSize: '0.7rem', fontWeight: 600, color: '#a1a1aa' }}>
                          {item.code}
                        </span>
                        {item.priority === 'P0_CRITICAL' ? (
                          <span className="badge badge-critical font-mono" style={{ fontSize: '0.62rem' }}>P0</span>
                        ) : item.priority === 'P1_HIGH' ? (
                          <span className="badge badge-high font-mono" style={{ fontSize: '0.62rem' }}>P1</span>
                        ) : (
                          <span className="badge badge-medium font-mono" style={{ fontSize: '0.62rem' }}>{item.priority}</span>
                        )}
                      </div>

                      {/* Account Name */}
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#71717a', marginBottom: '4px' }}>
                        {item.account.name}
                      </div>

                      {/* Title */}
                      <div style={{
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: '#fafafa',
                        lineHeight: 1.3,
                        marginBottom: '10px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {item.title}
                      </div>

                      {/* SLA Breach Indicator if applicable */}
                      {item.isSlaBreached && (
                        <div style={{
                          padding: '4px 6px',
                          backgroundColor: '#09090b',
                          border: '1px solid #ffffff',
                          borderRadius: '4px',
                          marginBottom: '8px',
                          fontSize: '0.65rem',
                          color: '#ffffff',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <AlertTriangle size={10} /> SLA BREACH
                        </div>
                      )}

                      {/* Spec Badge if encapsulated */}
                      {item.encapsulatedSpec && (
                        <div style={{
                          fontSize: '0.68rem',
                          color: '#fafafa',
                          backgroundColor: '#09090b',
                          padding: '4px 6px',
                          borderRadius: '4px',
                          border: '1px dashed var(--border-bright)',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <span>Spec Encapsulated</span>
                          <span className="font-mono" style={{ color: '#a1a1aa' }}>{item.encapsulatedSpec.confidenceScore}% Fit</span>
                        </div>
                      )}

                      {/* Stage Transition Control Buttons */}
                      <div 
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', marginTop: '4px' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {prevStage ? (
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '2px 6px', fontSize: '0.68rem', color: '#71717a' }}
                            onClick={() => onStageChange(item.id, prevStage)}
                            title={`Move back to ${prevStage}`}
                          >
                            <ArrowLeft size={12} />
                          </button>
                        ) : <div />}

                        {!item.encapsulatedSpec && item.stage === 'triaged' ? (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ padding: '2px 8px', fontSize: '0.68rem' }}
                            onClick={() => onStartEncapsulation(item)}
                          >
                            <Cpu size={11} />
                            Encapsulate
                          </button>
                        ) : nextStage ? (
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '2px 8px', fontSize: '0.68rem' }}
                            onClick={() => onStageChange(item.id, nextStage)}
                            title={`Advance to ${nextStage}`}
                          >
                            <span>Advance</span>
                            <ArrowRight size={12} />
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.65rem', color: '#71717a' }}>Complete</span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {stageItems.length === 0 && (
                  <div style={{
                    padding: '24px 12px',
                    textAlign: 'center',
                    color: '#52525b',
                    fontSize: '0.75rem',
                    border: '1px dashed var(--border-subtle)',
                    borderRadius: '6px'
                  }}>
                    No items in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
