import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSelector } from '../components/files/FileSelector';
import { ModelSelector } from '../components/model/ModelSelector';
import { useProcessingFlow } from '../hooks/useProcessingFlow';
import { useProcessingStore } from '../store/useProcessingStore';

export const FileSelectionPage: React.FC = () => {
  const { selectedFiles, selectedPrompt, packages } = useProcessingStore();
  const { preparePackagesAndSession } = useProcessingFlow();
  const navigate = useNavigate();

  const disabled = !selectedFiles.length || !selectedPrompt;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <FileSelector />
      <section
        style={{
          padding: '1.25rem',
          borderRadius: 12,
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>Selecione o modelo do Gemini</h2>
        <p style={{ marginTop: 0, marginBottom: 12, fontSize: '0.9rem', color: 'var(--text-soft)' }}>
          Escolha o modelo do Gemini que será usado para gerar a documentação.
        </p>
        <ModelSelector />
      </section>
      <section
        style={{
          padding: '1.25rem',
          borderRadius: 12,
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}
      >
        <div style={{ fontSize: '0.9rem', color: 'var(--text-soft)' }}>
          <div>
            Arquivos selecionados: <strong>{selectedFiles.length}</strong>
          </div>
          <div>
            Prompt selecionado:{' '}
            <strong>{selectedPrompt ? selectedPrompt.name : 'Nenhum'}</strong>
          </div>
          <div>
            Pacotes atuais em memória: <strong>{packages.length}</strong>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            disabled={disabled}
            onClick={async () => {
              await preparePackagesAndSession({});
            }}
            style={{
              padding: '0.7rem 1rem',
              borderRadius: 999,
              border: 'none',
              backgroundColor: disabled ? 'rgba(75,85,99,0.7)' : 'var(--accent-strong)',
              color: '#fff',
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Criar sessão e processar
          </button>
          {packages.length > 0 && (
            <button
              type="button"
              onClick={() => navigate('/processing')}
              style={{
                padding: '0.7rem 1rem',
                borderRadius: 999,
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#020617',
                color: 'var(--text)',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Ir para processamento
            </button>
          )}
        </div>
      </section>
    </div>
  );
};
