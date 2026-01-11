using AutoDoc.Application.DTOs;
using AutoDoc.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace AutoDoc.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PromptsController : ControllerBase
{
    private readonly PromptService _service;
    private readonly ILogger<PromptsController> _logger;

    public PromptsController(PromptService service, ILogger<PromptsController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PromptDto>>> GetAll(CancellationToken cancellationToken)
    {
        var result = await _service.GetAllAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PromptDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var prompt = await _service.GetByIdAsync(id, cancellationToken);
        if (prompt is null) return NotFound();
        return Ok(prompt);
    }

    [HttpPost]
    public async Task<ActionResult<PromptDto>> Create([FromBody] CreatePromptDto dto, CancellationToken cancellationToken)
    {
        var created = await _service.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePromptDto dto, CancellationToken cancellationToken)
    {
        var ok = await _service.UpdateAsync(id, dto, cancellationToken);
        return ok ? NoContent() : NotFound();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var ok = await _service.DeleteAsync(id, cancellationToken);
        return ok ? NoContent() : NotFound();
    }
}
