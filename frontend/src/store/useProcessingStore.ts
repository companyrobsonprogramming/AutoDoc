import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { FinalDocumentation, IgnoreRule, LocalFileInfo, PackageInput, PackageStatus, ProcessingSession, Prompt } from '../types/domain';

interface ProcessingState {
  selectedFiles: LocalFileInfo[];
  packages: PackageInput[];
  selectedPrompt?: Prompt;
  prompts: Prompt[];
  currentSession?: ProcessingSession;
  finalDocumentation?: FinalDocumentation;
  isProcessing: boolean;
  currentPackageIndex?: number;
  error?: string;
  activeGeminiKey?: string;
  ignoreRules: IgnoreRule[];
  temperature?: number;
  selectedModel?: string;
  shouldStopProcessing: boolean;

  setSelectedFiles: (files: LocalFileInfo[]) => void;
  setPackages: (packages: PackageInput[]) => void;

  setPrompts: (prompts: Prompt[]) => void;
  setSelectedPrompt: (prompt: Prompt | undefined) => void;

  setSession: (session: ProcessingSession | undefined) => void;

  updatePackageStatus: (id: string, status: PackageInput['status']) => void;
  setPackageAiResult: (id: string, aiResult: string, backendPackageId?: number) => void;

  setIsProcessing: (value: boolean) => void;
  setCurrentPackageIndex: (index: number | undefined) => void;

  setFinalDocumentation: (doc: FinalDocumentation | undefined) => void;
  setError: (message: string | undefined) => void;
  setActiveGeminiKey: (value: string | undefined) => void;
  setIgnoreRules: (rules: IgnoreRule[]) => void;
  setTemperature: (value: number | undefined) => void;
  setSelectedModel: (model: string | undefined) => void;
  setShouldStopProcessing: (value: boolean) => void;
  resetFailedPackages: () => void;
  resetAllPackages: () => void;
  reset: () => void;
}

export const useProcessingStore = create<ProcessingState>()(
  devtools((set) => ({
    selectedFiles: [],
    packages: [],
    prompts: [],
    isProcessing: false,
    ignoreRules: [],
    shouldStopProcessing: false,

    setSelectedFiles: (files) => set({ selectedFiles: files }),
    setPackages: (packages) => set({ packages }),

    setPrompts: (prompts) => set({ prompts }),
    setSelectedPrompt: (prompt) => set({ selectedPrompt: prompt }),

    setSession: (session) => set({ currentSession: session }),

    updatePackageStatus: (id, status) =>
      set((state) => ({
        packages: state.packages.map((p) => (p.id === id ? { ...p, status } : p))
      })),

    setPackageAiResult: (id, aiResult, backendPackageId) =>
      set((state) => ({
        packages: state.packages.map((p) =>
          p.id === id
            ? { ...p, aiResult, status: 'completed', backendPackageId: backendPackageId ?? p.backendPackageId }
            : p
        )
      })),

    setIsProcessing: (value) => set({ isProcessing: value }),
    setCurrentPackageIndex: (index) => set({ currentPackageIndex: index }),

    setFinalDocumentation: (doc) => set({ finalDocumentation: doc }),
    setError: (message) => set({ error: message }),
    setActiveGeminiKey: (value) => set({ activeGeminiKey: value }),
    setIgnoreRules: (rules) => set({ ignoreRules: rules }),
    setTemperature: (value) => set({ temperature: value }),
    setSelectedModel: (model) => set({ selectedModel: model }),
    setShouldStopProcessing: (value) => set({ shouldStopProcessing: value }),

    resetFailedPackages: () =>
      set((state) => ({
        packages: state.packages.map((p) =>
          p.status === 'error' ? { ...p, status: 'pending' as PackageStatus, aiResult: undefined } : p
        ),
        error: undefined
      })),

    resetAllPackages: () =>
      set((state) => ({
        packages: state.packages.map((p) => ({
          ...p,
          status: 'pending' as PackageStatus,
          aiResult: undefined
        })),
        error: undefined
      })),

    reset: () =>
      set({
        selectedFiles: [],
        packages: [],
        selectedPrompt: undefined,
        prompts: [],
        currentSession: undefined,
        finalDocumentation: undefined,
        isProcessing: false,
        currentPackageIndex: undefined,
        error: undefined,
        activeGeminiKey: undefined,
        ignoreRules: [],
        temperature: undefined,
        selectedModel: undefined,
        shouldStopProcessing: false
      })
  }))
);
