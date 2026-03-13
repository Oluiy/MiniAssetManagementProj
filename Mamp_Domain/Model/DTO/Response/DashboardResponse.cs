namespace Mamp_Domain.Model.DTO.Response;

public record DashboardResponse
{
    public int TotalAsset { get; set; }
    public int TaskPending { get; set; }
    public int TaskInProgress { get; set; }
    public int TaskCompleted { get; set; }
}