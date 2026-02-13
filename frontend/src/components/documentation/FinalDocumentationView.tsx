import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { fetchActiveGeminiKey, fetchPrompts, updateDocumentationContent } from '../../services/apiClient';
import { exportAsDocx, exportAsMarkdown, exportAsPdf } from '../../services/exportService';
import { refineDocumentationWithPrompt } from '../../services/geminiService';
import { useProcessingStore } from '../../store/useProcessingStore';

export const FinalDocumentationView: React.FC = () => {
  const { finalDocumentation, setFinalDocumentation, activeGeminiKey, setActiveGeminiKey, setError, temperature, selectedModel, prompts, setPrompts, selectedPrompt, setSelectedPrompt } = useProcessingStore();
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [viewMode, setViewMode] = useState<'markdown' | 'raw'>('markdown');

  useEffect(() => {
    const loadPrompts = async () => {
      try {
        const promptsResult = await fetchPrompts();
        setPrompts(promptsResult);
      } catch (err) {
        console.error('Erro ao carregar prompts:', err);
      }
    };
    if (prompts.length === 0) {
      loadPrompts();
    }
  }, [prompts.length, setPrompts]);

  if (!finalDocumentation) {
    return (
      <div
        style={{
          padding: '1.25rem',
          borderRadius: 12,
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>Nenhuma documentação disponível</h2>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-soft)' }}>
          Execute um processamento completo para gerar a documentação final.
        </p>
      </div>
    );
  }

  const handleRefineDocumentation = async () => {
    if (!refinementPrompt.trim()) {
      setError('Por favor, insira um prompt para refinar a documentação.');
      return;
    }

    if (!finalDocumentation) {
      return;
    }

    setIsRefining(true);
    setError(undefined);

    try {
      // Sempre buscar a chave ativa do banco (não usar cache)
      const remoteKey = await fetchActiveGeminiKey();
      if (!remoteKey?.isActive || !remoteKey.key) {
        throw new Error('Chave da API do Gemini não configurada. Cadastre em Configurações antes de usar.');
      }
      
      const geminiKey = remoteKey.key;
      // Atualizar o store com a chave atual para referência
      setActiveGeminiKey(geminiKey);

      // Chamar Gemini para refinar a documentação com temperatura e modelo configurados
      const result = await refineDocumentationWithPrompt(
        geminiKey,
        finalDocumentation.contentMarkdown,
        refinementPrompt,
        temperature,
        selectedModel
      );

      // Atualizar no backend
      const updatedDoc = await updateDocumentationContent(finalDocumentation.sessionId, result.text);

      // Atualizar no store
      setFinalDocumentation(updatedDoc);

      // Limpar o prompt
      setRefinementPrompt('');
    } catch (err) {
      console.error('Erro ao refinar documentação:', err);
      let errorMessage = 'Erro desconhecido ao refinar a documentação.';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      setError(errorMessage);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
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
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>Refinar documentação</h2>
        <p style={{ marginTop: 0, marginBottom: 12, fontSize: '0.9rem', color: 'var(--text-soft)' }}>
          Aplique um prompt adicional para refinar, ajustar ou melhorar a documentação gerada. Exemplo: &quot;Reorganize em seções mais claras&quot;, &quot;Adicione exemplos de uso&quot;, &quot;Traduza para inglês&quot;.
        </p>

        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.8rem',
              color: 'var(--text-soft)',
              marginBottom: 4
            }}
          >
            Selecionar um prompt salvo (opcional)
          </label>
          <select
            value={selectedPrompt?.id ?? ''}
            onChange={(e) => {
              const id = Number(e.target.value);
              const p = prompts.find((x) => x.id === id);
              setSelectedPrompt(p);
              if (p) {
                setRefinementPrompt(p.content);
              }
            }}
            disabled={isRefining}
            style={{
              width: '100%',
              borderRadius: 999,
              padding: '0.4rem 0.75rem',
              border: '1px solid var(--border-subtle)',
              backgroundColor: '#020617',
              color: 'var(--text)',
              fontSize: '0.9rem',
              cursor: isRefining ? 'not-allowed' : 'pointer'
            }}
          >
            <option value="">Selecione um prompt ou digite manualmente</option>
            {prompts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <textarea
          value={refinementPrompt}
          onChange={(e) => setRefinementPrompt(e.target.value)}
          placeholder="Ex: Reorganize a documentação em seções mais claras, adicione exemplos práticos, traduza para português..."
          disabled={isRefining}
          style={{
            width: '100%',
            minHeight: '100px',
            padding: '0.75rem',
            borderRadius: 8,
            border: '1px solid var(--border-subtle)',
            backgroundColor: '#020617',
            color: 'var(--text)',
            fontSize: '0.9rem',
            fontFamily: 'inherit',
            resize: 'vertical',
            marginBottom: 12
          }}
        />

        <button
          onClick={handleRefineDocumentation}
          disabled={isRefining || !refinementPrompt.trim()}
          style={{
            padding: '0.7rem 1rem',
            borderRadius: 999,
            border: 'none',
            backgroundColor: isRefining || !refinementPrompt.trim() ? 'rgba(75,85,99,0.7)' : 'var(--accent-strong)',
            color: '#fff',
            cursor: isRefining || !refinementPrompt.trim() ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            fontWeight: 500
          }}
        >
          {isRefining ? 'Refinando...' : 'Aplicar prompt e refinar'}
        </button>
      </section>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.3fr 2fr',
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
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>Exportar documentação</h2>
          <p style={{ marginTop: 0, marginBottom: 16, fontSize: '0.9rem', color: 'var(--text-soft)' }}>
            Baixe a documentação consolidada em diferentes formatos.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={() => exportAsMarkdown(finalDocumentation)}
              style={{
                padding: '0.6rem 0.75rem',
                borderRadius: 999,
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#020617',
                color: 'var(--text)',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Exportar como Markdown (.md)
            </button>
            <button
              onClick={() => exportAsPdf(finalDocumentation)}
              style={{
                padding: '0.6rem 0.75rem',
                borderRadius: 999,
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#020617',
                color: 'var(--text)',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Exportar como PDF (.pdf)
            </button>
            <button
              onClick={() => exportAsDocx(finalDocumentation)}
              style={{
                padding: '0.6rem 0.75rem',
                borderRadius: 999,
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#020617',
                color: 'var(--text)',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Exportar como DOCX (.docx)
            </button>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ marginTop: 0, marginBottom: 8 }}>Visualização da documentação</h2>
            <p style={{ marginTop: 0, marginBottom: 0, fontSize: '0.9rem', color: 'var(--text-soft)' }}>
              {viewMode === 'markdown' ? 'Conteúdo renderizado em Markdown' : 'Código-fonte em Markdown'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setViewMode('markdown')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 8,
                border: '1px solid var(--border-subtle)',
                backgroundColor: viewMode === 'markdown' ? 'var(--accent-strong)' : '#020617',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: viewMode === 'markdown' ? 600 : 400
              }}
            >
              Markdown
            </button>
            <button
              onClick={() => setViewMode('raw')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 8,
                border: '1px solid var(--border-subtle)',
                backgroundColor: viewMode === 'raw' ? 'var(--accent-strong)' : '#020617',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: viewMode === 'raw' ? 600 : 400
              }}
            >
              Código
            </button>
          </div>
        </div>

        <div
          style={{
            maxHeight: '60vh',
            overflow: 'auto',
            borderRadius: 8,
            border: '1px solid var(--border-subtle)',
            padding: '0.75rem',
            backgroundColor: '#020617'
          }}
        >
          {viewMode === 'markdown' ? (
            <div
              style={{
                fontSize: '0.95rem',
                lineHeight: 1.6,
                color: 'var(--text)'
              }}
            >
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 style={{ marginTop: 20, marginBottom: 12, fontSize: '1.8rem' }} {...props} />,
                  h2: ({node, ...props}) => <h2 style={{ marginTop: 16, marginBottom: 10, fontSize: '1.4rem' }} {...props} />,
                  h3: ({node, ...props}) => <h3 style={{ marginTop: 12, marginBottom: 8, fontSize: '1.2rem' }} {...props} />,
                  p: ({node, ...props}) => <p style={{ marginBottom: 12 }} {...props} />,
                  ul: ({node, ...props}) => <ul style={{ marginBottom: 12, paddingLeft: '1.5rem' }} {...props} />,
                  ol: ({node, ...props}) => <ol style={{ marginBottom: 12, paddingLeft: '1.5rem' }} {...props} />,
                  li: ({node, ...props}) => <li style={{ marginBottom: 4 }} {...props} />,
                  code: ({node, ...props}) => (
                    <code
                      style={{
                        backgroundColor: 'rgba(75, 85, 99, 0.3)',
                        padding: '0.2rem 0.4rem',
                        borderRadius: 4,
                        fontFamily: 'monospace',
                        fontSize: '0.9em'
                      }}
                      {...props}
                    />
                  ),
                  pre: ({node, ...props}) => (
                    <pre
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        padding: '1rem',
                        borderRadius: 8,
                        overflow: 'auto',
                        marginBottom: 12,
                        border: '1px solid rgba(75, 85, 99, 0.2)'
                      }}
                      {...props}
                    />
                  ),
                  blockquote: ({node, ...props}) => (
                    <blockquote
                      style={{
                        borderLeft: '3px solid var(--accent-strong)',
                        paddingLeft: 12,
                        marginLeft: 0,
                        marginBottom: 12,
                        color: 'var(--text-soft)',
                        fontStyle: 'italic'
                      }}
                      {...props}
                    />
                  ),
                  table: ({node, ...props}) => (
                    <table
                      style={{
                        borderCollapse: 'collapse',
                        width: '100%',
                        marginBottom: 12
                      }}
                      {...props}
                    />
                  ),
                  th: ({node, ...props}) => (
                    <th
                      style={{
                        border: '1px solid var(--border-subtle)',
                        padding: '8px',
                        backgroundColor: 'rgba(75, 85, 99, 0.2)',
                        textAlign: 'left'
                      }}
                      {...props}
                    />
                  ),
                  td: ({node, ...props}) => (
                    <td
                      style={{
                        border: '1px solid var(--border-subtle)',
                        padding: '8px'
                      }}
                      {...props}
                    />
                  ),
                  a: ({node, ...props}) => (
                    <a
                      style={{
                        color: 'var(--accent-strong)',
                        textDecoration: 'none'
                      }}
                      {...props}
                    />
                  ),
                }}
              >
                {finalDocumentation.contentMarkdown}
              </ReactMarkdown>
            </div>
          ) : (
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>
              {finalDocumentation.contentMarkdown}
            </pre>
          )}
        </div>
      </section>
      </div>
    </div>
  );
};
