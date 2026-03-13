using Mamp_Application.Services.Interfaces;
using Mamp_Domain.Model.DTO.Request;
using Mamp_Domain.Model.DTO.Response;
using Mamp_Domain.Model.Entity;
using Mamp_Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Mamp_Domain.Model.DTO;

namespace Mamp_Application.Services.Implementations;

public class Authentication : IAuthenticationService
{
    private readonly MampDbContext _db;
    private readonly ITokenService _tokenService;
    private readonly IConfiguration _config;
    
    public Authentication(MampDbContext db, ITokenService tokenService, IConfiguration config)
    {
        _db = db;
        _tokenService = tokenService;
        _config = config;
    }

    public async Task<ServiceResponse<SignupResponse>> RegisterUserAsync(SignupRequest signupRequest)
    {
        var response = new ServiceResponse<SignupResponse>();

        try
        {
            var emailExists = await _db.User.AnyAsync(x => x.Email == signupRequest.Email);
            if (emailExists)
            {
                response.Success = false;
                response.Message = "Email already exists";
                return response;
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = signupRequest.Username,
                Email = signupRequest.Email,
                PasswordHash = BCrypt.Net.BCrypt.EnhancedHashPassword(signupRequest.Password, 10),
                EmailConfirmed = true,
                LastLogin = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            _db.User.Add(user);
            await _db.SaveChangesAsync();

            // Stateless Generation
            var accessToken = _tokenService.GenerateToken(user.Id, "user", user.Email);
            var refreshToken = _tokenService.GenerateRefreshToken(user.Id);
            var expiryMinutes = int.Parse(_config["Jwt:ExpiryMinutes"] ?? "60");

            response.Success = true;
            response.Message = "User registered successfully";
            response.Data = new SignupResponse
            {
                Email = user.Email,
                Username = user.Username,
                Token = new TokenResponse
                {
                    AccessToken = accessToken,
                    AccessTokenExpiresAtUtc = DateTime.UtcNow.AddMinutes(expiryMinutes),
                    refreshToken = refreshToken,
                    refreshTokenExpiresAt = DateTime.UtcNow.AddDays(7)
                }
            };
        }
        catch (Exception e)
        {
            response.Success = false;
            response.Message = $"Registration failed: {e.Message}";
        }

        return response;
    }

    public async Task<ServiceResponse<SignupResponse>> LoginAsync(LoginRequest loginRequest)
    {
        var response = new ServiceResponse<SignupResponse>();

        try
        {
            var user = await _db.User.SingleOrDefaultAsync(e => e.Email == loginRequest.Email);
            
            if (user == null || !BCrypt.Net.BCrypt.EnhancedVerify(loginRequest.Password, user.PasswordHash))
            {
                response.Success = false;
                response.Message = "Invalid email or password";
                return response;
            }

            user.LastLogin = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            // Stateless Generation
            var accessToken = _tokenService.GenerateToken(user.Id, "user", user.Email);
            var refreshToken = _tokenService.GenerateRefreshToken(user.Id);
            var expiryMinutes = int.Parse(_config["Jwt:ExpiryMinutes"] ?? "60");

            response.Success = true;
            response.Message = "Login successful";
            response.Data = new SignupResponse
            {
                Email = user.Email,
                Username = user.Username,
                Token = new TokenResponse
                {
                    AccessToken = accessToken,
                    AccessTokenExpiresAtUtc = DateTime.UtcNow.AddMinutes(expiryMinutes),
                    refreshToken = refreshToken,
                    refreshTokenExpiresAt = DateTime.UtcNow.AddDays(7)
                }
            };
        }
        catch (Exception e)
        {
            response.Success = false;
            response.Message = $"Login failed: {e.Message}";
        }

        return response;
    }

    public async Task<ServiceResponse<TokenResponse>> RefreshTokenAsync(string oldRefreshToken)
    {
        var response = new ServiceResponse<TokenResponse>();

        try
        {
            // 1. Statelessly validate the token signature and expiration
            var principal = _tokenService.GetPrincipalFromToken(oldRefreshToken);
            if (principal == null)
            {
                response.Success = false;
                response.Message = "Invalid or expired refresh token. Please log in again.";
                return response;
            }

            // 2. Security Check: Ensure this is a refresh token, not a stolen access token
            var tokenType = principal.FindFirstValue("token_type");
            if (tokenType != "refresh")
            {
                response.Success = false;
                response.Message = "Invalid token type provided.";
                return response;
            }

            // 3. Extract the User ID
            var userIdString = principal.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? principal.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
            {
                response.Success = false;
                response.Message = "Invalid token payload.";
                return response;
            }

            // 4. Quick DB check just to ensure the user hasn't been deleted since their last login
            var user = await _db.User.AsNoTracking().SingleOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                response.Success = false;
                response.Message = "User account no longer exists.";
                return response;
            }

            // 5. Issue fresh tokens
            var newAccessToken = _tokenService.GenerateToken(user.Id, "user", user.Email);
            var newRefreshToken = _tokenService.GenerateRefreshToken(user.Id);
            var expiryMinutes = int.Parse(_config["Jwt:ExpiryMinutes"] ?? "60");

            response.Success = true;
            response.Message = "Token refreshed successfully";
            response.Data = new TokenResponse
            {
                AccessToken = newAccessToken,
                AccessTokenExpiresAtUtc = DateTime.UtcNow.AddMinutes(expiryMinutes),
                refreshToken = newRefreshToken,
                refreshTokenExpiresAt = DateTime.UtcNow.AddDays(7)
            };
        }
        catch (Exception e)
        {
            response.Success = false;
            response.Message = $"Error refreshing token: {e.Message}";
        }

        return response;
    }
}