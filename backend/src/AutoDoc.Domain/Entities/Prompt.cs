namespace AutoDoc.Domain.Entities;

public class Prompt
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Content { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public ICollection<ProcessingSession> Sessions { get; set; } = new List<ProcessingSession>();
}
