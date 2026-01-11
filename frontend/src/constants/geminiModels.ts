export interface GeminiModel {
  id: string;
  name: string;
  category: string;
}

export const GEMINI_MODELS: GeminiModel[] = [
  {
    id: 'gemini-2.5-flash',
    name: 'gemini-2.5-flash',
    category: 'Modelos de saída de texto'

  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'gemini-2.5-flash-lite',
    category: 'Modelos de saída de texto'

  },
  {
    id: 'gemini-2.5-flash-tts',
    name: 'gemini-2.5-flash-tts',
    category: 'Modelos generativos multimodais'

  },
  {
    id: 'gemini-3-flash',
    name: 'gemini-3-flash',
    category: 'Modelos de saída de texto',

  },
  {
    id: 'gemini-robotics-er-1.5-preview',
    name: 'gemini-robotics-er-1.5-preview',
    category: 'Outros modelos'
  },
  {
    id: 'gemma-3-12b',
    name: 'gemma-3-12b',
    category: 'Outros modelos'
  },
  {
    id: 'gemma-3-1b',
    name: 'gemma-3-1b',
    category: 'Outros modelos'
  },
  {
    id: 'gemma-3-27b',
    name: 'gemma-3-27b',
    category: 'Outros modelos'
  },
  {
    id: 'gemma-3-2b',
    name: 'gemma-3-2b',
    category: 'Outros modelos'
  },
  {
    id: 'gemma-3-4b',
    name: 'gemma-3-4b',
    category: 'Outros modelos'
  },
  {
    id: 'gemini-2.5-flash-native-audio-dialog',
    name: 'gemini-2.5-flash-native-audio-dialog',
    category: 'API Live',


  }
];

// Modelo padrão recomendado
export const DEFAULT_MODEL = 'gemini-2.5-flash';

