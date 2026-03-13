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
    }
}

