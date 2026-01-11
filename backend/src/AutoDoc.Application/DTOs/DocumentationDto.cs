namespace AutoDoc.Application.DTOs;

public record FinalDocumentationDto(
    int Id,
    int SessionId,
    string ContentMarkdown,
    DateTime CreatedAt
);
