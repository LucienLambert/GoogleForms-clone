using Microsoft.EntityFrameworkCore;
using prid_2425_a01.Models.User;

namespace prid_2425_a01.Models;
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<OptionValue.OptionValue>()
            .HasKey(o => new { o.Idx, o.OptionListId });

        modelBuilder.Entity<Answer.Answer>()
            .HasKey(a => new { a.InstanceId, a.QuestionId, Idx = a.Idx });
            
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

        //liaison entre Form.
        modelBuilder.Entity<Form.Form>(f => {
            f.HasOne(f => f.Owner)               //Un form possède un User
                .WithMany(u => u.ListForms)         //Un user possède plusieur Form
                .HasForeignKey(f => f.OwnerId)      //indique que la clé étrangère est représenté par Owner dans Form
                .OnDelete(DeleteBehavior.Cascade);  //si le user est Del on supprime tous les formulaires lié.

            f.HasMany(f => f.ListUserFormAccesses)
                .WithOne(u => u.Form)
                .OnDelete(DeleteBehavior.Cascade);
            
            f.HasMany(f => f.ListInstances)
                .WithOne(i => i.Form)
                .OnDelete(DeleteBehavior.Cascade);
            
            f.HasMany(f => f.ListQuestions)
                .WithOne(q => q.Form)
                .OnDelete(DeleteBehavior.Cascade);
        });
            
        //liaisons Instance
        modelBuilder.Entity<Instance.Instance>(i => {
            i.HasOne(i => i.Form)
                .WithMany(f => f.ListInstances)
                .HasForeignKey(i => i.FormId)
                .OnDelete(DeleteBehavior.Cascade); // Si le Form est supprimé, supprime les instances en cascade

            i.HasOne(i => i.Owner)
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
        modelBuilder.Entity<OptionValue.OptionValue>(ov => {
            ov.HasOne(ov => ov.OptionList)
                .WithMany(ol => ol.ListOptionValues)
                .HasForeignKey(ol => ol.OptionListId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Question.Question>()
            .HasMany(q => q.ListAnswers)
            .WithOne(a => a.Question)
            .OnDelete(DeleteBehavior.Cascade);

        //TODO ADD LIAISON ENTRE
        //ANSWER -> QUESTION
        //FORM -> QUESTION
        

    }
    //permet le mapping entre la backend et la DB (liaison)
    //sans ça impossible de manipuler les objets de la DB "CRUD".
    public DbSet<User.User> Users => Set<User.User>();
    public DbSet<Form.Form> Forms => Set<Form.Form>();
    public DbSet<Instance.Instance> Instances => Set<Instance.Instance>();
    public DbSet<Answer.Answer> Answers => Set<Answer.Answer>();
    public DbSet<Question.Question> Questions => Set<Question.Question>();
    public DbSet<UserFormAccess> UserFormAccesses => Set<UserFormAccess>(); 
    public DbSet<OptionList.OptionList> OptionLists => Set<OptionList.OptionList>(); 
    public DbSet<OptionValue.OptionValue> OptionValues => Set<OptionValue.OptionValue>();
}