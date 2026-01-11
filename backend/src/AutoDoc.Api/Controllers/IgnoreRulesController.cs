using AutoDoc.Application.DTOs;
using AutoDoc.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace AutoDoc.Api.Controllers;

[ApiController]
[Route("api/settings/ignore-rules")]
public class IgnoreRulesController : ControllerBase
{
    private readonly IgnoreRuleService _service;
    private readonly ILogger<IgnoreRulesController> _logger;

    public IgnoreRulesController(IgnoreRuleService service, ILogger<IgnoreRulesController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<IgnoreRuleDto>>> GetAll(CancellationToken cancellationToken)
    {
        var result = await _service.GetAllAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<IgnoreRuleDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _service.GetByIdAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<IgnoreRuleDto>> Create([FromBody] CreateIgnoreRuleDto dto, CancellationToken cancellationToken)
    {
        var created = await _service.CreateAsync(dto, cancellationToken);
        _logger.LogInformation("Ignore rule created with id {RuleId}", created.Id);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateIgnoreRuleDto dto, CancellationToken cancellationToken)
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
