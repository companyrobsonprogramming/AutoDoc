using AutoDoc.Domain.Entities;
using AutoDoc.Domain.Interfaces;
using AutoDoc.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AutoDoc.Infrastructure.Repositories;

public class PackageRepository : IPackageRepository
{
    private readonly AutoDocDbContext _context;

    public PackageRepository(AutoDocDbContext context)
    {
        _context = context;
    }

    public async Task<Package?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await _context.Packages
            .Include(p => p.Session)
            .Include(p => p.AiResult)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Package>> GetBySessionAsync(int sessionId, CancellationToken cancellationToken = default)
        => await _context.Packages
            .Where(p => p.SessionId == sessionId)
            .OrderBy(p => p.Index)
            .ToListAsync(cancellationToken);

    public async Task<Package> AddAsync(Package package, CancellationToken cancellationToken = default)
    {
        _context.Packages.Add(package);
        await _context.SaveChangesAsync(cancellationToken);
        return package;
    }

    public async Task UpdateAsync(Package package, CancellationToken cancellationToken = default)
    {
        _context.Packages.Update(package);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Package package, CancellationToken cancellationToken = default)
    {
        _context.Packages.Remove(package);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
