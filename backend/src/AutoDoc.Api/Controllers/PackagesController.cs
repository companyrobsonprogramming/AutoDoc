using AutoDoc.Application.DTOs;
using AutoDoc.Application.Services;
using AutoDoc.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace AutoDoc.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PackagesController : ControllerBase
{
    private readonly PackageService _service;

    public PackagesController(PackageService service)
    {
        _service = service;
    }

    [HttpGet("session/{sessionId:int}")]
    public async Task<ActionResult<IReadOnlyList<PackageDto>>> GetBySession(int sessionId, CancellationToken cancellationToken)
    {
        var items = await _service.GetBySessionAsync(sessionId, cancellationToken);
        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PackageDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var pkg = await _service.GetByIdAsync(id, cancellationToken);
        if (pkg is null) return NotFound();
        return Ok(pkg);
    }

    [HttpPost]
    public async Task<ActionResult<PackageDto>> Create([FromBody] CreatePackageDto dto, CancellationToken cancellationToken)
    {
        var created = await _service.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromQuery] PackageStatus status, CancellationToken cancellationToken)
    {
        var ok = await _service.UpdateStatusAsync(id, status, cancellationToken);
        return ok ? NoContent() : NotFound();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var ok = await _service.DeleteAsync(id, cancellationToken);
        return ok ? NoContent() : NotFound();
    }
}
