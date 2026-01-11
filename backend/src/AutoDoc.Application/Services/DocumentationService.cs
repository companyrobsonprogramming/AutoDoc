using System.Text;
using AutoDoc.Application.DTOs;
using AutoDoc.Domain.Entities;
using AutoDoc.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace AutoDoc.Application.Services;

public class DocumentationService
{
    private readonly IAiResultRepository _aiResultRepository;
    private readonly IDocumentationRepository _documentationRepository;
    private readonly ISessionRepository _sessionRepository;
    private readonly ILogger<DocumentationService> _logger;

    public DocumentationService(
        IAiResultRepository aiResultRepository,
        IDocumentationRepository documentationRepository,
        ISessionRepository sessionRepository,
        ILogger<DocumentationService> logger)
    {
        _aiResultRepository = aiResultRepository;
        _documentationRepository = documentationRepository;
        _sessionRepository = sessionRepository;
        _logger = logger;
    }

    public async Task<FinalDocumentationDto> ConsolidateAsync(int sessionId, CancellationToken cancellationToken = default)
    {
        var session = await _sessionRepository.GetByIdAsync(sessionId, cancellationToken);
        if (session is null)
        {
            throw new InvalidOperationException($"Session {sessionId} not found.");
        }

        var existing = await _documentationRepository.GetBySessionIdAsync(sessionId, cancellationToken);
        if (existing is not null)
        {
            // Já consolidado
            return new FinalDocumentationDto(existing.Id, existing.SessionId, existing.ContentMarkdown, existing.CreatedAt);
        }

        var results = await _aiResultRepository.GetBySessionAsync(sessionId, cancellationToken);
        if (!results.Any())
        {
            throw new InvalidOperationException($"No AI results for session {sessionId}.");
        }

        _logger.LogInformation("Consolidating documentation for session {SessionId}", sessionId);

        var sb = new StringBuilder();

        sb.AppendLine($"# Documentação Consolidada - Sessão {session.Id}");
        sb.AppendLine();
        sb.AppendLine($"Repositório: **{session.RepositoryName}**");
        sb.AppendLine();
        sb.AppendLine($"Prompt utilizado: `{session.PromptId}`");
        sb.AppendLine();
        sb.AppendLine("## Sumário Parcial dos Pacotes");
        sb.AppendLine();

        foreach (var r in results.OrderBy(x => x.Package.Index))
        {
            sb.AppendLine($"### Pacote #{r.Package.Index}");
            sb.AppendLine();
            sb.AppendLine(r.Content);
            sb.AppendLine();
            sb.AppendLine("---");
            sb.AppendLine();
        }

        var contentMarkdown = sb.ToString();

        var documentation = new FinalDocumentation
        {
            SessionId = sessionId,
            ContentMarkdown = contentMarkdown,
            CreatedAt = DateTime.UtcNow
        };

        documentation = await _documentationRepository.AddAsync(documentation, cancellationToken);

        // Atualiza status da sessão
        session.Status = SessionStatus.Completed;
        await _sessionRepository.UpdateAsync(session, cancellationToken);

        return new FinalDocumentationDto(documentation.Id, documentation.SessionId, documentation.ContentMarkdown, documentation.CreatedAt);
    }

    public async Task<FinalDocumentationDto?> GetBySessionIdAsync(int sessionId, CancellationToken cancellationToken = default)
    {
        var documentation = await _documentationRepository.GetBySessionIdAsync(sessionId, cancellationToken);
        return documentation is null
            ? null
            : new FinalDocumentationDto(
                documentation.Id,
                documentation.SessionId,
                documentation.ContentMarkdown,
                documentation.CreatedAt
            );
    }

    public async Task<FinalDocumentationDto?> UpdateContentAsync(int sessionId, string newContent, CancellationToken cancellationToken = default)
    {
        var documentation = await _documentationRepository.GetBySessionIdAsync(sessionId, cancellationToken);
        if (documentation is null)
        {
            return null;
        }

        _logger.LogInformation("Updating documentation content for session {SessionId}", sessionId);

        documentation.ContentMarkdown = newContent;
        await _documentationRepository.UpdateAsync(documentation, cancellationToken);

        return new FinalDocumentationDto(
            documentation.Id,
            documentation.SessionId,
            documentation.ContentMarkdown,
            documentation.CreatedAt
        );
    }
}
