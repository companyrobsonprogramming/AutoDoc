using AutoDoc.Domain.Entities;

namespace AutoDoc.Domain.Interfaces;

public interface IPackageRepository
{
    Task<Package?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Package>> GetBySessionAsync(int sessionId, CancellationToken cancellationToken = default);
    Task<Package> AddAsync(Package package, CancellationToken cancellationToken = default);
    Task UpdateAsync(Package package, CancellationToken cancellationToken = default);
    Task DeleteAsync(Package package, CancellationToken cancellationToken = default);
}
