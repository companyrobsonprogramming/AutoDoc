import React, { useEffect, useRef, useState } from 'react';
import { useFileSelection } from '../../hooks/useFileSelection';
import { createPrompt, updatePrompt, deletePrompt, fetchActiveGeminiKey, fetchIgnoreRules, fetchPrompts } from '../../services/apiClient';
import { useProcessingStore } from '../../store/useProcessingStore';
import { Prompt } from '../../types/domain';

export const FileSelector: React.FC = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { handleFiles } = useFileSelection();
  const {
    selectedFiles,
    prompts,
    setPrompts,
    selectedPrompt,
    setSelectedPrompt,
    setIgnoreRules,
    setActiveGeminiKey
  } = useProcessingStore();
  const [newPromptName, setNewPromptName] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [configMessage, setConfigMessage] = useState<string | undefined>(undefined);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);

  useEffect(() => {
    const loadPrompts = async () => {
      setLoadingPrompts(true);
      try {
        const [promptsResult, ignoreRulesResult, activeKey] = await Promise.all([
          fetchPrompts(),
          fetchIgnoreRules(),
          fetchActiveGeminiKey()
        ]);

        setPrompts(promptsResult);
        setIgnoreRules(ignoreRulesResult);
        setActiveGeminiKey(activeKey?.key);

        if (!activeKey) {
          setConfigMessage('Chave do Gemini não configurada. Cadastre em Configurações (via backend) antes de processar.');
        } else {
          setConfigMessage(undefined);
        }
      } finally {
        setLoadingPrompts(false);
      }
    };
    loadPrompts();
  }, [setActiveGeminiKey, setIgnoreRules, setPrompts]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    handleFiles(e.target.files);
  };

  const onCreatePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromptName || !newPromptContent) return;

    const created = await createPrompt({ name: newPromptName, content: newPromptContent });
    const updatedPrompts = await fetchPrompts();
    setPrompts(updatedPrompts);
    setSelectedPrompt(created);
    setNewPromptName('');
    setNewPromptContent('');
  };

  const onEditPrompt = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setNewPromptName(prompt.name);
    setNewPromptContent(prompt.content);
  };

  const onCancelEdit = () => {
    setEditingPrompt(null);
    setNewPromptName('');
    setNewPromptContent('');
  };

  const onUpdatePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrompt || !newPromptName || !newPromptContent) return;

    const updated = await updatePrompt(editingPrompt.id, { name: newPromptName, content: newPromptContent });
    const updatedPrompts = await fetchPrompts();
    setPrompts(updatedPrompts);
    
    // Atualizar o prompt selecionado se estava editando o prompt selecionado
    if (selectedPrompt?.id === editingPrompt.id) {
      setSelectedPrompt(updated);
    }
    
    setEditingPrompt(null);
    setNewPromptName('');
    setNewPromptContent('');
  };

  const onDeletePrompt = async (promptId: number) => {
    if (!confirm('Tem certeza que deseja excluir este prompt?')) return;

    await deletePrompt(promptId);
    const updatedPrompts = await fetchPrompts();
    setPrompts(updatedPrompts);
    
    // Se o prompt deletado estava selecionado, limpar seleção
    if (selectedPrompt?.id === promptId) {
      setSelectedPrompt(undefined);
    }
  };

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
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>1. Selecione os arquivos / pastas</h2>
        <p style={{ marginTop: 0, marginBottom: 16, fontSize: '0.9rem', color: 'var(--text-soft)' }}>
          Use o seletor abaixo para escolher arquivos ou uma pasta inteira do seu repositório local.
        </p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 999,
            border: '1px solid var(--accent-strong)',
            background:
              'linear-gradient(90deg, rgba(79,70,229,0.95), rgba(14,165,233,0.9))',
            color: '#fff',
            fontSize: '0.9rem',
            cursor: 'pointer',
            marginBottom: 12
          }}
        >
          Selecionar arquivos/pastas
        </button>

        {configMessage && (
          <div
            style={{
              marginBottom: 12,
              padding: '0.65rem 0.75rem',
              borderRadius: 8,
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'rgba(234,179,8,0.08)',
              color: 'var(--text)'
            }}
          >
            {configMessage}
          </div>
        )}

        <input
          type="file"
          multiple
          webkitdirectory="true"
          ref={inputRef}
          style={{ display: 'none' }}
          onChange={onInputChange}
        />

        <div
          style={{
            marginTop: 12,
            maxHeight: 260,
            overflow: 'auto',
            borderRadius: 8,
            border: '1px solid var(--border-subtle)',
            padding: '0.5rem'
          }}
        >
          <div
            style={{
              fontSize: '0.8rem',
              marginBottom: 4,
              color: 'var(--text-soft)',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <span>Arquivos selecionados</span>
            <span>{selectedFiles.length} arquivo(s)</span>
          </div>
          {selectedFiles.length === 0 && (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-soft)', padding: '0.5rem 0.25rem' }}>
              Nenhum arquivo selecionado ainda.
            </div>
          )}
          {selectedFiles.map((f) => (
            <div
              key={f.id}
              style={{
                fontSize: '0.8rem',
                padding: '0.25rem 0.25rem',
                borderBottom: '1px dashed rgba(55,65,81,0.4)'
              }}
            >
              <div>{f.path}</div>
              <div style={{ color: 'var(--text-soft)' }}>{(f.size / 1024).toFixed(1)} KB</div>
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
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>2. Selecione ou crie um Prompt</h2>
        <p style={{ marginTop: 0, marginBottom: 16, fontSize: '0.9rem', color: 'var(--text-soft)' }}>
          O prompt será utilizado para instruir a IA sobre como gerar a documentação.
        </p>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.8rem',
              color: 'var(--text-soft)',
              marginBottom: 4
            }}
          >
            Prompts existentes
          </label>
          <select
            disabled={loadingPrompts}
            value={selectedPrompt?.id ?? ''}
            onChange={(e) => {
              const id = Number(e.target.value);
              const p = prompts.find((x) => x.id === id);
              useProcessingStore.getState().setSelectedPrompt(p);
            }}
            style={{
              width: '100%',
              borderRadius: 999,
              padding: '0.4rem 0.75rem',
              border: '1px solid var(--border-subtle)',
              backgroundColor: '#020617',
              color: 'var(--text)',
              fontSize: '0.9rem',
              marginBottom: 8
            }}
          >
            <option value="">{loadingPrompts ? 'Carregando...' : 'Selecione um prompt'}</option>
            {prompts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {prompts.length > 0 && (
            <div
              style={{
                maxHeight: '200px',
                overflow: 'auto',
                borderRadius: 8,
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#020617',
                padding: '0.5rem'
              }}
            >
              {prompts.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem',
                    borderRadius: 6,
                    marginBottom: '0.25rem',
                    backgroundColor: selectedPrompt?.id === p.id ? 'rgba(79,70,229,0.2)' : 'transparent'
                  }}
                >
                  <div style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text)' }}>
                    <div style={{ fontWeight: 500 }}>{p.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)', marginTop: 2 }}>
                      {p.content.substring(0, 50)}...
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      type="button"
                      onClick={() => onEditPrompt(p)}
                      style={{
                        padding: '0.3rem 0.6rem',
                        borderRadius: 6,
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: 'transparent',
                        color: 'var(--text)',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeletePrompt(p.id)}
                      style={{
                        padding: '0.3rem 0.6rem',
                        borderRadius: 6,
                        border: '1px solid rgba(248,113,113,0.5)',
                        backgroundColor: 'transparent',
                        color: 'rgba(248,113,113,1)',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: 16,
            paddingTop: 12,
            borderTop: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ fontSize: '0.8rem', marginBottom: 8, color: 'var(--text-soft)' }}>
            {editingPrompt ? 'Editando prompt' : 'Ou crie um novo prompt'}
          </div>
          <form onSubmit={editingPrompt ? onUpdatePrompt : onCreatePrompt}>
            <input
              type="text"
              placeholder="Nome do prompt"
              value={newPromptName}
              onChange={(e) => setNewPromptName(e.target.value)}
              style={{
                width: '100%',
                borderRadius: 999,
                padding: '0.4rem 0.75rem',
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#020617',
                color: 'var(--text)',
                fontSize: '0.9rem',
                marginBottom: 8
              }}
            />
            <textarea
              placeholder="Conteúdo do prompt..."
              value={newPromptContent}
              onChange={(e) => setNewPromptContent(e.target.value)}
              rows={6}
              style={{
                width: '100%',
                borderRadius: 12,
                padding: '0.6rem 0.75rem',
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#020617',
                color: 'var(--text)',
                fontSize: '0.9rem',
                resize: 'vertical',
                marginBottom: 8
              }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="submit"
                disabled={!newPromptName || !newPromptContent}
                style={{
                  padding: '0.6rem 1rem',
                  borderRadius: 999,
                  border: 'none',
                  backgroundColor: 'var(--accent-strong)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  opacity: !newPromptName || !newPromptContent ? 0.5 : 1
                }}
              >
                {editingPrompt ? 'Atualizar prompt' : 'Salvar prompt'}
              </button>
              {editingPrompt && (
                <button
                  type="button"
                  onClick={onCancelEdit}
                  style={{
                    padding: '0.6rem 1rem',
                    borderRadius: 999,
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'transparent',
                    color: 'var(--text)',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};
