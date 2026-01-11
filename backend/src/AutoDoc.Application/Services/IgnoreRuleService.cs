using AutoDoc.Application.DTOs;
using AutoDoc.Domain.Entities;
using AutoDoc.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace AutoDoc.Application.Services;

public class IgnoreRuleService
{
    private readonly IIgnoredFilePatternRepository _repository;
    private readonly ILogger<IgnoreRuleService> _logger;

    public IgnoreRuleService(IIgnoredFilePatternRepository repository, ILogger<IgnoreRuleService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<IReadOnlyList<IgnoreRuleDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var rules = await _repository.GetAllAsync(cancellationToken);
        return rules.Select(Map).ToList();
    }

    public async Task<IgnoreRuleDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var rule = await _repository.GetByIdAsync(id, cancellationToken);
        return rule is null ? null : Map(rule);
    }

    public async Task<IgnoreRuleDto> CreateAsync(CreateIgnoreRuleDto dto, CancellationToken cancellationToken = default)
    {
        var entity = new IgnoredFilePattern
        {
            Pattern = dto.Pattern,
            Description = dto.Description,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _logger.LogInformation("Creating ignore rule for pattern {Pattern}", dto.Pattern);
        entity = await _repository.AddAsync(entity, cancellationToken);
        return Map(entity);
    }

    public async Task<IgnoreRuleDto?> UpdateAsync(int id, UpdateIgnoreRuleDto dto, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null) return null;

        entity.Pattern = dto.Pattern;
        entity.Description = dto.Description;
        entity.IsActive = dto.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(entity, cancellationToken);
        _logger.LogInformation("Updated ignore rule {RuleId}", id);
        return Map(entity);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null) return false;

        await _repository.DeleteAsync(entity, cancellationToken);
        _logger.LogInformation("Deleted ignore rule {RuleId}", id);
        return true;
    }

    private static IgnoreRuleDto Map(IgnoredFilePattern entity) =>
        new(entity.Id, entity.Pattern, entity.Description, entity.IsActive, entity.CreatedAt, entity.UpdatedAt);
}
