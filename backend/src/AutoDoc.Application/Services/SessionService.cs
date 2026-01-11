using AutoDoc.Application.DTOs;
using AutoDoc.Domain.Entities;
using AutoDoc.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace AutoDoc.Application.Services;

public class SessionService
{
    private readonly ISessionRepository _repository;
    private readonly IPromptRepository _promptRepository;
    private readonly ILogger<SessionService> _logger;

    public SessionService(ISessionRepository repository, IPromptRepository promptRepository, ILogger<SessionService> logger)
    {
        _repository = repository;
        _promptRepository = promptRepository;
        _logger = logger;
    }

    public async Task<SessionDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var session = await _repository.GetByIdAsync(id, cancellationToken);
        return session is null
            ? null
            : new SessionDto(
                session.Id,
                session.Name,
                session.RepositoryName,
                session.CreatedAt,
                session.TotalPackages,
                session.Status,
                session.PromptId
            );
    }

    public async Task<IReadOnlyList<SessionDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var sessions = await _repository.GetAllAsync(cancellationToken);
        return sessions
            .Select(s => new SessionDto(
                s.Id,
                s.Name,
                s.RepositoryName,
                s.CreatedAt,
                s.TotalPackages,
                s.Status,
                s.PromptId
            ))
            .ToList();
    }

    public async Task<SessionDto> CreateAsync(CreateSessionDto dto, CancellationToken cancellationToken = default)
    {
        var prompt = await _promptRepository.GetByIdAsync(dto.PromptId, cancellationToken);
        if (prompt is null)
        {
            throw new InvalidOperationException($"Prompt {dto.PromptId} not found.");
        }

        var session = new ProcessingSession
        {
            Name = dto.Name,
            RepositoryName = dto.RepositoryName,
            CreatedAt = DateTime.UtcNow,
            TotalPackages = dto.TotalPackages,
            Status = SessionStatus.Pending,
            PromptId = dto.PromptId
        };

        _logger.LogInformation("Creating processing session for repository {Repo}", dto.RepositoryName);

        session = await _repository.AddAsync(session, cancellationToken);

        return new SessionDto(
            session.Id,
            session.Name,
            session.RepositoryName,
            session.CreatedAt,
            session.TotalPackages,
            session.Status,
            session.PromptId
        );
    }

    public async Task<bool> UpdateStatusAsync(int id, SessionStatus status, CancellationToken cancellationToken = default)
    {
        var session = await _repository.GetByIdAsync(id, cancellationToken);
        if (session is null) return false;

        session.Status = status;
        await _repository.UpdateAsync(session, cancellationToken);
        _logger.LogInformation("Session {SessionId} status changed to {Status}", id, status);
        return true;
    }

    public async Task<bool> UpdateNameAsync(int id, string name, CancellationToken cancellationToken = default)
    {
        var session = await _repository.GetByIdAsync(id, cancellationToken);
        if (session is null) return false;

        session.Name = name;
        await _repository.UpdateAsync(session, cancellationToken);
        _logger.LogInformation("Session {SessionId} name updated to {Name}", id, name);
        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var session = await _repository.GetByIdAsync(id, cancellationToken);
        if (session is null) return false;

        await _repository.DeleteAsync(session, cancellationToken);
        _logger.LogInformation("Session {SessionId} deleted", id);
        return true;
    }
}
