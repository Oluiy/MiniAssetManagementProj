using Mamp_Domain.Model.DTO;
using Mamp_Domain.Model.DTO.Request;
using Mamp_Domain.Model.Enum;

namespace Mamp_Application.Services.Interfaces
{
    public interface IMaintenanceTask
    {
        Task<ServiceResponse<MaintenanceTaskResponse>> CreateTask(MaintenanceTaskRequest request, Guid userId);
        Task<ServiceResponse> AssignPriority(Guid taskId, MaintenancePriority priority, Guid userId);
        Task<ServiceResponse> UpdateStatus(Guid taskId, MaintenanceStatus status, Guid userId);
        Task<ServiceResponse<MaintenanceTaskResponse>> GetTaskDetails(Guid taskId, Guid userId);
        Task<ServiceResponse<List<MaintenanceTaskResponse>>> GetAllTask(Guid userId);
        Task<ServiceResponse> DeleteTask(Guid taskId, Guid userId);
    }
}

