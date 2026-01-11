namespace AutoDoc.Domain.Entities;

public enum PackageStatus
{
    Pending = 0,
    Processing = 1,
    Completed = 2,
    Error = 3
}

public class Package
{
    public int Id { get; set; }
    public int SessionId { get; set; }
    public ProcessingSession Session { get; set; } = null!;
    public int Index { get; set; }
    public long TotalSizeBytes { get; set; }
    public PackageStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }

    public AiResult? AiResult { get; set; }
}
