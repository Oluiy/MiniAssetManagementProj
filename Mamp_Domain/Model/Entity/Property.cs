namespace Mamp_Domain.Model.Entity;

public class Property : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    
    public ICollection<Asset> Assets { get; set; } = new List<Asset>();
}