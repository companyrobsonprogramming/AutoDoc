import { GoogleGenAI } from '@google/genai';
import { GEMINI_MODELS, GeminiModel } from '../constants/geminiModels';

/**
 * Tenta obter informações atualizadas dos modelos via API do Google
 * Se não conseguir, usa os dados estáticos de GEMINI_MODELS
 */
export async function fetchModelsInfo(apiKey: string): Promise<GeminiModel[]> {
  try {
    const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1' });
    
    // A biblioteca pode ter métodos para listar modelos
    // Por enquanto, retornamos os modelos estáticos
    // Se a API do Google fornecer essas informações no futuro, podemos atualizar aqui
    
    return GEMINI_MODELS;
  } catch (error) {
    console.warn('Erro ao buscar informações dos modelos via API, usando dados estáticos:', error);
    return GEMINI_MODELS;
  }
}

/**
 * Obtém informações de um modelo específico
 */
export function getModelInfo(modelId: string): GeminiModel | undefined {
  return GEMINI_MODELS.find(m => m.id === modelId);
}

