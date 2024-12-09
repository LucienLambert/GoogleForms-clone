using Microsoft.EntityFrameworkCore;

namespace prid_2425_a01.Models;
public class FormContext : DbContext
{
    public FormContext(DbContextOptions<FormContext> options)
        : base(options) {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<OptionValue>()
            .HasKey(o => new { o.Idx, o.OptionListId });

        modelBuilder.Entity<Answer>()
            .HasKey(a => new { a.InstanceId, a.QuestionId, a.Idx });
            
        //liaison des composite Key pour le model UserFormAccess
        modelBuilder.Entity<UserFormAccess>(ufa => {

            ufa.HasKey(ufa => new { ufa.UserId, ufa.FormId });

            ufa.HasOne(ufa => ufa.Form)
                .WithMany(f => f.ListUserFormAccesses)
                .HasForeignKey(ufa => ufa.FormId)
                .OnDelete(DeleteBehavior.Cascade);

            ufa.HasOne(ufa => ufa.User)
                .WithMany(u => u.ListUserFormAccesses)
                .HasForeignKey(ufa => ufa.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        //liaison entre Form et User.
        modelBuilder.Entity<Form>()
            .HasOne(f => f.Owner)               //Un form possède un User
            .WithMany(u => u.ListForms)         //Un user possède plusieur Form
            .HasForeignKey(f => f.OwnerId)      //indique que la clé étrangère est représenté par Owner dans Form
            .OnDelete(DeleteBehavior.Cascade);  //si le user est Del on supprime tous les formulaires lié. 
            

        //liaisons Instance
        modelBuilder.Entity<Instance>(i => {
            i.HasOne(i => i.Form)
                .WithMany(f => f.ListInstances)
                .HasForeignKey(i => i.FormId)
                .OnDelete(DeleteBehavior.Cascade); // Si le Form est supprimé, supprime les instances en cascade

            i.HasOne(i => i.User)
                .WithMany(u => u.ListInstances)
                .HasForeignKey(i => i.UserId)
                .OnDelete(DeleteBehavior.Cascade); // Si le User est supprimé, supprime les instances en cascade

            i.HasMany(i => i.ListAnswers)
                .WithOne(a => a.Instance)
                .HasForeignKey(a => a.InstanceId)
                .OnDelete(DeleteBehavior
                    .Cascade); // Si une Instance est supprimée, supprime les réponses en relation, parait inversé car c'est le possesseur de la collection qui est visé par la règle
        });
        //liaisons OptionValue
        modelBuilder.Entity<OptionValue>(ov => {
            ov.HasOne(ov => ov.OptionList)
                .WithMany(ol => ol.ListOptionValues)
                .HasForeignKey(ol => ol.OptionListId)
                .OnDelete(DeleteBehavior.Cascade);
        });
        


        //TODO ADD LIAISON ENTRE
        //ANSWER -> QUESTION
        //FORM -> QUESTION
        

    }
    //permet le mapping entre la backend et la DB (liaison)
    //sans ça impossible de manipuler les objets de la DB "CRUD".
    public DbSet<User> Users => Set<User>();
    public DbSet<Form> Forms => Set<Form>();
    public DbSet<Instance> Instances => Set<Instance>();
    public DbSet<Answer> Answers => Set<Answer>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<UserFormAccess> UserFormAccesses => Set<UserFormAccess>(); 
    public DbSet<OptionList> OptionLists => Set<OptionList>(); 
    public DbSet<OptionValue> OptionValues => Set<OptionValue>();
}