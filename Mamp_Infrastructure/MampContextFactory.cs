using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Mamp_Infrastructure;

public class MampContextFactory : IDesignTimeDbContextFactory<MampDbContext>
{
    public MampDbContext CreateDbContext(string[] args)
    {
        var connection = new ConfigurationBuilder().Build();
        var connectionString = connection.GetConnectionString("DatabaseConnection");
        Console.WriteLine("Loaded connection string: " + connectionString); 
        
        var optionsBuilder = new DbContextOptionsBuilder();
        optionsBuilder.UseNpgsql(connectionString);

        return new MampDbContext(optionsBuilder.Options);
    }
}

