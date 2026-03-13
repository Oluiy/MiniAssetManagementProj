using Mamp_Application.Services.Interfaces;
using Mamp_Domain.Model.DTO;
using Mamp_Domain.Model.DTO.Request;
using Mamp_Domain.Model.DTO.Response;
using Mamp_Domain.Model.Entity;
using Mamp_Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Mamp_Application.Services.Implementations;

public class Authentication : IAuthenticationService
{
    
    private readonly MampDbContext _db;
    private readonly ITokenService _tokenService;
    
    public Authentication(MampDbContext db, ITokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
    }

    public async Task<ServiceResponse<SignupResponse>> RegisterUserAsync(SignupRequest signupRequest)
    {
        var emailExists = await _db.User.AnyAsync(x => x.Email == signupRequest.Email);
        if (emailExists)
        {
            return new ServiceResponse<SignupResponse>
            {
                Success = false,
                Message = "Email already exists",
                Data = null!
            };
        }

        try
        {
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
            var token = _tokenService.GenerateToken(user.Id, "", user.Email);
            var refreshToken = _tokenService.GenerateRefreshToken();
            
            
            return new ServiceResponse<SignupResponse>
            {
                Success = true,
                Message = "User registered successfully",
                Data = new SignupResponse
                {
                    Email = signupRequest.Email,
                    Username = signupRequest.Username,
                    Token = new TokenResponse()
                    {
                        AccessToken = token,
                        AccessTokenExpiresAtUtc = token,
                        refreshToken = refreshToken,
                        refreshTokenExpiresAt = refreshToken
                    }
                }
            };
        }
        catch (Exception e)
        {
            return new ServiceResponse<SignupResponse>
            {
                Success = false,
                Message = "Registration failed. Please try again.",
                Data = null
            };
        }
    }

    public async Task<ServiceResponse<SignupResponse>> LoginAsync(LoginRequest loginRequest)
    {
        try
        {
            var user = await _db.User.SingleOrDefaultAsync(e => e.Email == loginRequest.Email);
            if (user == null)
            {
                return new ServiceResponse<SignupResponse>
                {
                    Success = false,
                    Message = "Invalid email or password"
                };
            }

            user.LastLogin = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            
            var accessToken = _tokenService.GenerateToken(user.Id, "user", user.Email);
            var refreshToken = _tokenService.GenerateRefreshToken();
            var data = new SignupResponse
            {
                Email = loginRequest.Email,
                Username = user.Username,
                Token = new TokenResponse()
                {
                    AccessToken = accessToken,
                    AccessTokenExpiresAtUtc = "60 minutes",
                    refreshToken = refreshToken,
                }
            };

            return new ServiceResponse<SignupResponse>
            {
                Success = true,
                Message = "Login successful",
                Data = data
            };
        }
        catch (Exception e)
        {
                
            return new ServiceResponse<SignupResponse>
            {
                Success = true,
                Message = $"message: {e.Message}",
                Data = null
            };
        }
    }
}