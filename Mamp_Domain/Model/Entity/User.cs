using System.ComponentModel.DataAnnotations;

namespace Mamp_Domain.Model.Entity;

public class User : BaseEntity
{
    [StringLength(255)] 
    public string Username { get; set; } = string.Empty;
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    [StringLength(255)]
    public string PasswordHash { get; set; } = string.Empty;
    [StringLength(255)]
    public bool EmailConfirmed { get; set; }
    public DateTime LastLogin { get; set; }
    public ICollection<Asset> Assets { get; set; } = new List<Asset>();
    public ICollection<MaintenanceTask> MaintenanceTasks { get; set; } = new List<MaintenanceTask>();
}