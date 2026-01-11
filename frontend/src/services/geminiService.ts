import { GoogleGenAI } from '@google/genai';
import { LocalFileInfo } from '../types/domain';
import { DEFAULT_MODEL } from '../constants/geminiModels';
import { rateLimiter } from './rateLimiter';

export interface GeminiPackageResult {
  text: string;
  rawJson?: string;
}

/**
 * Função auxiliar para retry com backoff exponencial
 */
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error | unknown;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      
      // Não retry para erros que não devem ser tentados novamente
      if (err instanceof Error) {
        if (
          err.message.includes('API_KEY_INVALID') ||
          err.message.includes('API key') ||
          err.message.includes('QUOTA_EXCEEDED') ||
          err.message.includes('quota') ||
          err.message.includes('SAFETY') ||
          err.message.includes('safety')
        ) {
          throw err;
        }
      }
      
      // Se não for a última tentativa, aguarda antes de tentar novamente
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt); // Backoff exponencial: 1s, 2s, 4s
        console.warn(`Tentativa ${attempt + 1} falhou. Tentando novamente em ${delay}ms...`, err);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // Se todas as tentativas falharam, lança o último erro
  throw lastError;
};

export const callGeminiForPackage = async (
  apiKey: string,
  prompt: string,
  files: LocalFileInfo[],
  temperature?: number,
  modelName?: string
): Promise<GeminiPackageResult> => {
  console.log('callGeminiForPackage', apiKey);
  if (!apiKey) {
    throw new Error('Gemini não configurado (API key ausente). Cadastre a chave no backend.');
  }

  if (!files || files.length === 0) {
    throw new Error('Nenhum arquivo fornecido para processamento.');
  }

  // Validação da temperatura: deve estar entre 0.00 e 2.00
  if (temperature !== undefined) {
    if (temperature < 0.00 || temperature > 2.00) {
      throw new Error('Temperatura deve estar entre 0.00 e 2.00');
    }
  }

  return retryWithBackoff(async () => {
    try {
      const model = modelName || DEFAULT_MODEL;
      
      // Estimate token count (rough approximation: 1 token ≈ 4 characters)
      const promptText = prompt + files.map(f => f.content || '').join('\n');
      const estimatedTokens = Math.ceil(promptText.length / 4);

      // Wait for rate limit if necessary
      await rateLimiter.waitForRateLimit(model, estimatedTokens);

      const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1' });
      const filesDescription = files
        .map((f) => `### Arquivo: ${f.path}\n\n\`\`\`\n${f.content ?? ''}\n\`\`\``)
        .join('\n\n');

      const fullPrompt = `
Você é um assistente especializado em gerar documentação técnica de sistemas.

PROMPT DO USUÁRIO:
${prompt}

A seguir, você receberá um conjunto de arquivos de código (podem ser de linguagens diferentes).
Gere uma documentação parcial, bem estruturada, focando em:

- Visão geral do que esse conjunto de arquivos faz.
- Principais responsabilidades das classes/funções.
- Fluxos importantes.
- Pontos de integração com outros módulos.
- Observações relevantes para manutenção.

Retorne a resposta em Markdown.

ARQUIVOS:
${filesDescription}
`;

      const config: any = {};
      if (temperature !== undefined) {
        config.temperature = temperature;
      }

      const response = await ai.models.generateContent({
        model: model,
        contents: [
          {
            role: 'user',
            parts: [{ text: fullPrompt }]
          }
        ],
        config: Object.keys(config).length > 0 ? config : undefined
      });

      const text = response.text;
      if (!text || text.trim().length === 0) {
        throw new Error('A resposta do Gemini está vazia.');
      }

      // Estimate response tokens and record the request
      const responseTokens = Math.ceil(text.length / 4);
      const totalTokens = estimatedTokens + responseTokens;
      rateLimiter.recordRequest(model, totalTokens);

      return {
        text,
        rawJson: JSON.stringify(response, null, 2)
      };
    } catch (err) {
      if (err instanceof Error) {
        // Melhorar mensagens de erro específicas do Gemini
        if (err.message.includes('API_KEY_INVALID') || err.message.includes('API key')) {
          throw new Error('Chave da API do Gemini inválida. Verifique se a chave está correta no arquivo .env');
        }
        if (err.message.includes('QUOTA_EXCEEDED') || err.message.includes('quota')) {
          throw new Error('Cota da API do Gemini excedida. Verifique seu limite no Google AI Studio');
        }
        if (err.message.includes('SAFETY') || err.message.includes('safety')) {
          throw new Error('Conteúdo bloqueado pelos filtros de segurança do Gemini. Tente ajustar o prompt ou os arquivos.');
        }
        throw err;
      }
      throw new Error('Erro desconhecido ao chamar a API do Gemini: ' + String(err));
    }
  });
};

