import { useState, useEffect } from 'react';
import { initialFeedbackItems, mockPersonas } from './data/mockData';
import type { FeedbackItem, UserPersona, WorkflowStage, EncapsulatedSpec } from './types/feedback';
import { Login } from './components/auth/Login';
import { Header } from './components/layout/Header';
import { FeedbackList } from './components/feedback/FeedbackList';
import { SubmitFeedbackModal } from './components/feedback/SubmitFeedbackModal';
import { EncapsulationModal } from './components/encapsulation/EncapsulationModal';
import { KanbanBoard } from './components/workflow/KanbanBoard';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { FeedbackDetailsDrawer } from './components/feedback/FeedbackDetailsDrawer';

export function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserPersona>(mockPersonas[0]);
  const [currentTab, setCurrentTab] = useState<string>('feedback');
  
  const [items, setItems] = useState<FeedbackItem[]>(initialFeedbackItems);

  // Modals & Drawers state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [detailsItem, setDetailsItem] = useState<FeedbackItem | null>(null);
  const [encapsulationItem, setEncapsulationItem] = useState<FeedbackItem | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Auth Handlers
  const handleLogin = (user: UserPersona) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Workflow Handlers
  const handleStageChange = (feedbackId: string, newStage: WorkflowStage) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === feedbackId) {
          const now = new Date().toISOString();
          const newAuditLog = {
            id: `aud-${Date.now()}`,
            timestamp: now,
            actor: currentUser.name,
            actorRole: currentUser.role,
            action: 'STAGE_CHANGED',
            details: `Transitioned stage from ${item.stage.toUpperCase()} to ${newStage.toUpperCase()}.`,
          };
          return {
            ...item,
            stage: newStage,
            auditTrail: [...item.auditTrail, newAuditLog],
          };
        }
        return item;
      })
    );

    if (detailsItem && detailsItem.id === feedbackId) {
      setDetailsItem((prev) => prev ? { ...prev, stage: newStage } : null);
    }
  };

  // Encapsulation Handler
  const handleSaveSpec = (feedbackId: string, spec: EncapsulatedSpec) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === feedbackId) {
          const now = new Date().toISOString();
          const newAuditLog = {
            id: `aud-${Date.now()}`,
            timestamp: now,
            actor: currentUser.name,
            actorRole: currentUser.role,
            action: 'ENCAPSULATED',
            details: `Encapsulated raw feedback into technical specification ${spec.id} (${spec.confidenceScore}% fit confidence).`,
          };
          return {
            ...item,
            encapsulatedSpec: spec,
            stage: item.stage === 'inbox' || item.stage === 'triaged' ? 'encapsulated' : item.stage,
            priority: spec.suggestedPriority,
            auditTrail: [...item.auditTrail, newAuditLog],
          };
        }
        return item;
      })
    );
  };

  // Submit Feedback Handler
  const handleAddFeedback = (newItem: FeedbackItem) => {
    setItems((prev) => [newItem, ...prev]);
  };

  // Comment Handler
  const handleAddComment = (feedbackId: string, message: string) => {
    const newComment = {
      id: `cm-${Date.now()}`,
      author: currentUser.name,
      role: currentUser.role.replace('_', ' '),
      timestamp: new Date().toISOString(),
      message,
    };

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === feedbackId) {
          return {
            ...item,
            comments: [...item.comments, newComment],
          };
        }
        return item;
      })
    );

    if (detailsItem && detailsItem.id === feedbackId) {
      setDetailsItem((prev) => prev ? { ...prev, comments: [...prev.comments, newComment] } : null);
    }
  };

  if (!isAuthenticated) {
    return (
      <Login
        onLogin={handleLogin}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Monochromatic Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main View Router */}
      <main style={{ flex: 1 }}>
        {currentTab === 'feedback' && (
          <FeedbackList
            items={items}
            onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
            onOpenDetails={(item) => setDetailsItem(item)}
            onStartEncapsulation={(item) => setEncapsulationItem(item)}
          />
        )}

        {currentTab === 'encapsulation' && (
          <FeedbackList
            items={items.filter(i => !i.encapsulatedSpec || i.stage === 'encapsulated')}
            onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
            onOpenDetails={(item) => setDetailsItem(item)}
            onStartEncapsulation={(item) => setEncapsulationItem(item)}
          />
        )}

        {currentTab === 'workflow' && (
          <KanbanBoard
            items={items}
            onStageChange={handleStageChange}
            onOpenDetails={(item) => setDetailsItem(item)}
            onStartEncapsulation={(item) => setEncapsulationItem(item)}
            onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsDashboard items={items} />
        )}
      </main>

      {/* Submit Modal */}
      <SubmitFeedbackModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmit={handleAddFeedback}
        currentUserRole={currentUser.role}
      />

      {/* Encapsulation Wizard Modal */}
      <EncapsulationModal
        isOpen={!!encapsulationItem}
        item={encapsulationItem}
        onClose={() => setEncapsulationItem(null)}
        onSaveSpec={handleSaveSpec}
        currentUser={currentUser.name}
      />

      {/* Feedback Item Details Drawer */}
      <FeedbackDetailsDrawer
        isOpen={!!detailsItem}
        item={detailsItem}
        onClose={() => setDetailsItem(null)}
        onStageChange={handleStageChange}
        onAddComment={handleAddComment}
        onStartEncapsulation={(item) => setEncapsulationItem(item)}
        currentUser={currentUser.name}
      />
    </div>
  );
}

export default App;
