using AutoDoc.Application.DTOs;
using AutoDoc.Domain.Entities;
using AutoDoc.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace AutoDoc.Application.Services;

public class PromptService
{
    private readonly IPromptRepository _repository;
    private readonly ILogger<PromptService> _logger;

    public PromptService(IPromptRepository repository, ILogger<PromptService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<IReadOnlyList<PromptDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var prompts = await _repository.GetAllAsync(cancellationToken);
        return prompts
            .Select(p => new PromptDto(p.Id, p.Name, p.Content, p.CreatedAt, p.UpdatedAt))
            .ToList();
    }

    public async Task<PromptDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var prompt = await _repository.GetByIdAsync(id, cancellationToken);
        return prompt is null
            ? null
            : new PromptDto(prompt.Id, prompt.Name, prompt.Content, prompt.CreatedAt, prompt.UpdatedAt);
    }

    public async Task<PromptDto> CreateAsync(CreatePromptDto dto, CancellationToken cancellationToken = default)
    {
        var prompt = new Prompt
        {
            Name = dto.Name,
            Content = dto.Content,
            CreatedAt = DateTime.UtcNow
        };

        _logger.LogInformation("Creating prompt {Name}", dto.Name);

        prompt = await _repository.AddAsync(prompt, cancellationToken);

        return new PromptDto(prompt.Id, prompt.Name, prompt.Content, prompt.CreatedAt, prompt.UpdatedAt);
    }

    public async Task<bool> UpdateAsync(int id, UpdatePromptDto dto, CancellationToken cancellationToken = default)
    {
        var prompt = await _repository.GetByIdAsync(id, cancellationToken);
        if (prompt is null) return false;

        prompt.Name = dto.Name;
        prompt.Content = dto.Content;
        prompt.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(prompt, cancellationToken);
        _logger.LogInformation("Updated prompt {PromptId}", id);
        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var prompt = await _repository.GetByIdAsync(id, cancellationToken);
        if (prompt is null) return false;

        await _repository.DeleteAsync(prompt, cancellationToken);
        _logger.LogInformation("Deleted prompt {PromptId}", id);
        return true;
    }
}
