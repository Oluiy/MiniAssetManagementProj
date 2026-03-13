using System.ComponentModel.DataAnnotations;

namespace Mamp_Domain.Model.Entity;

public class BaseEntity
{
    [Key]
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
}