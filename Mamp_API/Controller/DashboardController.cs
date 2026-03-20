using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Mamp_Application.Services.Interfaces;

namespace Mamp.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Enforces that only logged-in users can view the dashboard
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        // Secure token extraction helper
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

        // GET api/dashboard/overview
        [HttpGet("overview")]
        public async Task<ActionResult> GetDashboardOverview()
        {
            var userId = GetUserId();
        
            var response = await _dashboardService.DashboardOverview(userId);

            if (!response.Success)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }
    }
}