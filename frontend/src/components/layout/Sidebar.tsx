import React from 'react';
import { NavLink } from 'react-router-dom';
import { useProcessingStore } from '../../store/useProcessingStore';

const linkStyle: React.CSSProperties = {
  display: 'block',
  padding: '0.75rem 1rem',
  borderRadius: 8,
  fontSize: '0.9rem',
  marginBottom: 4
};

export const Sidebar: React.FC = () => {
  const { packages, currentSession } = useProcessingStore();

  return (
    <aside
      style={{
        width: 260,
        borderRight: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-elevated)',
        padding: '1rem 0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}
    >
      <div style={{ padding: '0 0.5rem' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 4 }}>AutoDoc</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)' }}>IA Documentation Pipeline</div>
      </div>

      <nav style={{ flex: 1 }}>
        <NavLink
          to="/"
          style={({ isActive }) => ({
            ...linkStyle,
            backgroundColor: isActive ? 'var(--accent-soft)' : 'transparent',
            color: isActive ? 'var(--text)' : 'var(--text-soft)'
          })}
        >
          1. Seleção de Arquivos
        </NavLink>
        <NavLink
          to="/processing"
          style={({ isActive }) => ({
            ...linkStyle,
            backgroundColor: isActive ? 'var(--accent-soft)' : 'transparent',
            color: isActive ? 'var(--text)' : 'var(--text-soft)'
          })}
        >
          2. Processamento
        </NavLink>
        <NavLink
          to="/documentation"
          style={({ isActive }) => ({
            ...linkStyle,
            backgroundColor: isActive ? 'var(--accent-soft)' : 'transparent',
            color: isActive ? 'var(--text)' : 'var(--text-soft)'
          })}
        >
          3. Documentação Final
        </NavLink>
        <NavLink
          to="/history"
          style={({ isActive }) => ({
            ...linkStyle,
            backgroundColor: isActive ? 'var(--accent-soft)' : 'transparent',
            color: isActive ? 'var(--text)' : 'var(--text-soft)'
          })}
        >
          Histórico
        </NavLink>
        <NavLink
          to="/settings"
          style={({ isActive }) => ({
            ...linkStyle,
            backgroundColor: isActive ? 'var(--accent-soft)' : 'transparent',
            color: isActive ? 'var(--text)' : 'var(--text-soft)'
          })}
        >
          Configurações
        </NavLink>
      </nav>

      <div
        style={{
          fontSize: '0.75rem',
          color: 'var(--text-soft)',
          padding: '0.75rem',
          borderRadius: 8,
          border: '1px dashed var(--border-subtle)',
          backgroundColor: 'rgba(15,23,42,0.7)'
        }}
      >
        <div>Sessão atual:</div>
        <div style={{ fontWeight: 600, marginTop: 2 }}>
          {currentSession ? currentSession.name : 'Nenhuma sessão criada'}
        </div>
        <div style={{ marginTop: 4 }}>
          Pacotes: <strong>{packages.length}</strong>
        </div>
      </div>
    </aside>
  );
};
