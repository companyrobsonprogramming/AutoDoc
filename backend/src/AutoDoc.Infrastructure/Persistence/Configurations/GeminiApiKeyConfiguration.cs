using AutoDoc.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AutoDoc.Infrastructure.Persistence.Configurations;

public class GeminiApiKeyConfiguration : IEntityTypeConfiguration<GeminiApiKey>
{
    public void Configure(EntityTypeBuilder<GeminiApiKey> builder)
    {
        builder.ToTable("gemini_api_keys");
        builder.HasKey(k => k.Id);

        builder.Property(k => k.Key)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(k => k.Description)
            .HasMaxLength(500);

        builder.Property(k => k.IsActive)
            .IsRequired();

        builder.Property(k => k.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.Property(k => k.UpdatedAt);

        builder.HasIndex(k => k.IsActive);
    }
}
