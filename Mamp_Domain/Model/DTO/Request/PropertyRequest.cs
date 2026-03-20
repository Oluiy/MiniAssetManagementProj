namespace Mamp_Domain.Model.DTO.Request;

public record PropertyRequest
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
}