namespace Mamp_Domain.Model.DTO.Response;

public record SignupResponse
{
    public string Username { get; init; } = "";
    public string Email { get; init; } = "";
    public TokenResponse Token { get; init; }
    
}

public record TokenResponse
{
    public string AccessToken { get; init; } = "";
    public DateTime AccessTokenExpiresAtUtc { get; init; }
    public string refreshToken { get; init; } = "";
    public DateTime refreshTokenExpiresAt { get; init; }
}