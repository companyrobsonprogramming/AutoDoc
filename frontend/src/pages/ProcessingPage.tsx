import React, { useEffect } from 'react';
import { ProcessingStatus } from '../components/processing/ProcessingStatus';
import { ModelSelector } from '../components/model/ModelSelector';
import { useProcessingFlow } from '../hooks/useProcessingFlow';
import { useProcessingStore } from '../store/useProcessingStore';

export const ProcessingPage: React.FC = () => {
  const { packages, isProcessing, setError, temperature, setTemperature, setShouldStopProcessing } =
    useProcessingStore();
  const { processAllPackages, retryFailedPackages, retryAllPackages } =
    useProcessingFlow();

  const disabled = !packages.length || isProcessing;
  const failedCount = packages.filter((p) => p.status === "error").length;
  const pendingCount = packages.filter((p) => p.status === "pending").length;
  const completedCount = packages.filter((p) => p.status === "completed").length;
  const hasErrors = failedCount > 0;
  const hasPendingOrErrors = pendingCount > 0 || failedCount > 0;
  const hasCompleted = completedCount > 0;

  // Inicializar temperatura se não estiver definida
  useEffect(() => {
    if (temperature === undefined) {
      setTemperature(1.0);
    }
  }, []);

  const handleStartProcessing = async () => {
    try {
      await processAllPackages();
    } catch (err) {
      console.error("Erro ao iniciar processamento:", err);
      let errorMessage = "Erro desconhecido ao iniciar o processamento.";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }
      setError(errorMessage);
    }
  };

  const handleRetryFailed = async () => {
    try {
      await retryFailedPackages();
    } catch (err) {
      console.error("Erro ao reprocessar pacotes com erro:", err);
      let errorMessage = "Erro desconhecido ao reprocessar pacotes.";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }
      setError(errorMessage);
    }
  };

  const handleRetryAll = async () => {
    try {
      await retryAllPackages();
    } catch (err) {
      console.error("Erro ao reprocessar todos os pacotes:", err);
      let errorMessage = "Erro desconhecido ao reprocessar pacotes.";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }
      setError(errorMessage);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <section
        style={{
          padding: "1.25rem",
          borderRadius: 12,
          backgroundColor: "var(--bg-elevated)",
          border: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div style={{ fontSize: "0.9rem", color: "var(--text-soft)" }}>
            <div>
              Total de pacotes: <strong>{packages.length}</strong>
              {hasErrors && (
                <span
                  style={{ color: "rgba(248,113,113,1)", marginLeft: "0.5rem" }}
                >
                  ({failedCount} com erro)
                </span>
              )}
            </div>
            <div>
              {hasCompleted && hasPendingOrErrors 
                ? `Continue o processamento: ${pendingCount} pendente(s) e ${failedCount} erro(s). ${completedCount} já completado(s) serão preservados.`
                : hasCompleted
                ? `Todos os pacotes foram processados com sucesso (${completedCount}).`
                : "Clique em \"Iniciar processamento\" para enviar cada pacote à IA e salvar os resultados."
              }
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
            {!isProcessing && (hasErrors || hasPendingOrErrors || hasCompleted) && (
              <>
                {hasErrors && (
                  <button
                    type="button"
                    onClick={handleRetryFailed}
                    style={{
                      padding: "0.7rem 1rem",
                      borderRadius: 999,
                      border: "1px solid rgba(248,113,113,0.5)",
                      backgroundColor: "transparent",
                      color: "rgba(248,113,113,1)",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                    }}
                  >
                    Reprocessar erros ({failedCount})
                  </button>
                )}
                {hasCompleted && (
                  <button
                    type="button"
                    onClick={handleRetryAll}
                    style={{
                      padding: "0.7rem 1rem",
                      borderRadius: 999,
                      border: "1px solid var(--border-subtle)",
                      backgroundColor: "transparent",
                      color: "var(--text-primary)",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                    }}
                  >
                    Reprocessar todos
                  </button>
                )}
              </>
            )}
            {isProcessing && (
              <button
                type="button"
                onClick={() => setShouldStopProcessing(true)}
                style={{
                  padding: "0.7rem 1rem",
                  borderRadius: 999,
                  border: "1px solid rgba(248,113,113,0.5)",
                  backgroundColor: "transparent",
                  color: "rgba(248,113,113,1)",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                Parar processamento
              </button>
            )}
            <button
              type="button"
              disabled={disabled || (!hasPendingOrErrors && !hasCompleted)}
              onClick={handleStartProcessing}
              style={{
                padding: "0.7rem 1rem",
                borderRadius: 999,
                border: "none",
                backgroundColor: disabled || (!hasPendingOrErrors && !hasCompleted)
                  ? "rgba(75,85,99,0.7)"
                  : "var(--accent-strong)",
                color: "#fff",
                cursor: disabled || (!hasPendingOrErrors && !hasCompleted) ? "not-allowed" : "pointer",
                fontSize: "0.9rem",
              }}
            >
              {isProcessing 
                ? "Processando..." 
                : hasCompleted && hasPendingOrErrors
                ? "Continuar"
                : "Iniciar processamento"
              }
            </button>
          </div>
        </div>

        <div
          style={{
            padding: "0.75rem",
            borderRadius: 8,
            backgroundColor: "#020617",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <ModelSelector disabled={isProcessing} />
        </div>

        <div
          style={{
            padding: "0.75rem",
            borderRadius: 8,
            backgroundColor: "#020617",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <label
              htmlFor="temperature-slider"
              style={{
                fontSize: "0.85rem",
                color: "var(--text-primary)",
                fontWeight: 500,
              }}
            >
              Temperatura:{" "}
              <strong>
                {temperature !== undefined &&
                temperature >= 0.0 &&
                temperature <= 2.0
                  ? temperature.toFixed(2)
                  : "Padrão"}
              </strong>
            </label>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--text-soft)",
                fontStyle: "italic",
              }}
            >
              {temperature !== undefined &&
              temperature >= 0.0 &&
              temperature <= 2.0
                ? temperature < 0.7
                  ? "Mais determinístico"
                  : temperature < 1.3
                  ? "Equilibrado"
                  : "Mais criativo"
                : "Usando padrão do modelo"}
            </div>
          </div>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--text-soft)",
                minWidth: "30px",
                textAlign: "right",
              }}
            >
              0.0
            </span>
            <input
              id="temperature-slider"
              type="range"
              min="0"
              max="200"
              step="1"
              value={
                temperature !== undefined &&
                temperature >= 0.0 &&
                temperature <= 2.0
                  ? Math.round(temperature * 100)
                  : 100
              }
              onChange={(e) => {
                const value = parseFloat(e.target.value) / 100;
                setTemperature(value);
              }}
              disabled={isProcessing}
              style={{
                flex: 1,
                height: "8px",
                borderRadius: 4,
                background:
                  "linear-gradient(to right, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)",
                outline: "none",
                cursor: isProcessing ? "not-allowed" : "pointer",
                WebkitAppearance: "none",
                appearance: "none",
                opacity: isProcessing ? 0.6 : 1,
              }}
            />
            <style>{`
              #temperature-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: #fff;
                border: 2px solid var(--accent-strong);
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                transition: all 0.2s;
              }
              
              #temperature-slider::-webkit-slider-thumb:hover {
                transform: scale(1.1);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
              }
              
              #temperature-slider::-moz-range-thumb {
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: #fff;
                border: 2px solid var(--accent-strong);
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                transition: all 0.2s;
              }
              
              #temperature-slider::-moz-range-thumb:hover {
                transform: scale(1.1);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
              }
              
              #temperature-slider:disabled::-webkit-slider-thumb {
                cursor: not-allowed;
                opacity: 0.6;
              }
              
              #temperature-slider:disabled::-moz-range-thumb {
                cursor: not-allowed;
                opacity: 0.6;
              }
            `}</style>
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--text-soft)",
                minWidth: "30px",
                textAlign: "left",
              }}
            >
              2.0
            </span>
          </div>
          <div
            style={{
              fontSize: "0.7rem",
              color: "var(--text-soft)",
              textAlign: "center",
            }}
          >
            Valores baixos = mais determinístico • Valores altos = mais criativo
          </div>
        </div>
      </section>

      <ProcessingStatus />
    </div>
  );
};
