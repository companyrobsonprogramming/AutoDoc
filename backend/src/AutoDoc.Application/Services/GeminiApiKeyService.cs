using AutoDoc.Application.DTOs;
using AutoDoc.Domain.Entities;
using AutoDoc.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace AutoDoc.Application.Services;

public class GeminiApiKeyService
{
    private readonly IGeminiApiKeyRepository _repository;
    private readonly ILogger<GeminiApiKeyService> _logger;

    public GeminiApiKeyService(IGeminiApiKeyRepository repository, ILogger<GeminiApiKeyService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<IReadOnlyList<GeminiApiKeyDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var keys = await _repository.GetAllAsync(cancellationToken);
        return keys.Select(Map).ToList();
    }

    public async Task<GeminiApiKeyDto?> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        var key = await _repository.GetActiveAsync(cancellationToken);
        return key is null ? null : Map(key);
    }

    public async Task<GeminiApiKeyDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var key = await _repository.GetByIdAsync(id, cancellationToken);
        return key is null ? null : Map(key);
    }

    public async Task<GeminiApiKeyDto> CreateAsync(CreateGeminiApiKeyDto dto, CancellationToken cancellationToken = default)
    {
        if (dto.IsActive)
        {
            await _repository.DeactivateAllAsync(cancellationToken);
        }

        var entity = new GeminiApiKey
        {
            Key = dto.Key,
            Description = dto.Description,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _logger.LogInformation("Creating Gemini API key (active: {IsActive})", dto.IsActive);

        entity = await _repository.AddAsync(entity, cancellationToken);
        return Map(entity);
    }

    public async Task<GeminiApiKeyDto?> UpdateAsync(int id, UpdateGeminiApiKeyDto dto, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null) return null;

        if (dto.IsActive && !entity.IsActive)
        {
            await _repository.DeactivateAllAsync(cancellationToken);
        }

        entity.Key = dto.Key;
        entity.Description = dto.Description;
        entity.IsActive = dto.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(entity, cancellationToken);
        _logger.LogInformation("Updated Gemini API key {KeyId}", id);
        return Map(entity);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null) return false;

        await _repository.DeleteAsync(entity, cancellationToken);
        _logger.LogInformation("Deleted Gemini API key {KeyId}", id);
        return true;
    }

    private static GeminiApiKeyDto Map(GeminiApiKey entity) =>
        new(entity.Id, entity.Key, entity.Description, entity.IsActive, entity.CreatedAt, entity.UpdatedAt);
}
