using AutoDoc.Application.DTOs;
using AutoDoc.Domain.Entities;
using AutoDoc.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace AutoDoc.Application.Services;

public class AiResultService
{
    private readonly IAiResultRepository _repository;
    private readonly IPackageRepository _packageRepository;
    private readonly ILogger<AiResultService> _logger;

    public AiResultService(IAiResultRepository repository, IPackageRepository packageRepository, ILogger<AiResultService> logger)
    {
        _repository = repository;
        _packageRepository = packageRepository;
        _logger = logger;
    }

    public async Task<AiResultDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var result = await _repository.GetByIdAsync(id, cancellationToken);
        return result is null
            ? null
            : new AiResultDto(result.Id, result.PackageId, result.Content, result.RawJson, result.CreatedAt);
    }

    public async Task<IReadOnlyList<AiResultDto>> GetBySessionAsync(int sessionId, CancellationToken cancellationToken = default)
    {
        var results = await _repository.GetBySessionAsync(sessionId, cancellationToken);
        return results
            .Select(r => new AiResultDto(r.Id, r.PackageId, r.Content, r.RawJson, r.CreatedAt))
            .ToList();
    }

    public async Task<AiResultDto> CreateAsync(CreateAiResultDto dto, CancellationToken cancellationToken = default)
    {
        var package = await _packageRepository.GetByIdAsync(dto.PackageId, cancellationToken);
        if (package is null)
        {
            throw new InvalidOperationException($"Package {dto.PackageId} not found.");
        }

        var entity = new AiResult
        {
            PackageId = dto.PackageId,
            Content = dto.Content,
            RawJson = dto.RawJson,
            CreatedAt = DateTime.UtcNow
        };

        _logger.LogInformation("Creating AI result for package {PackageId}", dto.PackageId);

        entity = await _repository.AddAsync(entity, cancellationToken);

        // Atualiza status do pacote como Completed
        package.Status = PackageStatus.Completed;
        await _packageRepository.UpdateAsync(package, cancellationToken);

        return new AiResultDto(entity.Id, entity.PackageId, entity.Content, entity.RawJson, entity.CreatedAt);
    }
}
