using AutoDoc.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AutoDoc.Infrastructure.Persistence.Configurations;

public class FinalDocumentationConfiguration : IEntityTypeConfiguration<FinalDocumentation>
{
    public void Configure(EntityTypeBuilder<FinalDocumentation> builder)
    {
        builder.ToTable("final_documentations");
        builder.HasKey(f => f.Id);
        builder.Property(f => f.ContentMarkdown).IsRequired();
        builder.Property(f => f.CreatedAt).IsRequired();

        builder.HasOne(f => f.Session)
            .WithOne(s => s.FinalDocumentation)
            .HasForeignKey<FinalDocumentation>(f => f.SessionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
