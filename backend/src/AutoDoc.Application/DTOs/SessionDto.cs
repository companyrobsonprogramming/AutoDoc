using AutoDoc.Domain.Entities;

namespace AutoDoc.Application.DTOs;

public record SessionDto(
    int Id,
    string Name,
    string RepositoryName,
    DateTime CreatedAt,
    int TotalPackages,
    SessionStatus Status,
    int PromptId
);

public record CreateSessionDto(
    string Name,
    string RepositoryName,
    int TotalPackages,
    int PromptId
);

public record UpdateSessionNameDto(
    string Name
);