using Microsoft.EntityFrameworkCore;

namespace prid_2425_a01.Models;
public class FormContext : DbContext
{
    public FormContext(DbContextOptions<FormContext> options)
        : base(options) {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<User>().HasData(
            new User { Id=1, Email = "ben@epfc.eu", Password = "Password1,", Role = Role.User, FirstName = "Benoit", LastName = "Penelle" },
            new User { Id=2, Email = "bruno@epfc.eu", Password = "Password1,", Role = Role.User, FirstName = "Bruno", LastName = "Lacroix" },
            new User { Id=3, Email = "boris@epfc.eu", Password = "Password1,", Role = Role.User, FirstName = "Boris", LastName = "Verhaegen" },
            new User { Id=4, Email = "admin@epfc.eu", Password = "Password1,", Role = Role.Admin, FirstName = "Admin", LastName = "Administrator" },
            new User { Id=5, Email = "guest@epfc.eu", Password = "N/A", Role = Role.Guest, FirstName = "Guest", LastName = "No Name" },
            new User { Id=6, Email = "xavier@epfc.eu", Password = "Password1,", Role = Role.User, FirstName = "Xavier", LastName = "Pigeolet" }
        );
    }

    public DbSet<User> Users => Set<User>();
}