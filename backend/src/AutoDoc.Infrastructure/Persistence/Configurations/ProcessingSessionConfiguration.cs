using AutoDoc.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AutoDoc.Infrastructure.Persistence.Configurations;

public class ProcessingSessionConfiguration : IEntityTypeConfiguration<ProcessingSession>
{
    public void Configure(EntityTypeBuilder<ProcessingSession> builder)
    {
        builder.ToTable("sessions");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Name).IsRequired().HasMaxLength(200);
        builder.Property(s => s.RepositoryName).IsRequired().HasMaxLength(300);
        builder.Property(s => s.CreatedAt).IsRequired();
        builder.Property(s => s.TotalPackages).IsRequired();
        builder.Property(s => s.Status).HasConversion<int>().IsRequired();

        builder.HasOne(s => s.Prompt)
            .WithMany(p => p.Sessions)
            .HasForeignKey(s => s.PromptId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