/**
 * Refina uma documentação existente aplicando um prompt adicional
 */
export const refineDocumentationWithPrompt = async (
  apiKey: string,
  currentDocumentation: string,
  additionalPrompt: string,
  temperature?: number,
  modelName?: string
): Promise<GeminiPackageResult> => {

  if (!apiKey) {
    throw new Error('Gemini não configurado (API key ausente). Cadastre a chave no backend.');
  }

  if (!currentDocumentation || currentDocumentation.trim().length === 0) {
    throw new Error('Documentação atual não fornecida.');
  }

  if (!additionalPrompt || additionalPrompt.trim().length === 0) {
    throw new Error('Prompt adicional não fornecido.');
  }

  // Validação da temperatura: deve estar entre 0.00 e 2.00
  if (temperature !== undefined) {
    if (temperature < 0.00 || temperature > 2.00) {
      throw new Error('Temperatura deve estar entre 0.00 e 2.00');
    }
  }

  return retryWithBackoff(async () => {
    try {
      const model = modelName || DEFAULT_MODEL;
      
      // Estimate token count (rough approximation: 1 token ≈ 4 characters)
      const promptText = currentDocumentation + additionalPrompt;
      const estimatedTokens = Math.ceil(promptText.length / 4);

      // Wait for rate limit if necessary
      await rateLimiter.waitForRateLimit(model, estimatedTokens);

      const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1' });

      const fullPrompt = `
Você é um assistente especializado em refinar e melhorar documentação técnica.

DOCUMENTAÇÃO ATUAL:
${currentDocumentation}

PROMPT ADICIONAL DO USUÁRIO:
${additionalPrompt}

Com base na documentação atual acima e seguindo as instruções do prompt adicional, gere uma nova versão refinada da documentação.
Mantenha o formato Markdown e todas as informações relevantes, mas adapte conforme as instruções fornecidas.

Retorne APENAS a documentação refinada em Markdown, sem explicações adicionais antes ou depois.
`;

      const config: any = {};
      if (temperature !== undefined) {
        config.temperature = temperature;
      }

      const response = await ai.models.generateContent({
        model: model,
        contents: [
          {
            role: 'user',
            parts: [{ text: fullPrompt }]
          }
        ],
        config: Object.keys(config).length > 0 ? config : undefined
      });

      const text = response.text;
      if (!text || text.trim().length === 0) {
        throw new Error('A resposta do Gemini está vazia.');
      }

      // Estimate response tokens and record the request
      const responseTokens = Math.ceil(text.length / 4);
      const totalTokens = estimatedTokens + responseTokens;
      rateLimiter.recordRequest(model, totalTokens);

      return {
        text,
        rawJson: JSON.stringify(response, null, 2)
      };
    } catch (err) {
      if (err instanceof Error) {
        // Melhorar mensagens de erro específicas do Gemini
        if (err.message.includes('API_KEY_INVALID') || err.message.includes('API key')) {
          throw new Error('Chave da API do Gemini inválida. Verifique se a chave está correta no arquivo .env');
        }
        if (err.message.includes('QUOTA_EXCEEDED') || err.message.includes('quota')) {
          throw new Error('Cota da API do Gemini excedida. Verifique seu limite no Google AI Studio');
        }
        if (err.message.includes('SAFETY') || err.message.includes('safety')) {
          throw new Error('Conteúdo bloqueado pelos filtros de segurança do Gemini. Tente ajustar o prompt ou os arquivos.');
        }
        throw err;
      }
      throw new Error('Erro desconhecido ao chamar a API do Gemini: ' + String(err));
    }
  });
};