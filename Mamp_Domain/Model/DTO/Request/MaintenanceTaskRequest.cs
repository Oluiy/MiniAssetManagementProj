using Mamp_Domain.Model.Enum;

namespace Mamp_Domain.Model.DTO.Request;

public record MaintenanceTaskRequest
{
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public Guid AssetId { get; init; }
    public MaintenancePriority Priority { get; init; }
    public MaintenanceStatus Status { get; init; }
    public DateTime DueDate { get; set; }
}

public record MaintenanceTaskResponse
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public Guid AssetId { get; init; }
    public string Priority { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public DateTime DueDate { get; init; }
}