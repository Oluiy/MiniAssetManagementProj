using Microsoft.AspNetCore.Mvc;
using Mamp_Application.Services.Interfaces;
using Mamp_Domain.Model.DTO.Request;

namespace Mamp.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthenticationService _authService;
 
        public AuthController(IAuthenticationService authService)
        {
            _authService = authService;
        }
 
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] SignupRequest request)
        {
            var response = await _authService.RegisterUserAsync(request);
 
            if (!response.Success)
            {
                // 400 Bad Request is standard for validation/registration failures
                return BadRequest(response); 
            }
 
            return Ok(response);
        }
 
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var response = await _authService.LoginAsync(request);
 
            if (!response.Success)
            {
                // 401 Unauthorized is the correct REST status code for failed logins
                return Unauthorized(response); 
            }
 
            return Ok(response);
        }
        
        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            // Basic validation before hitting the service
            if (string.IsNullOrWhiteSpace(request.RefreshToken))
            {
                return BadRequest(new { Success = false, Message = "Refresh token is required." });
            }

            var response = await _authService.RefreshTokenAsync(request.RefreshToken);

            if (!response.Success)
            {
                // Returning 401 Unauthorized here is crucial. 
                // When the frontend's Axios/Fetch interceptor sees a 401 from the /refresh endpoint, 
                // it knows the session is completely dead and it must redirect the user back to the login screen.
                return Unauthorized(response); 
            }

            return Ok(response);
        }
    }
}

