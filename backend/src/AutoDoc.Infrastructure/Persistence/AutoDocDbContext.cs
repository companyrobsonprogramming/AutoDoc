using AutoDoc.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AutoDoc.Infrastructure.Persistence;

public class AutoDocDbContext : DbContext
{
    public AutoDocDbContext(DbContextOptions<AutoDocDbContext> options) : base(options)
    {
    }

    public DbSet<Prompt> Prompts => Set<Prompt>();
    public DbSet<ProcessingSession> Sessions => Set<ProcessingSession>();
    public DbSet<Package> Packages => Set<Package>();
    public DbSet<AiResult> AiResults => Set<AiResult>();
    public DbSet<FinalDocumentation> FinalDocumentations => Set<FinalDocumentation>();
    public DbSet<GeminiApiKey> GeminiApiKeys => Set<GeminiApiKey>();
    public DbSet<IgnoredFilePattern> IgnoredFilePatterns => Set<IgnoredFilePattern>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AutoDocDbContext).Assembly);
    }
}
