using AutoDoc.Application.DTOs;
using AutoDoc.Domain.Entities;
using AutoDoc.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace AutoDoc.Application.Services;

public class PackageService
{
    private readonly IPackageRepository _repository;
    private readonly ISessionRepository _sessionRepository;
    private readonly ILogger<PackageService> _logger;

    public PackageService(IPackageRepository repository, ISessionRepository sessionRepository, ILogger<PackageService> logger)
    {
        _repository = repository;
        _sessionRepository = sessionRepository;
        _logger = logger;
    }

    public async Task<PackageDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var pkg = await _repository.GetByIdAsync(id, cancellationToken);
        return pkg is null
            ? null
            : new PackageDto(pkg.Id, pkg.SessionId, pkg.Index, pkg.TotalSizeBytes, pkg.Status, pkg.CreatedAt);
    }

    public async Task<IReadOnlyList<PackageDto>> GetBySessionAsync(int sessionId, CancellationToken cancellationToken = default)
    {
        var pkgs = await _repository.GetBySessionAsync(sessionId, cancellationToken);
        return pkgs
            .Select(p => new PackageDto(p.Id, p.SessionId, p.Index, p.TotalSizeBytes, p.Status, p.CreatedAt))
            .ToList();
    }

    public async Task<PackageDto> CreateAsync(CreatePackageDto dto, CancellationToken cancellationToken = default)
    {
        var session = await _sessionRepository.GetByIdAsync(dto.SessionId, cancellationToken);
        if (session is null)
        {
            throw new InvalidOperationException($"Session {dto.SessionId} not found.");
        }

        var pkg = new Package
        {
            SessionId = dto.SessionId,
            Index = dto.Index,
            TotalSizeBytes = dto.TotalSizeBytes,
            Status = PackageStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _logger.LogInformation("Creating package {Index} for session {SessionId}", dto.Index, dto.SessionId);

        pkg = await _repository.AddAsync(pkg, cancellationToken);

        return new PackageDto(pkg.Id, pkg.SessionId, pkg.Index, pkg.TotalSizeBytes, pkg.Status, pkg.CreatedAt);
    }

    public async Task<bool> UpdateStatusAsync(int id, PackageStatus status, CancellationToken cancellationToken = default)
    {
        var pkg = await _repository.GetByIdAsync(id, cancellationToken);
        if (pkg is null) return false;

        pkg.Status = status;
        await _repository.UpdateAsync(pkg, cancellationToken);
        _logger.LogInformation("Package {PackageId} status changed to {Status}", id, status);
        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var pkg = await _repository.GetByIdAsync(id, cancellationToken);
        if (pkg is null) return false;

        await _repository.DeleteAsync(pkg, cancellationToken);
        _logger.LogInformation("Package {PackageId} deleted", id);
        return true;
    }
}
