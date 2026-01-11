using AutoDoc.Domain.Entities;

namespace AutoDoc.Domain.Interfaces;

public interface IAiResultRepository
{
    Task<AiResult?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AiResult>> GetBySessionAsync(int sessionId, CancellationToken cancellationToken = default);
    Task<AiResult> AddAsync(AiResult result, CancellationToken cancellationToken = default);
}
