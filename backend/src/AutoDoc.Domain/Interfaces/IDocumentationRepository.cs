using AutoDoc.Domain.Entities;

namespace AutoDoc.Domain.Interfaces;

public interface IDocumentationRepository
{
    Task<FinalDocumentation?> GetBySessionIdAsync(int sessionId, CancellationToken cancellationToken = default);
    Task<FinalDocumentation> AddAsync(FinalDocumentation documentation, CancellationToken cancellationToken = default);
    Task UpdateAsync(FinalDocumentation documentation, CancellationToken cancellationToken = default);
}
