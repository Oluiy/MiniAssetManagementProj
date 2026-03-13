using System.IdentityModel.Tokens.Jwt;
using Mamp_Domain.Model.DTO.Request;
using Mamp_Domain.Model.DTO.Response;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Mamp_Domain.Model.DTO;
using Mamp_Application.Services.Interfaces; // Assuming your interface lives here


namespace Mamp.Controller
{
    [ApiController]
[Route("api/[controller]")]
[Authorize] // This ensures ONLY logged-in users with a valid token can hit these endpoints
public class AssetController : ControllerBase
{
    private readonly IAssetManagement _assetService;
/// <summary>
/// 
/// </summary>
/// <param name="assetService"></param>
    public AssetController(IAssetManagement assetService)
    {
        _assetService = assetService;
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
    public async Task<ActionResult<ServiceResponse<AssetResponse>>> CreateAsset([FromBody] AssetRequest request)
    {
        var userId = GetUserId();
        var response = await _assetService.CreateAsset(request, userId);

        if (!response.Success)
        {
            return BadRequest(response);
        }

        // Returns a 201 Created status code along with the new asset data
        return CreatedAtAction(nameof(GetAssetDetails), new { id = response.Data.Id }, response);
    }

    // In REST APIs, we usually put the ID in the URL for an update: PUT api/asset/{id}
    [HttpPut("{id:guid}")] // The ID comes from the URL
    public async Task<ActionResult<ServiceResponse>> EditAsset(Guid id, [FromBody] AssetRequest request)
    {
        // 1. Securely get the logged-in user's ID from their JWT Token
        var userId = GetUserId(); 

        // 2. Pass the ID from the URL and the data from the Body to your service
        var response = await _assetService.EditAsset(request, userId, id);

        if (!response.Success)
        {
            return BadRequest(response); 
        }

        return Ok(response);
    }

    [HttpGet]
    public async Task<ActionResult<ServiceResponse<List<AssetResponse>>>> GetAllAssets()
    {
        var response = await _assetService.GetAllAsset();

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
    /// <returns></returns>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ServiceResponse<AssetResponse>>> GetAssetDetails(Guid id)
    {
        var response = await _assetService.AssetDetails(id);

        if (!response.Success)
        {
            return NotFound(response); // Standard 404 if the asset doesn't exist
        }

        return Ok(response);
    }
}
}

