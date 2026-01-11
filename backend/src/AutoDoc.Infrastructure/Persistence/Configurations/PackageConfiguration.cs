using AutoDoc.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AutoDoc.Infrastructure.Persistence.Configurations;

public class PackageConfiguration : IEntityTypeConfiguration<Package>
{
    public void Configure(EntityTypeBuilder<Package> builder)
    {
        builder.ToTable("packages");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.CreatedAt).IsRequired();
        builder.Property(p => p.TotalSizeBytes).IsRequired();
        builder.Property(p => p.Index).IsRequired();
        builder.Property(p => p.Status).HasConversion<int>().IsRequired();

        builder.HasOne(p => p.Session)
            .WithMany(s => s.Packages)
            .HasForeignKey(p => p.SessionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
