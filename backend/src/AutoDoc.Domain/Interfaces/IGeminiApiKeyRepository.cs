using AutoDoc.Domain.Entities;

namespace AutoDoc.Domain.Interfaces;

public interface IGeminiApiKeyRepository
{
    Task<GeminiApiKey?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<GeminiApiKey?> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<GeminiApiKey>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<GeminiApiKey> AddAsync(GeminiApiKey key, CancellationToken cancellationToken = default);
    Task UpdateAsync(GeminiApiKey key, CancellationToken cancellationToken = default);
    Task DeleteAsync(GeminiApiKey key, CancellationToken cancellationToken = default);
    Task DeactivateAllAsync(CancellationToken cancellationToken = default);
}
