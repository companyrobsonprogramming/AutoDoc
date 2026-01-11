import axios, { AxiosError } from 'axios';
import {
    CreateAiResultRequest,
    CreatePackageRequest,
    CreateSessionRequest,
    FinalDocumentation,
    GeminiApiKey,
    IgnoreRule,
    ProcessingSession,
    Prompt
} from '../types/domain';

const api = axios.create({
  baseURL: 'https://localhost:5000/api',
  timeout: 300000 // 5 minutos para requisições grandes (refinamento de documentação, etc)
});

// Interceptor para tratamento de erros HTTP
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Timeout na requisição:', error.config?.url);
      throw new Error('A requisição demorou muito para responder. Verifique se o backend está rodando.');
    }
    
    if (error.code === 'ERR_NETWORK' || !error.response) {
      console.error('Erro de rede:', error.message);
      throw new Error('Não foi possível conectar ao backend. Verifique se o servidor está rodando em ' + api.defaults.baseURL);
    }

    const status = error.response?.status;
    const message = (error.response?.data as any)?.message || error.message;

    if (status === 404) {
      throw new Error('Recurso não encontrado no backend.');
    } else if (status === 500) {
      throw new Error('Erro interno do servidor: ' + message);
    } else if (status === 400) {
      throw new Error('Dados inválidos: ' + message);
    }

    throw new Error(`Erro HTTP ${status}: ${message}`);
  }
);

// PROMPTS

export const fetchPrompts = async (): Promise<Prompt[]> => {
  const response = await api.get<Prompt[]>('/prompts');
  return response.data;
};

export const createPrompt = async (data: { name: string; content: string }): Promise<Prompt> => {
  const response = await api.post<Prompt>('/prompts', data);
  return response.data;
};

export const updatePrompt = async (id: number, data: { name: string; content: string }): Promise<Prompt> => {
  await api.put(`/prompts/${id}`, data);
  // Após atualizar, buscar o prompt atualizado
  const response = await api.get<Prompt>(`/prompts/${id}`);
  return response.data;
};

export const deletePrompt = async (id: number): Promise<void> => {
  await api.delete(`/prompts/${id}`);
};

// SESSÕES / PACOTES / RESULTADOS

export const fetchSessions = async (): Promise<ProcessingSession[]> => {
  const response = await api.get<ProcessingSession[]>('/sessions');
  return response.data;
};

export const getSessionById = async (id: number): Promise<ProcessingSession> => {
  const response = await api.get<ProcessingSession>(`/sessions/${id}`);
  return response.data;
};

export const updateSessionName = async (id: number, name: string): Promise<void> => {
  await api.put(`/sessions/${id}/name`, { name });
};

export const deleteSession = async (id: number): Promise<void> => {
  await api.delete(`/sessions/${id}`);
};

export const createSession = async (data: CreateSessionRequest): Promise<ProcessingSession> => {
  const response = await api.post<ProcessingSession>('/sessions', data);
  return response.data;
};

export const createPackageBackend = async (data: CreatePackageRequest): Promise<{ id: number }> => {
  const response = await api.post<{ id: number }>('/packages', data);
  return response.data;
};

export const createAiResultBackend = async (data: CreateAiResultRequest): Promise<{ id: number }> => {
  const response = await api.post<{ id: number }>('/airesults', data);
  return response.data;
};

export const consolidateDocumentation = async (sessionId: number): Promise<FinalDocumentation> => {
  const response = await api.post<FinalDocumentation>(`/documentations/${sessionId}/consolidate`);
  return response.data;
};

export const getFinalDocumentation = async (sessionId: number): Promise<FinalDocumentation> => {
  const response = await api.get<FinalDocumentation>(`/documentations/${sessionId}`);
  return response.data;
};

export const updateDocumentationContent = async (sessionId: number, content: string): Promise<FinalDocumentation> => {
  const response = await api.put<FinalDocumentation>(`/documentations/${sessionId}/content`, { content });
  return response.data;
};

// Settings - Gemini API key
export const fetchGeminiKeys = async (): Promise<GeminiApiKey[]> => {
  const response = await api.get<GeminiApiKey[]>('/settings/gemini-keys');
  return response.data;
};

export const fetchActiveGeminiKey = async (): Promise<GeminiApiKey | null> => {
  const response = await api.get<GeminiApiKey>('/settings/gemini-keys/active', {
    validateStatus: (status) => status === 200 || status === 404
  });
  return response.status === 200 ? response.data : null;
};

export const createGeminiKey = async (data: { key: string; description?: string; isActive?: boolean }): Promise<GeminiApiKey> => {
  const response = await api.post<GeminiApiKey>('/settings/gemini-keys', data);
  return response.data;
};

export const updateGeminiKey = async (id: number, data: { key: string; description?: string; isActive?: boolean }): Promise<GeminiApiKey> => {
  const response = await api.put<GeminiApiKey>(`/settings/gemini-keys/${id}`, data);
  return response.data;
};

export const deleteGeminiKey = async (id: number): Promise<void> => {
  await api.delete(`/settings/gemini-keys/${id}`);
};

// Settings - Ignore rules
export const fetchIgnoreRules = async (): Promise<IgnoreRule[]> => {
  const response = await api.get<IgnoreRule[]>('/settings/ignore-rules');
  return response.data;
};

export const createIgnoreRule = async (data: { pattern: string; description?: string; isActive?: boolean }): Promise<IgnoreRule> => {
  const response = await api.post<IgnoreRule>('/settings/ignore-rules', data);
  return response.data;
};

export const updateIgnoreRule = async (id: number, data: { pattern: string; description?: string; isActive?: boolean }): Promise<IgnoreRule> => {
  const response = await api.put<IgnoreRule>(`/settings/ignore-rules/${id}`, data);
  return response.data;
};

export const deleteIgnoreRule = async (id: number): Promise<void> => {
  await api.delete(`/settings/ignore-rules/${id}`);
};
