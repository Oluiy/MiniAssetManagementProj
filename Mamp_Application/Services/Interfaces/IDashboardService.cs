using Mamp_Domain.Model.DTO;
using Mamp_Domain.Model.DTO.Response;

namespace Mamp_Application.Services.Interfaces;

public interface IDashboardService
{
    Task<ServiceResponse<DashboardResponse>> DashboardOverview(Guid userId);
}