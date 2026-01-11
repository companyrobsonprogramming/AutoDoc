using AutoDoc.Domain.Interfaces;
using AutoDoc.Domain.Entities;
using AutoDoc.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AutoDoc.Infrastructure.Repositories;

public class PromptRepository : IPromptRepository
{
    private readonly AutoDocDbContext _context;

    public PromptRepository(AutoDocDbContext context)
    {
        _context = context;
    }

    public async Task<Prompt?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await _context.Prompts.FindAsync(new object?[] { id }, cancellationToken: cancellationToken);

    public async Task<IReadOnlyList<Prompt>> GetAllAsync(CancellationToken cancellationToken = default)
        => await _context.Prompts.AsNoTracking().OrderBy(p => p.Name).ToListAsync(cancellationToken);

    public async Task<Prompt> AddAsync(Prompt prompt, CancellationToken cancellationToken = default)
    {
        _context.Prompts.Add(prompt);
        await _context.SaveChangesAsync(cancellationToken);
        return prompt;
    }

    public async Task UpdateAsync(Prompt prompt, CancellationToken cancellationToken = default)
    {
        _context.Prompts.Update(prompt);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Prompt prompt, CancellationToken cancellationToken = default)
    {
        _context.Prompts.Remove(prompt);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
