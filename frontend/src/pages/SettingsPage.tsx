import React, { useEffect, useState } from 'react';
import {
    createGeminiKey,
    createIgnoreRule,
    deleteGeminiKey,
    deleteIgnoreRule,
    fetchGeminiKeys,
    fetchIgnoreRules,
    updateGeminiKey,
    updateIgnoreRule
} from '../services/apiClient';
import { useProcessingStore } from '../store/useProcessingStore';
import { GeminiApiKey, IgnoreRule } from '../types/domain';

export const SettingsPage: React.FC = () => {
  const { setIgnoreRules, setActiveGeminiKey } = useProcessingStore();

  const [geminiKeys, setGeminiKeys] = useState<GeminiApiKey[]>([]);
  const [ignoreRules, setIgnoreRulesState] = useState<IgnoreRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const [editingKeyId, setEditingKeyId] = useState<number | null>(null);
  const [keyValue, setKeyValue] = useState('');
  const [keyDescription, setKeyDescription] = useState('');
  const [keyIsActive, setKeyIsActive] = useState(true);

  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
  const [rulePattern, setRulePattern] = useState('');
  const [ruleDescription, setRuleDescription] = useState('');
  const [ruleIsActive, setRuleIsActive] = useState(true);

  const loadData = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const [keys, rules] = await Promise.all([fetchGeminiKeys(), fetchIgnoreRules()]);
      setGeminiKeys(keys);
      setIgnoreRulesState(rules);

      const activeKey = keys.find((k) => k.isActive);
      setActiveGeminiKey(activeKey?.key);
      setIgnoreRules(rules);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar configurações.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setActiveGeminiKey, setIgnoreRules]);

  const resetKeyForm = () => {
    setEditingKeyId(null);
    setKeyValue('');
    setKeyDescription('');
    setKeyIsActive(true);
  };

  const resetRuleForm = () => {
    setEditingRuleId(null);
    setRulePattern('');
    setRuleDescription('');
    setRuleIsActive(true);
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyValue) return;
    setLoading(true);
    try {
      if (editingKeyId) {
        await updateGeminiKey(editingKeyId, { key: keyValue, description: keyDescription, isActive: keyIsActive });
      } else {
        await createGeminiKey({ key: keyValue, description: keyDescription, isActive: keyIsActive });
      }
      resetKeyForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar chave do Gemini.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditKey = (key: GeminiApiKey) => {
    setEditingKeyId(key.id);
    setKeyValue(key.key);
    setKeyDescription(key.description ?? '');
    setKeyIsActive(key.isActive);
  };

  const handleDeleteKey = async (id: number) => {
    setLoading(true);
    try {
      await deleteGeminiKey(id);
      if (editingKeyId === id) resetKeyForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover chave do Gemini.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rulePattern) return;
    setLoading(true);
    try {
      if (editingRuleId) {
        await updateIgnoreRule(editingRuleId, { pattern: rulePattern, description: ruleDescription, isActive: ruleIsActive });
      } else {
        await createIgnoreRule({ pattern: rulePattern, description: ruleDescription, isActive: ruleIsActive });
      }
      resetRuleForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar regra de ignore.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRule = (rule: IgnoreRule) => {
    setEditingRuleId(rule.id);
    setRulePattern(rule.pattern);
    setRuleDescription(rule.description ?? '');
    setRuleIsActive(rule.isActive);
  };

  const handleDeleteRule = async (id: number) => {
    setLoading(true);
    try {
      await deleteIgnoreRule(id);
      if (editingRuleId === id) resetRuleForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover regra de ignore.');
    } finally {
      setLoading(false);
    }
  };

  const activeKey = geminiKeys.find((k) => k.isActive);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
      <div
        style={{
          padding: '1.25rem',
          borderRadius: 12,
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Chave do Gemini</h2>
          {loading && <span style={{ fontSize: '0.85rem', color: 'var(--text-soft)' }}>Salvando...</span>}
        </div>
        <p style={{ marginTop: 8, color: 'var(--text-soft)', fontSize: '0.9rem' }}>
          Salve uma chave do Gemini (app-wide). Ao marcar como ativa, as demais serão desativadas.
        </p>

        <form onSubmit={handleSaveKey} style={{ display: 'grid', gap: '0.75rem', marginTop: 12 }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-soft)' }}>
            Chave
            <input
              type="text"
              value={keyValue}
              onChange={(e) => setKeyValue(e.target.value)}
              placeholder="AIza..."
              style={{
                width: '100%',
                marginTop: 4,
                padding: '0.55rem 0.75rem',
                borderRadius: 8,
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#020617',
                color: 'var(--text)'
              }}
            />
          </label>

          <label style={{ fontSize: '0.85rem', color: 'var(--text-soft)' }}>
            Descrição (opcional)
            <input
              type="text"
              value={keyDescription}
              onChange={(e) => setKeyDescription(e.target.value)}
              style={{
                width: '100%',
                marginTop: 4,
                padding: '0.55rem 0.75rem',
                borderRadius: 8,
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#020617',
                color: 'var(--text)'
              }}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}>
            <input type="checkbox" checked={keyIsActive} onChange={(e) => setKeyIsActive(e.target.checked)} />
            Definir como ativa
          </label>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="submit"
              disabled={!keyValue}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: 10,
                border: 'none',
                backgroundColor: 'var(--accent-strong)',
                color: '#fff',
                cursor: keyValue ? 'pointer' : 'not-allowed'
              }}
            >
              {editingKeyId ? 'Atualizar chave' : 'Salvar chave'}
            </button>
            {editingKeyId && (
              <button
                type="button"
                onClick={resetKeyForm}
                style={{
                  padding: '0.65rem 1rem',
                  borderRadius: 10,
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: '#020617',
                  color: 'var(--text)',
                  cursor: 'pointer'
                }}
              >
                Cancelar edição
              </button>
            )}
          </div>
        </form>

        <div style={{ marginTop: 16, fontSize: '0.9rem' }}>
          <div style={{ color: 'var(--text-soft)' }}>Chave ativa:</div>
          <div style={{ marginTop: 4, fontWeight: 600 }}>
            {activeKey ? activeKey.key : 'Nenhuma chave ativa'}
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <h3 style={{ margin: '12px 0 6px' }}>Todas as chaves</h3>
          <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, overflow: 'hidden' }}>
            {geminiKeys.length === 0 && (
              <div style={{ padding: '0.75rem', color: 'var(--text-soft)', fontSize: '0.9rem' }}>Nenhuma chave cadastrada.</div>
            )}
            {geminiKeys.map((k) => (
              <div
                key={k.id}
                style={{
                  padding: '0.75rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{k.key}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-soft)' }}>
                    {k.description || 'Sem descrição'} • {k.isActive ? 'Ativa' : 'Inativa'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => handleEditKey(k)}
                    style={{
                      padding: '0.4rem 0.75rem',
                      borderRadius: 8,
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: '#020617',
                      color: 'var(--text)',
                      cursor: 'pointer'
                    }}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteKey(k.id)}
                    style={{
                      padding: '0.4rem 0.75rem',
                      borderRadius: 8,
                      border: '1px solid rgba(220,38,38,0.4)',
                      backgroundColor: 'rgba(220,38,38,0.1)',
                      color: '#ef4444',
                      cursor: 'pointer'
                    }}
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          padding: '1.25rem',
          borderRadius: 12,
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <h2 style={{ margin: 0 }}>Regras de ignore</h2>
        <p style={{ marginTop: 8, color: 'var(--text-soft)', fontSize: '0.9rem' }}>
          Defina padrões para ignorar arquivos sensíveis (ex.: appsettings*, *.env, *secrets*). Padrões sem * fazem match parcial.
        </p>

        <form onSubmit={handleSaveRule} style={{ display: 'grid', gap: '0.75rem', marginTop: 12 }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-soft)' }}>
            Padrão
            <input
              type="text"
              value={rulePattern}
              onChange={(e) => setRulePattern(e.target.value)}
              placeholder="*.env, appsettings*"
              style={{
                width: '100%',
                marginTop: 4,
                padding: '0.55rem 0.75rem',
                borderRadius: 8,
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#020617',
                color: 'var(--text)'
              }}
            />
          </label>

          <label style={{ fontSize: '0.85rem', color: 'var(--text-soft)' }}>
            Descrição (opcional)
            <input
              type="text"
              value={ruleDescription}
              onChange={(e) => setRuleDescription(e.target.value)}
              style={{
                width: '100%',
                marginTop: 4,
                padding: '0.55rem 0.75rem',
                borderRadius: 8,
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#020617',
                color: 'var(--text)'
              }}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}>
            <input type="checkbox" checked={ruleIsActive} onChange={(e) => setRuleIsActive(e.target.checked)} />
            Regra ativa
          </label>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="submit"
              disabled={!rulePattern}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: 10,
                border: 'none',
                backgroundColor: 'var(--accent-strong)',
                color: '#fff',
                cursor: rulePattern ? 'pointer' : 'not-allowed'
              }}
            >
              {editingRuleId ? 'Atualizar regra' : 'Salvar regra'}
            </button>
            {editingRuleId && (
              <button
                type="button"
                onClick={resetRuleForm}
                style={{
                  padding: '0.65rem 1rem',
                  borderRadius: 10,
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: '#020617',
                  color: 'var(--text)',
                  cursor: 'pointer'
                }}
              >
                Cancelar edição
              </button>
            )}
          </div>
        </form>

        <div style={{ marginTop: 16 }}>
          <h3 style={{ margin: '12px 0 6px' }}>Regras configuradas</h3>
          <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, overflow: 'hidden' }}>
            {ignoreRules.length === 0 && (
              <div style={{ padding: '0.75rem', color: 'var(--text-soft)', fontSize: '0.9rem' }}>Nenhuma regra cadastrada.</div>
            )}
            {ignoreRules.map((rule) => (
              <div
                key={rule.id}
                style={{
                  padding: '0.75rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{rule.pattern}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-soft)' }}>
                    {rule.description || 'Sem descrição'} • {rule.isActive ? 'Ativa' : 'Inativa'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => handleEditRule(rule)}
                    style={{
                      padding: '0.4rem 0.75rem',
                      borderRadius: 8,
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: '#020617',
                      color: 'var(--text)',
                      cursor: 'pointer'
                    }}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteRule(rule.id)}
                    style={{
                      padding: '0.4rem 0.75rem',
                      borderRadius: 8,
                      border: '1px solid rgba(220,38,38,0.4)',
                      backgroundColor: 'rgba(220,38,38,0.1)',
                      color: '#ef4444',
                      cursor: 'pointer'
                    }}
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '0.9rem 1rem',
            borderRadius: 10,
            border: '1px solid rgba(248,113,113,0.5)',
            backgroundColor: 'rgba(248,113,113,0.08)',
            color: '#fecaca'
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};
