using AutoDoc.Application.DTOs;
using AutoDoc.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace AutoDoc.Api.Controllers;

[ApiController]
[Route("api/settings/gemini-keys")]
public class GeminiKeysController : ControllerBase
{
    private readonly GeminiApiKeyService _service;
    private readonly ILogger<GeminiKeysController> _logger;

    public GeminiKeysController(GeminiApiKeyService service, ILogger<GeminiKeysController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<GeminiApiKeyDto>>> GetAll(CancellationToken cancellationToken)
    {
        var result = await _service.GetAllAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("active")]
    public async Task<ActionResult<GeminiApiKeyDto>> GetActive(CancellationToken cancellationToken)
    {
        var result = await _service.GetActiveAsync(cancellationToken);
        return result is null ? NotFound("Nenhuma chave configurada.") : Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<GeminiApiKeyDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _service.GetByIdAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<GeminiApiKeyDto>> Create([FromBody] CreateGeminiApiKeyDto dto, CancellationToken cancellationToken)
    {
        var created = await _service.CreateAsync(dto, cancellationToken);
        _logger.LogInformation("Gemini API key created with id {KeyId}", created.Id);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateGeminiApiKeyDto dto, CancellationToken cancellationToken)
    {
        var updated = await _service.UpdateAsync(id, dto, cancellationToken);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var ok = await _service.DeleteAsync(id, cancellationToken);
        return ok ? NoContent() : NotFound();
    }
}
