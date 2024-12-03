

namespace prid_2425_a01.Models;

public class FormDTO {
    
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public int IdOwner { get; set; }
    public UserDTO Owner { get; set; } = null!;
    public bool IsPublic { get; set; }
}

public class Form_With_QuestionsDTO {
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public int IdOwner { get; set; }
    public UserDTO Owner { get; set; } = null!;
    public bool IsPublic { get; set; }

    public ICollection<QuestionDTO> ListQuestionDTOs { get; set; } = new List<QuestionDTO>();

}