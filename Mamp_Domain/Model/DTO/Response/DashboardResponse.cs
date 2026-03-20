namespace Mamp_Domain.Model.DTO.Response;

public record DashboardResponse
{
    public int TotalAsset { get; init; }
    public int TotalProperty { get; init; }
    public int TaskPending { get; init; }
    public int TaskInProgress { get; init; }
    public int TaskCompleted { get; init; }
}