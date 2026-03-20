using System.ComponentModel.DataAnnotations.Schema;
using Mamp_Domain.Model.Enum;

namespace Mamp_Domain.Model.Entity;

public class Property : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public PropertyStatus Status { get; set; }
    public User? User { get; set; }
    [ForeignKey("UserId")]
    public Guid UserId { get; set; }
    public ICollection<Asset> Assets { get; set; } = new List<Asset>();
}