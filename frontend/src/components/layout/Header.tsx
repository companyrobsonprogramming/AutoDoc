import React from 'react';
import { useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
  const location = useLocation();

  const title =
    location.pathname === '/'
      ? 'Seleção de Arquivos'
      : location.pathname === '/processing'
        ? 'Processamento dos Pacotes'
        : 'Documentação Final';

  return (
    <header
      style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'linear-gradient(to right, rgba(15,23,42,0.95), rgba(30,64,175,0.3))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}
    >
      <div>
        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600 }}>{title}</h1>
        <p style={{ margin: 0, marginTop: 4, color: 'var(--text-soft)', fontSize: '0.85rem' }}>
          Plataforma de documentação automática de repositórios com IA (Gemini)
        </p>
      </div>
      <div
        style={{
          fontSize: '0.8rem',
          color: 'var(--text-soft)',
          borderRadius: 999,
          padding: '0.25rem 0.75rem',
          border: '1px solid var(--accent-soft)',
          background: 'rgba(15,23,42,0.7)'
        }}
      >
        AutoDoc v1.0
      </div>
    </header>
  );
};
