using AutoDoc.Application.DTOs;
using AutoDoc.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace AutoDoc.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AiResultsController : ControllerBase
{
    private readonly AiResultService _service;

    public AiResultsController(AiResultService service)
    {
        _service = service;
    }

    [HttpGet("session/{sessionId:int}")]
    public async Task<ActionResult<IReadOnlyList<AiResultDto>>> GetBySession(int sessionId, CancellationToken cancellationToken)
    {
        var items = await _service.GetBySessionAsync(sessionId, cancellationToken);
        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AiResultDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var item = await _service.GetByIdAsync(id, cancellationToken);
        if (item is null) return NotFound();
        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<AiResultDto>> Create([FromBody] CreateAiResultDto dto, CancellationToken cancellationToken)
    {
        var created = await _service.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }
}
