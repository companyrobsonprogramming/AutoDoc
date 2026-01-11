using AutoDoc.Domain.Interfaces;
using AutoDoc.Domain.Entities;
using AutoDoc.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AutoDoc.Infrastructure.Repositories;

public class SessionRepository : ISessionRepository
{
    private readonly AutoDocDbContext _context;

    public SessionRepository(AutoDocDbContext context)
    {
        _context = context;
    }

    public async Task<ProcessingSession?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await _context.Sessions
            .Include(s => s.Prompt)
            .Include(s => s.Packages)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

    public async Task<IReadOnlyList<ProcessingSession>> GetAllAsync(CancellationToken cancellationToken = default)
        => await _context.Sessions
            .Include(s => s.Prompt)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync(cancellationToken);

    public async Task<ProcessingSession> AddAsync(ProcessingSession session, CancellationToken cancellationToken = default)
    {
        _context.Sessions.Add(session);
        await _context.SaveChangesAsync(cancellationToken);
        return session;
    }

    public async Task UpdateAsync(ProcessingSession session, CancellationToken cancellationToken = default)
    {
        _context.Sessions.Update(session);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(ProcessingSession session, CancellationToken cancellationToken = default)
    {
        _context.Sessions.Remove(session);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
