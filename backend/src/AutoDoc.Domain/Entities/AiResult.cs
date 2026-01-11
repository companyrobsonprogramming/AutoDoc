namespace AutoDoc.Domain.Entities;

public class AiResult
{
    public int Id { get; set; }
    public int PackageId { get; set; }
    public Package Package { get; set; } = null!;
    public string Content { get; set; } = null!;
    public string? RawJson { get; set; }
    public DateTime CreatedAt { get; set; }
}
