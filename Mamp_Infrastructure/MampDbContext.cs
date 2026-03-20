using Mamp_Domain.Model.Entity;
using Microsoft.EntityFrameworkCore;

namespace Mamp_Infrastructure;
public class MampDbContext : DbContext
{
    public MampDbContext(DbContextOptions options) : base(options) {}

    // Override SaveChanges to ensure all DateTimes are UTC
    public override int SaveChanges()
    {
        ConvertDatesToUtc();
        return base.SaveChanges();
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ConvertDatesToUtc();
        return await base.SaveChangesAsync(cancellationToken);
    }

    private void ConvertDatesToUtc()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            foreach (var property in entry.Properties)
            {
                if (property.CurrentValue is DateTime dateTime && dateTime.Kind != DateTimeKind.Utc)
                {
                    property.CurrentValue = DateTime.SpecifyKind(dateTime, DateTimeKind.Utc);
                }
            }
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Asset>()
            .Property(a => a.Status)
            .HasConversion<string>();

        modelBuilder.Entity<MaintenanceTask>()
            .Property(t => t.Priority)
            .HasConversion<string>();
        
        modelBuilder.Entity<MaintenanceTask>()
            .Property(t => t.Status)
            .HasConversion<string>();
        
        // 1. User -> Asset Relationship
        // One User has Many Assets.
        modelBuilder.Entity<Asset>()
            .HasOne(a => a.User)
            .WithMany(u => u.Assets)
            .HasForeignKey(a => a.UserId)
            // Restrict: If a user is deleted, do NOT delete the company's assets. 
            // This prevents accidental data wiping and fixes the multiple cascade path issue.
            .OnDelete(DeleteBehavior.Restrict); 

        // 2. Asset -> MaintenanceTask Relationship
        // One Asset has Many Maintenance Tasks.
        modelBuilder.Entity<MaintenanceTask>()
            .HasOne(m => m.Asset)
            .WithMany(a => a.MaintenanceTasks)
            .HasForeignKey(m => m.AssetId)
            // Cascade: If an asset is destroyed/deleted from the system, 
            // it makes sense to automatically delete its pending/past tasks.
            .OnDelete(DeleteBehavior.Cascade); 

        // 3. User -> MaintenanceTask Relationship
        // One User has created Many Maintenance Tasks.
        modelBuilder.Entity<MaintenanceTask>()
            .HasOne(m => m.User)
            .WithMany(u => u.MaintenanceTasks)
            .HasForeignKey(m => m.UserId)
            // Restrict: If an employee leaves and their user account is deleted, 
            // you still want to keep the historical record of the tasks they performed.
            .OnDelete(DeleteBehavior.Restrict);
        
        modelBuilder.Entity<Asset>()
            .HasOne(a => a.Property)
            .WithMany(p => p.Assets)
            .HasForeignKey(a => a.PropertyId)
            // Restrict prevents you from accidentally deleting a Property 
            // if it still has Assets linked to it.
            .OnDelete(DeleteBehavior.Restrict);
    }
    
    public DbSet<User> User { get; set; }
    public DbSet<Asset> Asset { get; set; }
    public DbSet<Property> Property { get; set; }
    public DbSet<MaintenanceTask> MaintenanceTask { get; set; }
    
    
    // I need to migrate this to the online database: dotnet ef migrations add "name of migrations"
    // Then push to the DMBS : dotnet ef database update
}