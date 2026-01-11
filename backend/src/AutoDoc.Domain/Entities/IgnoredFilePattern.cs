namespace AutoDoc.Domain.Entities;

public class IgnoredFilePattern
{
    public int Id { get; set; }
    public string Pattern { get; set; } = null!; // Ex: "appsettings.json", "*.env", "*secrets*"
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
