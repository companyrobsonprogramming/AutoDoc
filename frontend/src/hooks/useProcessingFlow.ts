import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    consolidateDocumentation,
    createAiResultBackend,
    createPackageBackend,
    createSession,
    fetchActiveGeminiKey,
    getFinalDocumentation
} from '../services/apiClient';
import { callGeminiForPackage } from '../services/geminiService';
import { buildPackages } from '../services/packagingService';
import { useProcessingStore } from '../store/useProcessingStore';

export const useProcessingFlow = () => {
  const {
    selectedFiles,
    selectedPrompt,
    setPackages,
    packages,
    setIsProcessing,
    setCurrentPackageIndex,
    updatePackageStatus,
    setPackageAiResult,
    setSession,
    setFinalDocumentation,
    setError,
    activeGeminiKey,
    setActiveGeminiKey,
    resetFailedPackages,
    resetAllPackages,
    temperature,
    selectedModel,
    shouldStopProcessing,
    setShouldStopProcessing
  } = useProcessingStore();

  const navigate = useNavigate();

  const preparePackagesAndSession = useCallback(
    async (options?: { maxFilesPerPackage?: number; maxBytesPerPackage?: number }) => {
      if (!selectedFiles.length) {
        throw new Error('Nenhum arquivo selecionado.');
      }

      if (!selectedPrompt) {
        throw new Error('Nenhum prompt selecionado.');
      }

      const pkgs = buildPackages(selectedFiles, options ?? {});
      setPackages(pkgs);

      const repoName = 'Repositório Local'; // poderia ser um campo de formulário
      const session = await createSession({
        name: `Sessão - ${new Date().toISOString()}`,
        repositoryName: repoName,
        totalPackages: pkgs.length,
        promptId: selectedPrompt.id
      });

      setSession(session);
      navigate('/processing');
    },
    [selectedFiles, selectedPrompt, setPackages, setSession, navigate]
  );

  const processPackages = useCallback(
    async (packagesToProcess: typeof packages) => {
      if (!packagesToProcess.length) {
        return;
      }

      if (!selectedPrompt) {
        throw new Error('Nenhum prompt selecionado.');
      }

      const currentSession = useProcessingStore.getState().currentSession;
      if (!currentSession) {
        throw new Error('Nenhuma sessão encontrada. Por favor, crie uma nova sessão.');
      }

      setIsProcessing(true);
      setError(undefined);
      setShouldStopProcessing(false);

      try {
        // Sempre buscar a chave ativa do banco (não usar cache)
        const remoteKey = await fetchActiveGeminiKey();
        if (!remoteKey?.isActive || !remoteKey.key) {
          throw new Error('Chave da API do Gemini não configurada. Cadastre em Configurações antes de iniciar.');
        }
        
        const geminiKey = remoteKey.key;
        // Atualizar o store com a chave atual para referência
        setActiveGeminiKey(geminiKey);

        for (const pkg of packagesToProcess) {
          // Verificar se o usuário pediu para parar
          if (useProcessingStore.getState().shouldStopProcessing) {
            console.log('Processamento interrompido pelo usuário');
            setError('Processamento interrompido pelo usuário.');
            break;
          }

          // Buscar o índice atualizado do pacote no store
          const currentPackages = useProcessingStore.getState().packages;
          const pkgIndex = currentPackages.findIndex((p) => p.id === pkg.id);
          if (pkgIndex === -1) continue;

          setCurrentPackageIndex(pkgIndex);
          updatePackageStatus(pkg.id, 'processing');

          try {
            // Se já tem backendPackageId, usar ele, caso contrário criar novo
            let backendPkgId: number;
            if (pkg.backendPackageId) {
              backendPkgId = pkg.backendPackageId;
            } else {
              const backendPkg = await createPackageBackend({
                sessionId: currentSession.id,
                index: pkg.index,
                totalSizeBytes: pkg.totalSizeBytes
              });
              backendPkgId = backendPkg.id;
            }

            // Chamar Gemini com temperatura e modelo configurados
            const geminiResult = await callGeminiForPackage(
              geminiKey,
              selectedPrompt.content,
              pkg.files,
              temperature,
              selectedModel
            );

            // Enviar resultado parcial ao backend
            const aiResult = await createAiResultBackend({
              packageId: backendPkgId,
              content: geminiResult.text,
              rawJson: geminiResult.rawJson
            });

            setPackageAiResult(pkg.id, geminiResult.text, backendPkgId);
            updatePackageStatus(pkg.id, 'completed');
          } catch (err) {
            console.error(`Erro ao processar pacote #${pkg.index}:`, err);
            
            // Extrair mensagem de erro mais amigável
            let errorMessage = 'Erro desconhecido';
            if (err instanceof Error) {
              errorMessage = err.message;
            } else if (typeof err === 'string') {
              errorMessage = err;
            } else if (err && typeof err === 'object' && 'message' in err) {
              errorMessage = String((err as any).message);
            }

            updatePackageStatus(pkg.id, 'error');
            setError(`Erro ao processar pacote #${pkg.index}: ${errorMessage}`);
          }
        }

        // Consolidar documentação final se todos os pacotes foram concluídos
        const currentPackagesState = useProcessingStore.getState().packages;
        const allCompleted = currentPackagesState.every((p) => p.status === 'completed');
        if (allCompleted && currentSession) {
          await consolidateDocumentation(currentSession.id);
          const doc = await getFinalDocumentation(currentSession.id);
          setFinalDocumentation(doc);
          navigate('/documentation');
        }
      } finally {
        setIsProcessing(false);
        setCurrentPackageIndex(undefined);
        setShouldStopProcessing(false);
      }
    },
    [
      selectedPrompt,
      setIsProcessing,
      setCurrentPackageIndex,
      updatePackageStatus,
      setPackageAiResult,
      setFinalDocumentation,
      navigate,
      setError,
      activeGeminiKey,
      setActiveGeminiKey,
      temperature,
      selectedModel,
      shouldStopProcessing,
      setShouldStopProcessing
    ]
  );

  const processAllPackages = useCallback(async () => {
    if (!packages.length) {
      throw new Error('Nenhum pacote disponível para processamento.');
    }
    
    // Processa apenas pacotes pendentes ou com erro, sem tocar nos que já foram completados
    const packagesToProcess = packages.filter((p) => p.status === 'pending' || p.status === 'error');
    
    if (packagesToProcess.length === 0) {
      throw new Error('Todos os pacotes já foram processados com sucesso.');
    }

    // Resetar apenas os pacotes com erro para pending
    packagesToProcess.forEach((pkg) => {
      if (pkg.status === 'error') {
        updatePackageStatus(pkg.id, 'pending');
      }
    });

    // Aguardar um pouco para garantir que o estado foi atualizado
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    // Pegar os pacotes atualizados do store
    const updatedPackages = useProcessingStore.getState().packages.filter((p) => 
      packagesToProcess.some((cp) => cp.id === p.id)
    );
    
    await processPackages(updatedPackages);
  }, [packages, updatePackageStatus, processPackages]);

  const retryFailedPackages = useCallback(async () => {
    const failedPackages = packages.filter((p) => p.status === 'error');
    if (failedPackages.length === 0) {
      return;
    }

    resetFailedPackages();
    // Aguardar um pouco para garantir que o estado foi atualizado
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    // Pegar os pacotes que estavam com erro (agora resetados para pending)
    const updatedPackages = useProcessingStore.getState().packages.filter((p) => 
      failedPackages.some((fp) => fp.id === p.id)
    );
    
    await processPackages(updatedPackages);
  }, [packages, resetFailedPackages, processPackages]);

  const retryAllPackages = useCallback(async () => {
    if (packages.length === 0) {
      return;
    }

    resetAllPackages();
    // Aguardar um pouco para garantir que o estado foi atualizado
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    const updatedPackages = useProcessingStore.getState().packages;
    await processPackages(updatedPackages);
  }, [packages, resetAllPackages, processPackages]);

  return { preparePackagesAndSession, processAllPackages, retryFailedPackages, retryAllPackages };
};
