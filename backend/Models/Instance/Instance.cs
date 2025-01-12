using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace prid_2425_a01.Models.Instance;

public class Instance {

    [Key]
    public int Id { get; set; }
    
    [Required]
    public int FormId { get; set; }
    
    [Required]
    public int UserId { get; set; }
    
    public DateTime Started { get; set; }
    public DateTime? Completed { get; set; }


    [ForeignKey(nameof(FormId))]
    public Form.Form Form { get; set; } = null!;

    [ForeignKey(nameof(UserId))]
    public User.User Owner { get; set; } = null!;

    public ICollection<Answer.Answer> ListAnswers { get; set; } = new HashSet<Answer.Answer>();

}