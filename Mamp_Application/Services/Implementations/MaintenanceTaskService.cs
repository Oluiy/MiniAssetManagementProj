using System.Net;
using Mamp_Application.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Mamp_Domain.Model.DTO.Request;
using Mamp_Domain.Model.DTO.Response;
using Mamp_Domain.Model.Entity;
using Mamp_Domain.Model.Enum;
using Mamp_Infrastructure;

namespace Mamp_Application.Services.Implementations;

public class MaintenanceTaskService : IMaintenanceTask // Renamed slightly to follow C# naming conventions
{
    private readonly MampDbContext _db;

    public MaintenanceTaskService(MampDbContext db)
    {
        _db = db;
    }

    public async Task<ServiceResponse<MaintenanceTaskResponse>> CreateTask(MaintenanceTaskRequest request, Guid userId)
    {
        var response = new ServiceResponse<MaintenanceTaskResponse>();

        try
        {
            var assetExists = await _db.Asset
                .AnyAsync(a => a.Id == request.AssetId && a.UserId == userId);
            if (!assetExists)
            {
                response.Success = false;
                response.Message = "The specified Asset does not exist.";
                return response;
            }
            
            Console.WriteLine(userId);
            
            var newTask = new MaintenanceTask 
            {
                Id = Guid.NewGuid(),
                Title = request.Title,
                Description = request.Description,
                AssetId = request.AssetId,
                Priority = request.Priority,
                Status = request.Status,
                DueDate = request.DueDate,
                UserId = userId
            };

            _db.MaintenanceTask.Add(newTask);
            await _db.SaveChangesAsync();

            var data = new MaintenanceTaskResponse
            {
                Id = newTask.Id,
                Title = newTask.Title,
                Description = newTask.Description,
                Priority = newTask.Priority.ToString(),
                Status = newTask.Status.ToString(),
                DueDate = newTask.DueDate,
            };

            response.StatusCode = HttpStatusCode.OK;
            response.Success = true;
            response.Message = "Maintenance task created successfully.";
            response.Data = data;
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error creating task: {ex.Message}";
        }

        return response;
    }

    public async Task<ServiceResponse> AssignPriority(Guid taskId, MaintenancePriority priority, Guid userId)
    {
        var response = new ServiceResponse();

        try
        {
            var task = await _db.MaintenanceTask.SingleOrDefaultAsync(t => t.Id == taskId);

            if (task == null)
            {
                response.Success = false;
                response.Message = "Task not found.";
                return response;
            }

            task.Priority = priority;
            
            _db.MaintenanceTask.Update(task);
            await _db.SaveChangesAsync();

            response.Success = true;
            response.Message = $"Task priority updated successfully: newPriority -> {priority}";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error updating priority: {ex.Message}";
        }

        return response;
    }

    public async Task<ServiceResponse> UpdateStatus(Guid taskId, MaintenanceStatus status, Guid userId)
    {
        var response = new ServiceResponse();

        try
        {
            var task = await _db.MaintenanceTask.FirstOrDefaultAsync(t => t.Id == taskId);

            if (task == null)
            {
                response.Success = false;
                response.Message = "Task not found.";
                return response;
            }

            task.Status = status;

            _db.MaintenanceTask.Update(task);
            await _db.SaveChangesAsync();

            response.Success = true;
            response.Message = "Task status updated successfully.";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error updating status: {ex.Message}";
        }

        return response;
    }

    public async Task<ServiceResponse<MaintenanceTaskResponse>> GetTaskDetails(Guid taskId, Guid userId)
    {
        var response = new ServiceResponse<MaintenanceTaskResponse>();

        try
        {
            var task = await _db.MaintenanceTask
                .AsNoTracking()
                .Where(t => t.Id == taskId && t.UserId == userId)
                .Select(t => new MaintenanceTaskResponse
                {
                    Id = t.Id,
                    Title = t.Title,
                    Description = t.Description,
                    AssetId = t.AssetId,
                    Priority = t.Priority.ToString(),
                    Status = t.Status.ToString(),
                    DueDate = t.DueDate
                })
                .FirstOrDefaultAsync();

            if (task == null)
            {
                response.Success = false;
                response.Message = "Task not found.";
                return response;
            }

            response.Data = task;
            response.Success = true;
            response.Message = "Task details retrieved successfully.";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error retrieving task details: {ex.Message}";
        }

        return response;
    }

    public async Task<ServiceResponse<List<MaintenanceTaskResponse>>> GetAllTask(Guid userId)
    {
        var response = new ServiceResponse<List<MaintenanceTaskResponse>>();

        try
        {
            var tasks = await _db.MaintenanceTask
                .AsNoTracking()
                .Where(t => t.UserId == userId)
                .Select(t => new MaintenanceTaskResponse
                {
                    Id = t.Id,
                    Title = t.Title,
                    Description = t.Description,
                    AssetId = t.AssetId,
                    Priority = t.Priority.ToString(),
                    Status = t.Status.ToString(),
                    DueDate = t.DueDate
                })
                .ToListAsync();

            response.Data = tasks;
            response.Success = true;
            response.Message = "Tasks retrieved successfully.";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error retrieving tasks: {ex.Message}";
        }

        return response;
    }
    
    public async Task<ServiceResponse> DeleteTask(Guid taskId, Guid userId)
    {
        var response = new ServiceResponse();

        try
        {
            var task = await _db.MaintenanceTask.FirstOrDefaultAsync(t => t.Id == taskId);

            if (task == null)
            {
                response.Success = false;
                response.Message = "Task not found.";
                return response;
            }

            // Security Check: Only the owner can delete the task
            if (task.UserId != userId)
            {
                response.Success = false;
                response.Message = "You do not have permission to delete this task.";
                return response;
            }

            _db.MaintenanceTask.Remove(task);
            await _db.SaveChangesAsync();

            response.Success = true;
            response.Message = "Maintenance task deleted successfully.";
        }
        catch (Exception ex)
        {
            response.Success = false;
            var actualError = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            response.Message = $"Error deleting task: {actualError}";
        }

        return response;
    }
}