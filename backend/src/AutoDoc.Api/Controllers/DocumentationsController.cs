using AutoDoc.Application.DTOs;
using AutoDoc.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace AutoDoc.Api.Controllers;

public record UpdateDocumentationContentRequest(string Content);

[ApiController]
[Route("api/[controller]")]
public class DocumentationsController : ControllerBase
{
    private readonly DocumentationService _service;

    public DocumentationsController(DocumentationService service)
    {
        _service = service;
    }

    [HttpPost("{sessionId:int}/consolidate")]
    public async Task<ActionResult<FinalDocumentationDto>> Consolidate(int sessionId, CancellationToken cancellationToken)
    {
        var doc = await _service.ConsolidateAsync(sessionId, cancellationToken);
        return Ok(doc);
    }

    [HttpGet("{sessionId:int}")]
    public async Task<ActionResult<FinalDocumentationDto>> GetBySession(int sessionId, CancellationToken cancellationToken)
    {
        var doc = await _service.GetBySessionIdAsync(sessionId, cancellationToken);
        if (doc is null) return NotFound();
        return Ok(doc);
    }

    [HttpPut("{sessionId:int}/content")]
    public async Task<ActionResult<FinalDocumentationDto>> UpdateContent(
        int sessionId,
        [FromBody] UpdateDocumentationContentRequest request,
        CancellationToken cancellationToken)
    {
        var doc = await _service.UpdateContentAsync(sessionId, request.Content, cancellationToken);
        if (doc is null) return NotFound();
        return Ok(doc);
    }
}
