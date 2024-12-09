

namespace prid_2425_a01.Models;

public class FormDTO {
    
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public int OwnerId { get; set; }
    public bool IsPublic { get; set; }
}

public class Form_With_QuestionsDTO {
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public int OwnerId { get; set; }
    public bool IsPublic { get; set; }

    public ICollection<Question_CompleteDTO> ListQuestions { get; set; } = new List<Question_CompleteDTO>();

}

public class FormDetailsDTO : FormDTO {
    public UserDTO Owner { get; set; } = null!;
    public Instance_only_DateDTO? LastInstance { get; set; }
}
