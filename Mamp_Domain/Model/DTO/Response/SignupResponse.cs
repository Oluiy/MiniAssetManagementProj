namespace Mamp_Domain.Model.DTO.Response;

public record SignupResponse
{
    public string Username { get; init; }
    public string Email { get; init; }
    public TokenResponse Token { get; init; }
    
}

public record TokenResponse
{
    public string AccessToken { get; init; }
    public string AccessTokenExpiresAtUtc { get; init; }
        
    public string refreshToken { get; init; }
    public string refreshTokenExpiresAt { get; init; }
}