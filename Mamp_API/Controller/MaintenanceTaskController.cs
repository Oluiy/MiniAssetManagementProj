using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Mamp_Domain.Model.DTO.Request;
using Mamp_Application.Services.Interfaces;
using Mamp_Domain.Model.DTO.Response;

namespace Mamp.Controller;


[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MaintenanceTaskController : ControllerBase
{
    private readonly IMaintenanceTask _taskService;

    /// <summary>
    /// 
    /// </summary>
    /// <param name="taskService"></param>
    public MaintenanceTaskController(IMaintenanceTask taskService)
    {
        _taskService = taskService;
    }
    
    private Guid GetUserId()
    {
        var userIdString = User.FindFirstValue(JwtRegisteredClaimNames.Sub) 
                           ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
        {
            throw new UnauthorizedAccessException("Invalid user token.");
        }
    
        return userId;
    }

    [HttpPost]
    public async Task<ActionResult> CreateTask([FromBody] MaintenanceTaskRequest request)
    {
        var userId = GetUserId();
        var response = await _taskService.CreateTask(request, userId);

        if (!response.Success)
        {
            return BadRequest(response);
        }

        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult> GetTaskDetails(Guid id)
    {
        var userId = GetUserId();
        var response = await _taskService.GetTaskDetails(id, userId);

        if (!response.Success)
        {
            return NotFound(response);
        }

        return Ok(response);
    }

    // PATCH api/maintenancetask/{id}/priority
    [HttpPatch("{id:guid}/priority")]
    public async Task<ActionResult> AssignPriority(Guid id, [FromBody] UpdatePriorityDto request)
    {
        var userId = GetUserId();
        var response = await _taskService.AssignPriority(id, request.Priority, userId);

        if (!response.Success)
        {
            return BadRequest(response);
        }

        return Ok(response);
    }

    /// <summary>
    /// 
    /// </summary>
    /// <param name="id"></param>
    /// <param name="request"></param>
    /// <returns></returns>
    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult> UpdateStatus(Guid id, [FromBody] UpdateStatusDto request)
    {
        var userId = GetUserId();
        var response = await _taskService.UpdateStatus(id, request.Status, userId);

        if (!response.Success)
        {
            return BadRequest(response);
        }

        return Ok(response);
    }
    
    [HttpGet]
    public async Task<ActionResult<ServiceResponse<MaintenanceTaskResponse>>> GetAllAssets()
    {
        var userId = GetUserId();
        var response = await _taskService.GetAllTask(userId);

        if (!response.Success)
        {
            return BadRequest(response);
        }

        return Ok(response);
    }
    
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteTask(Guid id)
    {
        var userId = GetUserId();
        var response = await _taskService.DeleteTask(id, userId);

        if (!response.Success)
        {
            return BadRequest(response);
        }

        return Ok(response);
    }
    
}