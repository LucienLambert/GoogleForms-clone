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

        modelBuilder.Entity<Answer>()
            .HasKey(a => new { a.InstanceId, a.QuestionId, a.Idx });

        //liaison entre Form et User.
        modelBuilder.Entity<Form>()
            .HasOne(f => f.Owner)               //Un form possède un User
            .WithMany(u => u.ListForms)         //Un user possède plusieur Form
            .HasForeignKey(f => f.IdOwner)      //indique que la clé étrangère est représenté par Owner dans Form
            .OnDelete(DeleteBehavior.Cascade);  //si le user est Del on supprime tous les formulaires lié. 


        //liaisons instances , à tester et se mettre d'accord
        modelBuilder.Entity<Instance>(i =>
        {
            i.HasOne(i => i.Form)
                    .WithMany(f => f.Instances)
                    .HasForeignKey(i => i.FormId)
                    .OnDelete(DeleteBehavior.Cascade); // Si le Form est supprimé, supprime les instances en cascade

            i.HasOne(i => i.User)
                    .WithMany(u => u.ListInstances)
                    .HasForeignKey(i => i.UserId)
                    .OnDelete(DeleteBehavior.Cascade); // Si le User est supprimé, supprime les instances en cascade
                    
            i.HasMany(i => i.ListAnswers)
                    .WithOne(a => a.Instance)
                    .HasForeignKey(a => a.InstanceId)
                    .OnDelete(DeleteBehavior.Cascade); // Si une Instance est supprimée, supprime les réponses en relation, parait inversé car c'est le possesseur de la collection qui est visé par la règle
        });





        modelBuilder.Entity<User>().HasData(
            new User { Id=1, Email = "ben@epfc.eu", Password = "Password1,", Role = Role.User, FirstName = "Benoit", LastName = "Penelle" },
            new User { Id=2, Email = "bruno@epfc.eu", Password = "Password1,", Role = Role.User, FirstName = "Bruno", LastName = "Lacroix" },
            new User { Id=3, Email = "boris@epfc.eu", Password = "Password1,", Role = Role.User, FirstName = "Boris", LastName = "Verhaegen" },
            new User { Id=4, Email = "admin@epfc.eu", Password = "Password1,", Role = Role.Admin, FirstName = "Admin", LastName = "Administrator" },
            new User { Id=5, Email = "guest@epfc.eu", Password = "N/A", Role = Role.Guest, FirstName = "Guest", LastName = "No Name" },
            new User { Id=6, Email = "xavier@epfc.eu", Password = "Password1,", Role = Role.User, FirstName = "Xavier", LastName = "Pigeolet" }
        );

        modelBuilder.Entity<Instance>().HasData(
            new Instance { Id = 1, FormId = 1, UserId = 2, Started = DateTime.UtcNow.AddDays(-2), Completed = DateTime.UtcNow.AddDays(-1) },
            new Instance { Id = 2, FormId = 2, UserId = 2, Started = DateTime.UtcNow.AddDays(-5), Completed = null },
            new Instance { Id = 3, FormId = 3, UserId = 1, Started = DateTime.UtcNow.AddDays(-10), Completed = null },
            new Instance { Id = 4, FormId = 4, UserId = 4, Started = DateTime.UtcNow.AddDays(-3), Completed = DateTime.UtcNow.AddDays(-2) },
            new Instance { Id = 5, FormId = 5, UserId = 3, Started = DateTime.UtcNow.AddDays(-1), Completed = null }
        );

        modelBuilder.Entity<Form>().HasData(
            new Form { Id = 1, Title = "ZBCD", Description = "Description TEST", IdOwner = 1, IsPublic = false },
            new Form { Id = 2, Title = "BCDE", Description = "Trie alphabetique", IdOwner = 1, IsPublic = true },
            new Form { Id = 3, Title = "CDEF", Description = "", IdOwner = 1, IsPublic = true },
            new Form { Id = 4, Title = "Formulaire de test 3", Description = "Description pour le formulaire 3", IdOwner = 2, IsPublic = false },
            new Form { Id = 5, Title = "Formulaire de test 4", Description = "Description pour le formulaire 4", IdOwner = 3, IsPublic = false },
            new Form { Id = 6, Title = "Formulaire de test 5", Description = "Description pour le formulaire 5", IdOwner = 2, IsPublic = true },
            new Form { Id = 7, Title = "Admin Form", Description = "Description Admin", IdOwner = 4, IsPublic = true },
            new Form { Id = 8, Title = "Admin Form Bis", Description = "", IdOwner = 4, IsPublic = false }
        );
    }
    //permet le mapping entre la backend et la DB (liaison)
    //sans ça impossible de manipuler les objets de la DB "CRUD".
    public DbSet<User> Users => Set<User>();
    public DbSet<Form> Forms => Set<Form>();
    public DbSet<Instance> Instances => Set<Instance>();
    public DbSet<Answer> Answers => Set<Answer>();
    public DbSet<Question> Questions => Set<Question>();
    //...
}