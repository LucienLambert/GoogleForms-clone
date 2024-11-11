using Microsoft.EntityFrameworkCore;

namespace prid_2425_a01.Models;
public class FormContext : DbContext
{
    public FormContext(DbContextOptions<FormContext> options)
        : base(options) {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        
        base.OnModelCreating(modelBuilder);
        //liaison des composite Key pour le model Form
        modelBuilder.Entity<User_Form_Access>().HasKey(f => new { f.IdUser, f.IdForm });
        //liaison des composite Key pour le model Instance
        modelBuilder.Entity<Instance>().HasKey(i => new { i.IdUser, i.IdForm });

        //liaison entre Form et User.
        modelBuilder.Entity<Form>()
            .HasOne(f => f.Owner)               //Un form possède un User
            .WithMany(u => u.ListForms)         //Un user possède plusieur Form
            .HasForeignKey(f => f.IdOwner)      //indique que la clé étrangère est représenté par Owner dans Form
            .OnDelete(DeleteBehavior.Cascade);  //si le user est Del on supprime tous les formulaires lié. 

        modelBuilder.Entity<User>().HasData(
            new User { Id=1, Email = "ben@epfc.eu", Password = "Password1,", Role = Role.User, FirstName = "Benoit", LastName = "Penelle" },
            new User { Id=2, Email = "bruno@epfc.eu", Password = "Password1,", Role = Role.User, FirstName = "Bruno", LastName = "Lacroix" },
            new User { Id=3, Email = "boris@epfc.eu", Password = "Password1,", Role = Role.User, FirstName = "Boris", LastName = "Verhaegen" },
            new User { Id=4, Email = "admin@epfc.eu", Password = "Password1,", Role = Role.Admin, FirstName = "Admin", LastName = "Administrator" },
            new User { Id=5, Email = "guest@epfc.eu", Password = "N/A", Role = Role.Guest, FirstName = "Guest", LastName = "No Name" },
            new User { Id=6, Email = "xavier@epfc.eu", Password = "Password1,", Role = Role.User, FirstName = "Xavier", LastName = "Pigeolet" }
        );

        // Ajout des 5 formulaires pour les tests
            modelBuilder.Entity<Form>().HasData(
                new Form { Id = 1, Title = "Formulaire de test 1", Description = "Description pour le formulaire 1", IdOwner = 1, IsPublic = true },
                new Form { Id = 2, Title = "Formulaire de test 2", Description = "Description pour le formulaire 2", IdOwner = 1, IsPublic = true },
                new Form { Id = 3, Title = "Formulaire de test 3", Description = "Description pour le formulaire 3", IdOwner = 2, IsPublic = false },
                new Form { Id = 4, Title = "Formulaire de test 4", Description = "Description pour le formulaire 4", IdOwner = 3, IsPublic = false },
                new Form { Id = 5, Title = "Formulaire de test 5", Description = "Description pour le formulaire 5", IdOwner = 2, IsPublic = true }
            );
    }
    //permet le mapping entre la backend et la DB (liaison)
    //sans ça impossible de manipuler les objets de la DB "CRUD".
    public DbSet<User> Users => Set<User>();
    public DbSet<Form> Forms => Set<Form>();
}