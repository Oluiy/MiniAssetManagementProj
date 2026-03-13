namespace Mamp_Domain.Model.DTO.Request;

public record LoginRequest
{
    public string Email { get; init; } = "";
    public string Password { get; init; } = "";
}