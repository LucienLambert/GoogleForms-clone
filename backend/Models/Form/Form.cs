using prid_2425_a01.Models.User;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace prid_2425_a01.Models.Form;

public class Form {
    [Key]
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public int OwnerId { get; set; }
    public bool IsPublic { get; set; }

    [ForeignKey(nameof(OwnerId))]
    public User.User Owner { get; set; } = null!;

    public ICollection<Instance.Instance> ListInstances { get; set; } = new HashSet<Instance.Instance>();
    public ICollection<Question.Question> ListQuestions { get; set; } = new HashSet<Question.Question>();
    public ICollection<UserFormAccess> ListUserFormAccesses { get; set; } = new HashSet<UserFormAccess>();
}