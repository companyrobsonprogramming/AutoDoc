using AutoDoc.Application.DTOs;
using AutoDoc.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace AutoDoc.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SessionsController : ControllerBase
{
    private readonly SessionService _service;

    public SessionsController(SessionService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SessionDto>>> GetAll(CancellationToken cancellationToken)
    {
        var sessions = await _service.GetAllAsync(cancellationToken);
        return Ok(sessions);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<SessionDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var session = await _service.GetByIdAsync(id, cancellationToken);
        if (session is null) return NotFound();
        return Ok(session);
    }

    [HttpPost]
    public async Task<ActionResult<SessionDto>> Create([FromBody] CreateSessionDto dto, CancellationToken cancellationToken)
    {
        var created = await _service.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}/name")]
    public async Task<IActionResult> UpdateName(int id, [FromBody] UpdateSessionNameDto dto, CancellationToken cancellationToken)
    {
        var ok = await _service.UpdateNameAsync(id, dto.Name, cancellationToken);
        return ok ? NoContent() : NotFound();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var ok = await _service.DeleteAsync(id, cancellationToken);
        return ok ? NoContent() : NotFound();
    }
}
