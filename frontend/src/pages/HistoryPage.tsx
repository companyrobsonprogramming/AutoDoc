import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSessions, getFinalDocumentation, updateSessionName, deleteSession } from '../services/apiClient';
import { ProcessingSession } from '../types/domain';
import { useProcessingStore } from '../store/useProcessingStore';

export const HistoryPage: React.FC = () => {
  const [sessions, setSessions] = useState<ProcessingSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [editingSessionName, setEditingSessionName] = useState<string>('');
  const { setSession, setFinalDocumentation } = useProcessingStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const allSessions = await fetchSessions();
      setSessions(allSessions);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocumentation = async (session: ProcessingSession) => {
    try {
      if (session.status === 'completed') {
        const doc = await getFinalDocumentation(session.id);
        setFinalDocumentation(doc);
        setSession(session);
        navigate('/documentation');
      } else {
        setSession(session);
        navigate('/processing');
      }
    } catch (err) {
      console.error('Erro ao carregar documentação:', err);
    }
  };

  const getStatusLabel = (status: ProcessingSession['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'processing':
        return 'Processando';
      case 'completed':
        return 'Concluído';
      default:
        return status;
    }
  };

  const getStatusColor = (status: ProcessingSession['status']) => {
    switch (status) {
      case 'pending':
        return 'rgba(234,179,8,0.2)';
      case 'processing':
        return 'rgba(59,130,246,0.2)';
      case 'completed':
        return 'rgba(34,197,94,0.2)';
      default:
        return 'var(--bg-elevated)';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStartEdit = (session: ProcessingSession) => {
    setEditingSessionId(session.id);
    setEditingSessionName(session.name);
  };

  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditingSessionName('');
  };

  const handleSaveEdit = async (sessionId: number) => {
    if (!editingSessionName.trim()) return;

    try {
      await updateSessionName(sessionId, editingSessionName.trim());
      await loadSessions();
      setEditingSessionId(null);
      setEditingSessionName('');
    } catch (err) {
      console.error('Erro ao atualizar nome da sessão:', err);
    }
  };

  const handleDeleteSession = async (sessionId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta sessão? Esta ação não pode ser desfeita.')) return;

    try {
      await deleteSession(sessionId);
      await loadSessions();
    } catch (err) {
      console.error('Erro ao excluir sessão:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <section
        style={{
          padding: '1.25rem',
          borderRadius: 12,
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>Histórico de Sessões</h2>
        <p style={{ marginTop: 0, marginBottom: 16, fontSize: '0.9rem', color: 'var(--text-soft)' }}>
          Visualize e recupere sessões de processamento anteriores.
        </p>
      </section>

      {loading ? (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--text-soft)',
            fontSize: '0.9rem'
          }}
        >
          Carregando histórico...
        </div>
      ) : sessions.length === 0 ? (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--text-soft)',
            fontSize: '0.9rem',
            borderRadius: 12,
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          Nenhuma sessão encontrada.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sessions.map((session) => (
            <div
              key={session.id}
              style={{
                padding: '1rem',
                borderRadius: 12,
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem'
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.5rem'
                  }}
                >
                  {editingSessionId === session.id ? (
                    <input
                      type="text"
                      value={editingSessionName}
                      onChange={(e) => setEditingSessionName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveEdit(session.id);
                        } else if (e.key === 'Escape') {
                          handleCancelEdit();
                        }
                      }}
                      autoFocus
                      style={{
                        flex: 1,
                        padding: '0.4rem 0.75rem',
                        borderRadius: 8,
                        border: '1px solid var(--accent-strong)',
                        backgroundColor: '#020617',
                        color: 'var(--text)',
                        fontSize: '1rem',
                        fontWeight: 500
                      }}
                    />
                  ) : (
                    <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text)' }}>
                      {session.name}
                    </h3>
                  )}
                  <span
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: 999,
                      fontSize: '0.75rem',
                      backgroundColor: getStatusColor(session.status),
                      color: 'var(--text)',
                      fontWeight: 500
                    }}
                  >
                    {getStatusLabel(session.status)}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-soft)', marginBottom: '0.25rem' }}>
                  Repositório: <strong>{session.repositoryName}</strong>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-soft)', marginBottom: '0.25rem' }}>
                  Pacotes: <strong>{session.totalPackages}</strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)' }}>
                  Criado em: {formatDate(session.createdAt)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {editingSessionId === session.id ? (
                  <>
                    <button
                      onClick={() => handleSaveEdit(session.id)}
                      disabled={!editingSessionName.trim()}
                      style={{
                        padding: '0.6rem 1rem',
                        borderRadius: 999,
                        border: 'none',
                        backgroundColor: 'var(--accent-strong)',
                        color: '#fff',
                        cursor: editingSessionName.trim() ? 'pointer' : 'not-allowed',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        opacity: editingSessionName.trim() ? 1 : 0.5
                      }}
                    >
                      Salvar
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      style={{
                        padding: '0.6rem 1rem',
                        borderRadius: 999,
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: 'transparent',
                        color: 'var(--text)',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    {session.status === 'completed' && (
                      <button
                        onClick={() => handleViewDocumentation(session)}
                        style={{
                          padding: '0.6rem 1rem',
                          borderRadius: 999,
                          border: 'none',
                          backgroundColor: 'var(--accent-strong)',
                          color: '#fff',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 500
                        }}
                      >
                        Ver Documentação
                      </button>
                    )}
                    <button
                      onClick={() => handleViewDocumentation(session)}
                      style={{
                        padding: '0.6rem 1rem',
                        borderRadius: 999,
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: 'transparent',
                        color: 'var(--text)',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      {session.status === 'completed' ? 'Ver Detalhes' : 'Continuar'}
                    </button>
                    <button
                      onClick={() => handleStartEdit(session)}
                      style={{
                        padding: '0.6rem 1rem',
                        borderRadius: 999,
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: 'transparent',
                        color: 'var(--text)',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      Editar Nome
                    </button>
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      style={{
                        padding: '0.6rem 1rem',
                        borderRadius: 999,
                        border: '1px solid rgba(248,113,113,0.5)',
                        backgroundColor: 'transparent',
                        color: 'rgba(248,113,113,1)',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      Excluir
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

