using Mamp_Application.Services.Interfaces;
using Mamp_Domain.Model.DTO.Response;
using Mamp_Domain.Model.Enum;
using Mamp_Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Mamp_Application.Services.Implementations;

public class DashboardService : IDashboardService
{
    private readonly MampDbContext _db;

    public DashboardService(MampDbContext db)
    {
        _db = db;
    }

    public async Task<ServiceResponse<DashboardResponse>> DashboardOverview(Guid userId)
    {
        var response = new ServiceResponse<DashboardResponse>();

        try
        {
            // Count of Total Assets owned by this user
            var totalAssets = await _db.Asset
                .Where(a => a.UserId == userId)
                .CountAsync();

            var totalProperties = await _db.Property
                .Where(p => p.UserId == userId)
                .CountAsync();

                // Count of Pending Tasks
                var pendingTasks = await _db.MaintenanceTask
                .Where(t => t.UserId == userId && t.Status == MaintenanceStatus.Pending)
                .CountAsync();

            //Count of In Progress Tasks
            var inProgressTasks = await _db.MaintenanceTask
                .Where(t => t.UserId == userId && t.Status == MaintenanceStatus.InProgress)
                .CountAsync();

            //Count of Completed Tasks
            var completedTasks = await _db.MaintenanceTask
                .Where(t => t.UserId == userId && t.Status == MaintenanceStatus.Completed)
                .CountAsync();

            response.Data = new DashboardResponse
            {
                TotalAsset = totalAssets,
                TotalProperty = totalProperties,
                TaskPending = pendingTasks,
                TaskInProgress = inProgressTasks,
                TaskCompleted = completedTasks
            };

            response.Success = true;
            response.Message = "Dashboard metrics retrieved successfully.";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error retrieving dashboard overview: {ex.Message}";
        }

        return response;
    }
}