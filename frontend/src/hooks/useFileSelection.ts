import { useCallback } from 'react';
import { useProcessingStore } from '../store/useProcessingStore';
import { LocalFileInfo } from '../types/domain';

const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
const escapeRegex = (value: string) => value.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
const patternToRegex = (pattern: string) => {
  const normalized = pattern.includes('*') ? pattern : `*${pattern}*`;
  return new RegExp(`^${normalized.split('*').map(escapeRegex).join('.*')}$`, 'i');
};

export const useFileSelection = () => {
  const setSelectedFiles = useProcessingStore((s) => s.setSelectedFiles);
  const ignoreRules = useProcessingStore((s) => s.ignoreRules);

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList) return;

      const filesArray: LocalFileInfo[] = [];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList.item(i);
        if (!file) continue;

        const content = await file.text();

        filesArray.push({
          id: generateId(),
          path: file.webkitRelativePath || file.name,
          file,
          size: file.size,
          content
        });
      }

      const activeRules = ignoreRules.filter((r) => r.isActive);
      const matchers = activeRules.map((r) => patternToRegex(r.pattern));

      const filteredFiles =
        matchers.length > 0
          ? filesArray.filter((f) => !matchers.some((rx) => rx.test(f.path)))
          : filesArray;

      const ignoredCount = filesArray.length - filteredFiles.length;
      if (ignoredCount > 0) {
        console.info(`Ignorando ${ignoredCount} arquivo(s) conforme regras configuradas.`);
      }

      setSelectedFiles(filteredFiles);
    },
    [ignoreRules, setSelectedFiles]
  );

  return { handleFiles };
};
