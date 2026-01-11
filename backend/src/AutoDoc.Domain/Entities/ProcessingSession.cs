namespace AutoDoc.Domain.Entities;

public enum SessionStatus
{
    Pending = 0,
    Processing = 1,
    Completed = 2
}

public class ProcessingSession
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string RepositoryName { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public int TotalPackages { get; set; }
    public SessionStatus Status { get; set; }

    public int PromptId { get; set; }
    public Prompt Prompt { get; set; } = null!;

    public ICollection<Package> Packages { get; set; } = new List<Package>();
    public FinalDocumentation? FinalDocumentation { get; set; }
}
