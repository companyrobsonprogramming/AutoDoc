import React from 'react';
import { GEMINI_MODELS, DEFAULT_MODEL, GeminiModel } from '../../constants/geminiModels';
import { useProcessingStore } from '../../store/useProcessingStore';

export const ModelSelector: React.FC<{ disabled?: boolean }> = ({ disabled = false }) => {
  const { selectedModel, setSelectedModel } = useProcessingStore();

  // Agrupar modelos por categoria
  const modelsByCategory = GEMINI_MODELS.reduce((acc, model) => {
    if (!acc[model.category]) {
      acc[model.category] = [];
    }
    acc[model.category].push(model);
    return acc;
  }, {} as Record<string, GeminiModel[]>);

  const currentModel = selectedModel;
  const currentModelInfo = GEMINI_MODELS.find(m => m.id === currentModel);

  // Debug para validar as informações do modelo
  React.useEffect(() => {
    console.log('Modelo Selecionado:', currentModel);
    console.log('Informações do Modelo:', currentModelInfo);
  }, [currentModel, currentModelInfo]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div>
        <label
          htmlFor="model-select"
          style={{
            display: 'block',
            fontSize: '0.8rem',
            color: 'var(--text-soft)',
            marginBottom: 4
          }}
        >
          Modelo do Gemini
        </label>
        <select
          id="model-select"
          value={currentModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          disabled={disabled}
          style={{
            width: '100%',
            borderRadius: 999,
            padding: '0.4rem 0.75rem',
            border: '1px solid var(--border-subtle)',
            backgroundColor: '#020617',
            color: 'var(--text)',
            fontSize: '0.9rem',
            cursor: disabled ? 'not-allowed' : 'pointer'
          }}
        >
          {Object.entries(modelsByCategory).map(([category, models]) => (
            <optgroup key={category} label={category}>
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
    </div>
  );
};
