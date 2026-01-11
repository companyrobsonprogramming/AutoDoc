namespace AutoDoc.Application.DTOs;

public record IgnoreRuleDto(
    int Id,
    string Pattern,
    string? Description,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public record CreateIgnoreRuleDto(string Pattern, string? Description, bool IsActive = true);

public record UpdateIgnoreRuleDto(string Pattern, string? Description, bool IsActive = true);
