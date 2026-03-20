using System.ComponentModel.DataAnnotations.Schema;
using Mamp_Domain.Model.Enum;

namespace Mamp_Domain.Model.Entity;

public class Asset : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public AssetStatus Status { get; set; }
    public User? User { get; set; }
    [ForeignKey("UserId")]
    public Guid UserId { get; set; }
    public Guid PropertyId { get; set; } 
    [ForeignKey("PropertyId")]
    public Property? Property { get; set; }
    public ICollection<MaintenanceTask> MaintenanceTasks { get; set; } = new List<MaintenanceTask>();
}
