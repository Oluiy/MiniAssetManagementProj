using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Mamp_Domain.Model.DTO.Request;
using Mamp_Application.Services.Interfaces;

namespace Mamp.Controller;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Locks down all endpoints to authenticated users only
public class MaintenanceTaskController : ControllerBase
{
    private readonly IMaintenanceTask _taskService;

    public MaintenanceTaskController(IMaintenanceTask taskService)
    {
        _taskService = taskService;
    }

    // Helper method to securely extract the UserId from the JWT token
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
        var response = await _taskService.GetTaskDetails(id);

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

    // PATCH api/maintenancetask/{id}/status
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
}