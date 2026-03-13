namespace Mamp_Application.Services.Interfaces;

public interface ITokenService
{
    public string GenerateToken(Guid userId, string? role, string email);
    public string GenerateRefreshToken();
}