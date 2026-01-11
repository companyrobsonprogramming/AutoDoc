using AutoDoc.Domain.Entities;

namespace AutoDoc.Domain.Interfaces;

public interface IPromptRepository
{
    Task<Prompt?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Prompt>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Prompt> AddAsync(Prompt prompt, CancellationToken cancellationToken = default);
    Task UpdateAsync(Prompt prompt, CancellationToken cancellationToken = default);
    Task DeleteAsync(Prompt prompt, CancellationToken cancellationToken = default);
}
