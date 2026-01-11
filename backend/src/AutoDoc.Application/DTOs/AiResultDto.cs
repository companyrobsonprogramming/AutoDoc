namespace AutoDoc.Application.DTOs;

public record AiResultDto(
    int Id,
    int PackageId,
    string Content,
    string? RawJson,
    DateTime CreatedAt
);

public record CreateAiResultDto(
    int PackageId,
    string Content,
    string? RawJson
);
