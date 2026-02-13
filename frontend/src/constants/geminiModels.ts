export interface GeminiModel {
  id: string;
  name: string;
  category: string;
}

export const GEMINI_MODELS: GeminiModel[] = [
  {
    id: "gemini-2.5-flash",
    name: "gemini-2.5-flash",
    category: "Modelos de saída de texto",
  },
  {
    id: "gemini-2.5-flash-lite",
    name: "gemini-2.5-flash-lite",
    category: "Modelos de saída de texto",
  },
  {
    id: "gemini-2.5-flash-tts",
    name: "gemini-2.5-flash-tts",
    category: "Modelos generativos multimodais",
  },
  {
    id: "gemini-3-flash",
    name: "gemini-3-flash",
    category: "Modelos de saída de texto",
  },
];

// Modelo padrão recomendado
export const DEFAULT_MODEL = "gemini-2.5-flash";
