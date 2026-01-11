using AutoDoc.Domain.Entities;
using AutoDoc.Domain.Interfaces;
using AutoDoc.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AutoDoc.Infrastructure.Repositories;

public class IgnoredFilePatternRepository : IIgnoredFilePatternRepository
{
    private readonly AutoDocDbContext _context;

    public IgnoredFilePatternRepository(AutoDocDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<IgnoredFilePattern>> GetAllAsync(CancellationToken cancellationToken = default)
        => await _context.IgnoredFilePatterns.AsNoTracking().OrderBy(p => p.Pattern).ToListAsync(cancellationToken);

    public async Task<IgnoredFilePattern?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await _context.IgnoredFilePatterns.FindAsync(new object?[] { id }, cancellationToken: cancellationToken);

    public async Task<IgnoredFilePattern> AddAsync(IgnoredFilePattern pattern, CancellationToken cancellationToken = default)
    {
        _context.IgnoredFilePatterns.Add(pattern);
        await _context.SaveChangesAsync(cancellationToken);
        return pattern;
    }

    public async Task UpdateAsync(IgnoredFilePattern pattern, CancellationToken cancellationToken = default)
    {
        _context.IgnoredFilePatterns.Update(pattern);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(IgnoredFilePattern pattern, CancellationToken cancellationToken = default)
    {
        _context.IgnoredFilePatterns.Remove(pattern);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
