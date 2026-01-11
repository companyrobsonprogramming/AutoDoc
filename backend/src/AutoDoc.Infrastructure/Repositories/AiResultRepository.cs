using AutoDoc.Domain.Interfaces;
using AutoDoc.Domain.Entities;
using AutoDoc.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AutoDoc.Infrastructure.Repositories;

public class AiResultRepository : IAiResultRepository
{
    private readonly AutoDocDbContext _context;

    public AiResultRepository(AutoDocDbContext context)
    {
        _context = context;
    }

    public async Task<AiResult?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await _context.AiResults
            .Include(r => r.Package)
            .ThenInclude(p => p.Session)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

    public async Task<IReadOnlyList<AiResult>> GetBySessionAsync(int sessionId, CancellationToken cancellationToken = default)
        => await _context.AiResults
            .Include(r => r.Package)
            .Where(r => r.Package.SessionId == sessionId)
            .ToListAsync(cancellationToken);

    public async Task<AiResult> AddAsync(AiResult result, CancellationToken cancellationToken = default)
    {
        _context.AiResults.Add(result);
        await _context.SaveChangesAsync(cancellationToken);
        return result;
    }
}
