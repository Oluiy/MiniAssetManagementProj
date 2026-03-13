using Mamp_Domain.Model.Enum;

namespace Mamp_Domain.Model.DTO.Request
{
    public class UpdatePriorityDto
    {
        public MaintenancePriority Priority { get; set; }
    }

    public class UpdateStatusDto
    {
        public MaintenanceStatus Status { get; set; }
    }
}

