namespace AutoDoc.Application.DTOs;

public record PromptDto(
    int Id,
    string Name,
    string Content,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record CreatePromptDto(
    string Name,
    string Content
);

public record UpdatePromptDto(
    string Name,
    string Content
);
