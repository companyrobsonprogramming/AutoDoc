export type PackageStatus = 'pending' | 'processing' | 'completed' | 'error';

export interface LocalFileInfo {
  id: string;
  path: string;
  file: File;
  size: number;
  content?: string;
}

export interface PackageInput {
  id: string;
  index: number;
  files: LocalFileInfo[];
  totalSizeBytes: number;
  status: PackageStatus;
  aiResult?: string;
  backendPackageId?: number;
}

export interface Prompt {
  id: number;
  name: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProcessingSession {
  id: number;
  name: string;
  repositoryName: string;
  createdAt: string;
  totalPackages: number;
  status: 'pending' | 'processing' | 'completed';
}

export interface FinalDocumentation {
  id: number;
  sessionId: number;
  contentMarkdown: string;
  createdAt: string;
}

export interface GeminiApiKey {
  id: number;
  key: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface IgnoreRule {
  id: number;
  pattern: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateSessionRequest {
  name: string;
  repositoryName: string;
  totalPackages: number;
  promptId: number;
}

export interface CreatePackageRequest {
  sessionId: number;
  index: number;
  totalSizeBytes: number;
}

export interface CreateAiResultRequest {
  packageId: number;
  content: string;
  rawJson?: string;
}
