using AutoDoc.Domain.Entities;

namespace AutoDoc.Domain.Interfaces;

public interface IIgnoredFilePatternRepository
{
    Task<IReadOnlyList<IgnoredFilePattern>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IgnoredFilePattern?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IgnoredFilePattern> AddAsync(IgnoredFilePattern pattern, CancellationToken cancellationToken = default);
    Task UpdateAsync(IgnoredFilePattern pattern, CancellationToken cancellationToken = default);
    Task DeleteAsync(IgnoredFilePattern pattern, CancellationToken cancellationToken = default);
}
