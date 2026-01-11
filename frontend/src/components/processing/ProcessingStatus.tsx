import React from 'react';
import { useProcessingStore } from '../../store/useProcessingStore';

export const ProcessingStatus: React.FC = () => {
  const { packages, currentPackageIndex, isProcessing, error } = useProcessingStore();

  const completed = packages.filter((p) => p.status === 'completed').length;
  const total = packages.length || 1;
  const progress = Math.round((completed / total) * 100);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1.2fr',
        gap: '1.5rem'
      }}
    >
      <section
        style={{
          padding: '1.25rem',
          borderRadius: 12,
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>Progresso dos Pacotes</h2>
        <p style={{ marginTop: 0, marginBottom: 16, fontSize: '0.9rem', color: 'var(--text-soft)' }}>
          Cada pacote é enviado para o Gemini, e o resultado parcial é salvo no back-end.
        </p>

        <div
          style={{
            borderRadius: 999,
            border: '1px solid var(--border-subtle)',
            padding: 2,
            marginBottom: 12,
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: 16,
              borderRadius: 999,
              background:
                'linear-gradient(90deg, rgba(34,197,94,1), rgba(22,163,74,1))',
              transition: 'width 0.3s ease'
            }}
          />
        </div>

        <div
          style={{
            fontSize: '0.85rem',
            marginBottom: 16,
            color: 'var(--text-soft)',
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <span>
            Pacotes concluídos: <strong>{completed}</strong> / {total}
          </span>
          <span>
            Status:{' '}
            <strong>{isProcessing ? 'Processando...' : completed === total ? 'Concluído' : 'Pendente'}</strong>
          </span>
        </div>

        <div
          style={{
            maxHeight: 260,
            overflow: 'auto',
            border: '1px solid var(--border-subtle)',
            borderRadius: 8,
            padding: '0.5rem'
          }}
        >
          {packages.map((p, idx) => (
            <div
              key={p.id}
              style={{
                fontSize: '0.8rem',
                padding: '0.4rem 0.25rem',
                borderBottom: '1px dashed rgba(55,65,81,0.4)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor:
                  currentPackageIndex === idx ? 'rgba(37,99,235,0.1)' : 'transparent'
              }}
            >
              <div>
                <div>Pacote #{p.index}</div>
                <div style={{ color: 'var(--text-soft)' }}>
                  {(p.totalSizeBytes / 1024).toFixed(1)} KB • {p.files.length} arquivos
                </div>
              </div>
              <div>
                <span
                  style={{
                    padding: '0.15rem 0.6rem',
                    borderRadius: 999,
                    fontSize: '0.7rem',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor:
                      p.status === 'completed'
                        ? 'rgba(34,197,94,0.15)'
                        : p.status === 'processing'
                        ? 'rgba(59,130,246,0.15)'
                        : p.status === 'error'
                        ? 'rgba(248,113,113,0.15)'
                        : 'transparent'
                  }}
                >
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          padding: '1.25rem',
          borderRadius: 12,
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>Resultado Parcial Atual</h2>
        <p style={{ marginTop: 0, marginBottom: 12, fontSize: '0.9rem', color: 'var(--text-soft)' }}>
          Visualize o último resultado retornado pela IA para debug e acompanhamento.
        </p>

        {error && (
          <div
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 8,
              border: '1px solid rgba(248,113,113,0.5)',
              backgroundColor: 'rgba(153,27,27,0.3)',
              color: '#fecaca',
              fontSize: '0.8rem',
              marginBottom: 8
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            maxHeight: 320,
            overflow: 'auto',
            borderRadius: 8,
            border: '1px solid var(--border-subtle)',
            padding: '0.75rem',
            fontSize: '0.8rem',
            backgroundColor: '#020617'
          }}
        >
          {(() => {
            const lastCompleted = [...packages]
              .filter((p) => p.aiResult)
              .sort((a, b) => b.index - a.index)[0];
            if (!lastCompleted) {
              return <span style={{ color: 'var(--text-soft)' }}>Nenhum resultado disponível ainda.</span>;
            }
            return <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{lastCompleted.aiResult}</pre>;
          })()}
        </div>
      </section>
    </div>
  );
};
