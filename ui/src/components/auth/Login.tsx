import React, { useState } from 'react';
import { Layers, ShieldCheck, ArrowRight, KeyRound, CheckCircle2, User, Sun, Moon } from 'lucide-react';
import type { UserPersona } from '../../types/feedback';
import { mockPersonas } from '../../data/mockData';

interface LoginProps {
  onLogin: (user: UserPersona) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, theme, onToggleTheme }) => {
  const [selectedPersona, setSelectedPersona] = useState<UserPersona>(mockPersonas[0]);
  const [email, setEmail] = useState(mockPersonas[0].email);
  const [password, setPassword] = useState('••••••••••••');
  const [authMode, setAuthMode] = useState<'sso' | 'credentials'>('sso');
  const [isLoading, setIsLoading] = useState(false);

  const handlePersonaSelect = (persona: UserPersona) => {
    setSelectedPersona(persona);
    setEmail(persona.email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(selectedPersona);
    }, 600);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Top Corner Theme Switcher */}
      <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 10 }}>
        <button
          className="btn btn-outline"
          onClick={onToggleTheme}
          style={{ height: '36px', fontSize: '0.8rem', padding: '0 12px' }}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
        </button>
      </div>

      {/* Background Monochromatic Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 50% 30%, var(--accent-glow) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%',
        maxWidth: '480px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Top Brand Banner */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: 'var(--text-primary)',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-inverse)',
            marginBottom: '16px',
            boxShadow: 'var(--shadow-md)'
          }}>
            <Layers size={26} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
            ENCAP<span style={{ fontWeight: 300, color: 'var(--text-secondary)' }}>FLOW</span>
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Enterprise Customer Feedback & Encapsulation System
          </p>
        </div>

        {/* Main Monochromatic Card */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          {/* Auth Mode Toggle */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: 'var(--bg-dark)',
            padding: '4px',
            borderRadius: '8px',
            marginBottom: '24px',
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              type="button"
              className={`btn ${authMode === 'sso' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setAuthMode('sso')}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <ShieldCheck size={14} />
              Enterprise SSO
            </button>
            <button
              type="button"
              className={`btn ${authMode === 'credentials' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setAuthMode('credentials')}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <KeyRound size={14} />
              Credentials
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Enterprise Identity Email
              </label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="user@enterprise.com"
              />
            </div>

            {authMode === 'credentials' && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Password
                  </label>
                  <a href="#forgot" onClick={(e) => e.preventDefault()} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
                    Reset key?
                  </a>
                </div>
                <input
                  type="password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}

            {authMode === 'sso' && (
              <div style={{
                padding: '12px',
                backgroundColor: 'var(--bg-dark)',
                borderRadius: '6px',
                border: '1px solid var(--border-medium)',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <ShieldCheck size={18} style={{ color: 'var(--text-primary)' }} />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Federated SAML 2.0 Auth active (Azure AD / Okta / Ping Identity)
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{ width: '100%', height: '44px', fontSize: '0.9rem', marginBottom: '24px' }}
            >
              {isLoading ? 'Authenticating Token...' : (
                <>
                  <span>Sign In to Workflow Console</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Persona Demo Switcher Preset Box */}
          <div style={{
            borderTop: '1px solid var(--border-medium)',
            paddingTop: '20px',
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={12} />
              <span>Quick Login as Persona (Demo Presets):</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {mockPersonas.map((persona) => {
                const isSelected = selectedPersona.id === persona.id;
                return (
                  <button
                    key={persona.id}
                    type="button"
                    onClick={() => handlePersonaSelect(persona)}
                    style={{
                      backgroundColor: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-dark)',
                      border: `1px solid ${isSelected ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
                      borderRadius: '6px',
                      padding: '8px 10px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {persona.name.split(' ')[0]}
                      </span>
                      {isSelected && <CheckCircle2 size={12} style={{ color: 'var(--text-primary)' }} />}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {persona.role.replace('_', ' ')}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Security Badges */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px',
          marginTop: '24px',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          <span>SOC2 Type II Certified</span>
          <span>•</span>
          <span>ISO 27001 Encrypted</span>
          <span>•</span>
          <span>256-Bit TLS</span>
        </div>
      </div>
    </div>
  );
};
