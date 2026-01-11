using AutoDoc.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AutoDoc.Infrastructure.Persistence.Configurations;

public class IgnoredFilePatternConfiguration : IEntityTypeConfiguration<IgnoredFilePattern>
{
    public void Configure(EntityTypeBuilder<IgnoredFilePattern> builder)
    {
        builder.ToTable("ignored_file_patterns");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Pattern)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(p => p.Description)
            .HasMaxLength(500);

        builder.Property(p => p.IsActive)
            .IsRequired();

        builder.Property(p => p.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.Property(p => p.UpdatedAt);

        builder.HasIndex(p => p.IsActive);
    }
}
