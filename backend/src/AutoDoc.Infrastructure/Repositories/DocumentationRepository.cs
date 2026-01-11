using AutoDoc.Domain.Interfaces;
using AutoDoc.Domain.Entities;
using AutoDoc.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AutoDoc.Infrastructure.Repositories;

public class DocumentationRepository : IDocumentationRepository
{
    private readonly AutoDocDbContext _context;

    public DocumentationRepository(AutoDocDbContext context)
    {
        _context = context;
    }

    public async Task<FinalDocumentation?> GetBySessionIdAsync(int sessionId, CancellationToken cancellationToken = default)
        => await _context.FinalDocumentations
            .Include(f => f.Session)
            .FirstOrDefaultAsync(f => f.SessionId == sessionId, cancellationToken);

    public async Task<FinalDocumentation> AddAsync(FinalDocumentation documentation, CancellationToken cancellationToken = default)
    {
        _context.FinalDocumentations.Add(documentation);
        await _context.SaveChangesAsync(cancellationToken);
        return documentation;
    }

    public async Task UpdateAsync(FinalDocumentation documentation, CancellationToken cancellationToken = default)
    {
        _context.FinalDocumentations.Update(documentation);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
