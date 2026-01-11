using AutoDoc.Domain.Entities;

namespace AutoDoc.Application.DTOs;

public record PackageDto(
    int Id,
    int SessionId,
    int Index,
    long TotalSizeBytes,
    PackageStatus Status,
    DateTime CreatedAt
);

public record CreatePackageDto(
    int SessionId,
    int Index,
    long TotalSizeBytes
);
