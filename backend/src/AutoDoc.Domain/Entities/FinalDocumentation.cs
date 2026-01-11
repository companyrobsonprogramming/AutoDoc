namespace AutoDoc.Domain.Entities;

public class FinalDocumentation
{
    public int Id { get; set; }
    public int SessionId { get; set; }
    public ProcessingSession Session { get; set; } = null!;
    public string ContentMarkdown { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}
