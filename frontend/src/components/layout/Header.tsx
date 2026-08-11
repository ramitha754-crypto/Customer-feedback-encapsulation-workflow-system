import React from 'react';
import { 
  Layers, 
  Inbox, 
  Cpu, 
  GitPullRequest, 
  BarChart3, 
  Plus, 
  Sun,
  Moon,
  Lock
} from 'lucide-react';
import type { UserPersona } from '../../types/feedback';
import { mockPersonas } from '../../data/mockData';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: UserPersona;
  setCurrentUser: (user: UserPersona) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenSubmitModal: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  setCurrentUser,
  theme,
  onToggleTheme,
  onOpenSubmitModal,
  onLogout,
}) => {
  return (
    <header style={{
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-medium)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      transition: 'background-color 0.25s ease, border-color 0.25s ease'
    }}>
      <div className="header-container">
        {/* Left Section: Brand Logo & System Info */}
        <div className="header-brand">
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }}
            onClick={() => setCurrentTab('feedback')}
            title="EncapFlow Home"
          >
            <div style={{
              width: '34px',
              height: '34px',
              backgroundColor: 'var(--text-primary)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-inverse)',
              fontWeight: 700,
              boxShadow: 'var(--shadow-sm)',
              flexShrink: 0
            }}>
              <Layers size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                  ENCAP<span style={{ fontWeight: 300, color: 'var(--text-secondary)' }}>FLOW</span>
                </span>
                <span className="badge" style={{ backgroundColor: 'var(--bg-card-active)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)', padding: '1px 6px', fontSize: '0.65rem' }}>
                  ENT v4.2
                </span>
              </div>
              <div className="header-brand-subtitle">
                <span className="pulse-dot" style={{ marginRight: 6 }}></span>
                <span>Feedback Encapsulation Engine</span>
              </div>
            </div>
          </div>
          <div className="header-divider header-brand-divider"></div>
        </div>

        {/* Center Section: Navigation Tabs */}
        <nav className="header-nav">
          <button
            className={`btn header-nav-btn ${currentTab === 'feedback' ? 'active' : 'btn-ghost'}`}
            onClick={() => setCurrentTab('feedback')}
          >
            <Inbox size={15} />
            <span>Feedback Ingestion</span>
          </button>

          <button
            className={`btn header-nav-btn ${currentTab === 'encapsulation' ? 'active' : 'btn-ghost'}`}
            onClick={() => setCurrentTab('encapsulation')}
          >
            <Cpu size={15} />
            <span>Encapsulation Engine</span>
          </button>

          <button
            className={`btn header-nav-btn ${currentTab === 'workflow' ? 'active' : 'btn-ghost'}`}
            onClick={() => setCurrentTab('workflow')}
          >
            <GitPullRequest size={15} />
            <span>Workflow Pipeline</span>
          </button>

          <button
            className={`btn header-nav-btn ${currentTab === 'analytics' ? 'active' : 'btn-ghost'}`}
            onClick={() => setCurrentTab('analytics')}
          >
            <BarChart3 size={15} />
            <span>SLA & Analytics</span>
          </button>
        </nav>

        {/* Right Section: Theme, Action & Persona Selector */}
        <div className="header-actions">
          {/* Theme Switcher Button */}
          <button
            className="btn btn-outline"
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
            style={{ height: '34px', padding: '0 10px', fontSize: '0.78rem', flexShrink: 0 }}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            <span className="header-btn-label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>

          {/* New Feedback Action Button */}
          <button 
            className="btn btn-primary" 
            onClick={onOpenSubmitModal}
            style={{ height: '34px', fontSize: '0.78rem', padding: '0 12px', flexShrink: 0 }}
          >
            <Plus size={14} />
            <span className="header-btn-label">New Feedback</span>
          </button>

          <div className="header-divider"></div>

          {/* Enterprise Persona Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <div className="header-user-info">
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                {currentUser.title}
              </div>
            </div>

            <select
              className="header-select"
              value={currentUser.id}
              onChange={(e) => {
                const found = mockPersonas.find(p => p.id === e.target.value);
                if (found) setCurrentUser(found);
              }}
              title="Switch Demo Persona"
            >
              {mockPersonas.map((p) => (
                <option key={p.id} value={p.id}>
                  🎭 {p.role.replace('_', ' ')} ({p.name.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>

          {/* Logout Button */}
          <button 
            className="btn btn-ghost" 
            onClick={onLogout}
            title="Lock Session & Return to Login Screen"
            style={{ width: '34px', height: '34px', padding: 0, color: 'var(--text-muted)', flexShrink: 0 }}
          >
            <Lock size={15} />
          </button>
        </div>
      </div>
    </header>
  );
};
