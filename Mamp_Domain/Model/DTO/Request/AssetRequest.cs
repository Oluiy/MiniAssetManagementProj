using Mamp_Domain.Model.Enum;

namespace Mamp_Domain.Model.DTO.Request;

public record AssetRequest
{
    public string Name { get; init; } = "";
    public string Type { get; init; } = "";
    public string Location { get; init; } = "";
    public AssetStatus Status { get; init; }
}