using Mamp_Domain.Model.Enum;

namespace Mamp_Domain.Model.DTO.Response;

public record PropertyResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string Address { get; init; } = string.Empty;
    public PropertyStatus Status { get; init; }
    public DateTime DateCreated { get; init; }
    public int AssetCount { get; init; }
    public List<AssetSummaryResponse> Assets { get; set; } = new();
}

// helper function to reduce large data retrieval which will reduce system efficiency
public record AssetSummaryResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
}