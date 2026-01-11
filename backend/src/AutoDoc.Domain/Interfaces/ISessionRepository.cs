using AutoDoc.Domain.Entities;

namespace AutoDoc.Domain.Interfaces;

public interface ISessionRepository
{
    Task<ProcessingSession?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProcessingSession>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ProcessingSession> AddAsync(ProcessingSession session, CancellationToken cancellationToken = default);
    Task UpdateAsync(ProcessingSession session, CancellationToken cancellationToken = default);
    Task DeleteAsync(ProcessingSession session, CancellationToken cancellationToken = default);
}
