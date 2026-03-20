using Mamp_Application.Services.Interfaces;
using Mamp_Domain.Model.DTO.Request;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace Mamp.Controller;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PropertyController : ControllerBase
{
    private readonly IPropertyManagement _propertyService;

    public PropertyController(IPropertyManagement propertyService)
    {
        _propertyService = propertyService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateProperty([FromBody] PropertyRequest request)
    {
        var userId = GetUserId();
        var response = await _propertyService.CreateProperty(request, userId);

        if (!response.Success) return BadRequest(response);
        return Ok(response);
    }
    
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> EditProperty(Guid id, [FromBody] PropertyRequest request)
    {
        var userId = GetUserId();
        var response = await _propertyService.EditProperty(request, userId, id);

        if (!response.Success) return BadRequest(response);
        return Ok(response);
    }

    [HttpGet]
    public async Task<IActionResult> GetProperties()
    {
        var userId = GetUserId();
        var response = await _propertyService.GetProperties(userId);

        if (!response.Success) return BadRequest(response);
        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetPropertyById(Guid id)
    {
        var userId = GetUserId();
        var response = await _propertyService.GetPropertyById(id, userId);

        if (!response.Success) return NotFound(response);
        return Ok(response);
    }
    
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteProperty(Guid id)
    {
        var userId = GetUserId();
        var response = await _propertyService.DeleteProperty(id, userId);

        if (!response.Success)
            return BadRequest(response);

        return Ok(response);
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
}
