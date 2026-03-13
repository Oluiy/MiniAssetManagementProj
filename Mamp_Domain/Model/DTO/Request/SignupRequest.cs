namespace Mamp_Domain.Model.DTO.Request;

public record SignupRequest
{
    public string Username { get; init; } = "";
    public string Email { get; init; } = "";
    public string Password { get; init; } = "";
} 