using AutoDoc.Domain.Entities;
using AutoDoc.Domain.Interfaces;
using AutoDoc.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AutoDoc.Infrastructure.Repositories;

public class GeminiApiKeyRepository : IGeminiApiKeyRepository
{
    private readonly AutoDocDbContext _context;

    public GeminiApiKeyRepository(AutoDocDbContext context)
    {
        _context = context;
    }

    public async Task<GeminiApiKey?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await _context.GeminiApiKeys.FindAsync(new object?[] { id }, cancellationToken: cancellationToken);

    public async Task<GeminiApiKey?> GetActiveAsync(CancellationToken cancellationToken = default)
        => await _context.GeminiApiKeys.AsNoTracking().FirstOrDefaultAsync(k => k.IsActive, cancellationToken);

    public async Task<IReadOnlyList<GeminiApiKey>> GetAllAsync(CancellationToken cancellationToken = default)
        => await _context.GeminiApiKeys.AsNoTracking().OrderByDescending(k => k.CreatedAt).ToListAsync(cancellationToken);

    public async Task<GeminiApiKey> AddAsync(GeminiApiKey key, CancellationToken cancellationToken = default)
    {
        _context.GeminiApiKeys.Add(key);
        await _context.SaveChangesAsync(cancellationToken);
        return key;
    }

    public async Task UpdateAsync(GeminiApiKey key, CancellationToken cancellationToken = default)
    {
        _context.GeminiApiKeys.Update(key);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(GeminiApiKey key, CancellationToken cancellationToken = default)
    {
        _context.GeminiApiKeys.Remove(key);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeactivateAllAsync(CancellationToken cancellationToken = default)
    {
        await _context.GeminiApiKeys
            .Where(k => k.IsActive)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(k => k.IsActive, false)
                .SetProperty(k => k.UpdatedAt, DateTime.UtcNow), cancellationToken);
    }
}
