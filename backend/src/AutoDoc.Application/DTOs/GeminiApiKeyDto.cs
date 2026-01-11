namespace AutoDoc.Application.DTOs;

public record GeminiApiKeyDto(
    int Id,
    string Key,
    string? Description,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public record CreateGeminiApiKeyDto(string Key, string? Description, bool IsActive = true);

public record UpdateGeminiApiKeyDto(string Key, string? Description, bool IsActive = true);
