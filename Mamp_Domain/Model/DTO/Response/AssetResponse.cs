using Mamp_Domain.Model.Enum;

namespace Mamp_Domain.Model.DTO.Response;

public record AssetResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = "";
    public string Type { get; init; } = "";
    public string Location { get; init; } = "";
    public AssetStatus Status { get; init; }
    public DateTime DateCreated { get; init; }
}