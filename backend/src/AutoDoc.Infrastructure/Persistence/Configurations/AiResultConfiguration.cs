using AutoDoc.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AutoDoc.Infrastructure.Persistence.Configurations;

public class AiResultConfiguration : IEntityTypeConfiguration<AiResult>
{
    public void Configure(EntityTypeBuilder<AiResult> builder)
    {
        builder.ToTable("ai_results");
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Content).IsRequired();
        builder.Property(r => r.CreatedAt).IsRequired();

        builder.HasOne(r => r.Package)
            .WithOne(p => p.AiResult)
            .HasForeignKey<AiResult>(r => r.PackageId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
