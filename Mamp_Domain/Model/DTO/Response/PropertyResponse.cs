namespace Mamp_Domain.Model.DTO.Response;

public class PropertyResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public int AssetCount { get; set; }
    
    // Optional: A simplified list of assets attached to this property
    public List<AssetSummaryResponse> Assets { get; set; } = new();
}

// helper function to reduce large data retrieval which will reduce system efficiency
public class AssetSummaryResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}