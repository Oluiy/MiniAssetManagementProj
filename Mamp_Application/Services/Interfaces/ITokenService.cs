using System.Security.Claims;

namespace Mamp_Application.Services.Interfaces;

public interface ITokenService
{
    string GenerateToken(Guid userId, string? role, string email);
    string GenerateRefreshToken(Guid userId);
    ClaimsPrincipal? GetPrincipalFromToken(string token); // Added to validate tokens without a DB
}