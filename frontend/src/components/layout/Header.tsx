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
      transition: 'background-color 0.25s ease, border-color 0.25s ease'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        {/* Brand Logo & System Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
          }} onClick={() => setCurrentTab('feedback')}>
            <div style={{
              width: '36px',
              height: '36px',
              backgroundColor: 'var(--text-primary)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-inverse)',
              fontWeight: 700,
              boxShadow: 'var(--shadow-sm)'
            }}>
              <Layers size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                  ENCAP<span style={{ fontWeight: 300, color: 'var(--text-secondary)' }}>FLOW</span>
                </span>
                <span className="badge" style={{ backgroundColor: 'var(--bg-card-active)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                  ENT v4.2
                </span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="pulse-dot"></span>
                <span>Feedback Encapsulation Engine</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            className={`btn ${currentTab === 'feedback' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setCurrentTab('feedback')}
            style={{ height: '38px', padding: '0 14px', fontSize: '0.85rem' }}
          >
            <Inbox size={16} />
            <span>Feedback Ingestion</span>
          </button>

          <button
            className={`btn ${currentTab === 'encapsulation' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setCurrentTab('encapsulation')}
            style={{ height: '38px', padding: '0 14px', fontSize: '0.85rem' }}
          >
            <Cpu size={16} />
            <span>Encapsulation Engine</span>
          </button>

          <button
            className={`btn ${currentTab === 'workflow' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setCurrentTab('workflow')}
            style={{ height: '38px', padding: '0 14px', fontSize: '0.85rem' }}
          >
            <GitPullRequest size={16} />
            <span>Workflow Pipeline</span>
          </button>

          <button
            className={`btn ${currentTab === 'analytics' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setCurrentTab('analytics')}
            style={{ height: '38px', padding: '0 14px', fontSize: '0.85rem' }}
          >
            <BarChart3 size={16} />
            <span>SLA & Analytics</span>
          </button>
        </nav>

        {/* Right Action Bar, Theme Switcher & Persona Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Theme Toggle Button */}
          <button
            className="btn btn-outline"
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light Monochromatic' : 'Dark Monochromatic'} Theme`}
            style={{ height: '36px', padding: '0 10px', fontSize: '0.8rem' }}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>

          {/* Submit New Feedback Button */}
          <button 
            className="btn btn-secondary" 
            onClick={onOpenSubmitModal}
            style={{ height: '36px', fontSize: '0.8rem', padding: '0 12px' }}
          >
            <Plus size={15} />
            <span>New Feedback</span>
          </button>

          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-medium)' }}></div>

          {/* Quick Demo Persona Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                {currentUser.title}
              </div>
            </div>

            <select
              value={currentUser.id}
              onChange={(e) => {
                const found = mockPersonas.find(p => p.id === e.target.value);
                if (found) setCurrentUser(found);
              }}
              style={{
                backgroundColor: 'var(--bg-card-hover)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                outline: 'none',
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

          {/* Login Screen / Sign Out Button */}
          <button 
            className="btn btn-ghost" 
            onClick={onLogout}
            title="Lock & Go to Login Screen"
            style={{ padding: '6px', color: 'var(--text-muted)' }}
          >
            <Lock size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
