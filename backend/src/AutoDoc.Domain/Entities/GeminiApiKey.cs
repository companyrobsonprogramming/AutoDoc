namespace AutoDoc.Domain.Entities;

public class GeminiApiKey
{
    public int Id { get; set; }
    public string Key { get; set; } = null!;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
