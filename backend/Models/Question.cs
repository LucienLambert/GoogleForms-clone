using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace prid_2425_a01.Models;

public enum QuestionType {
    Short,  
    Long,   
    Date,   
    Email,  
    Integer,
    Check,  // le seul qui permette à l'utilisateur de choisir plusieurs valeurs.
    Combo,  
    Radio  
}

public class Question {

    [Key]
    public int Id { get; set; }

    [Required]
    public int FormId { get; set; }

    [Required]
    public int Idx { get; set; }

    [Required]
    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    [Required]
    public QuestionType QuestionType { get; set; } 

    [Required]
    public bool Required { get; set; }

    public int? OptionListId { get; set; }
    

    [ForeignKey(nameof(FormId))]
    public Form Form { get; set; } = null!;

    [ForeignKey(nameof(OptionListId))]
    public OptionList? OptionList { get; set; }



    public ICollection<Answer> ListAnswers { get; set; } = new List<Answer>();
}
