using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Mamp_Domain.Model.Enum;

namespace Mamp_Domain.Model.Entity;

public class MaintenanceTask
{
    [Key]
    public Guid Id { get; set; }
    [StringLength(255)] 
    public string Title { get; set; } = string.Empty;
    [StringLength(255)] 
    public string Description { get; set; } = string.Empty;
    public Asset? Asset { get; set; }
    [ForeignKey("AssetId")]
    public Guid AssetId { get; set; }
    public User? User { get; set; }
    [ForeignKey("UserId")]
    public Guid UserId { get; set; }
    public MaintenancePriority Priority { get; set; }
    public MaintenanceStatus Status { get; set; }
    public DateTime DueDate { get; set; }
}