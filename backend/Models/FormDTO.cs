namespace prid_2425_a01.Models;

public class FormDTO {
    
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public int OwnerId { get; set; }
    public UserDTO Owner { get; set; } = null!;
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

public class Form_with_LastInstanceDTO : FormDTO {
    //référence la dernière instance du form
    public ICollection<Instance_only_DateDTO>? ListInstances { get; set; }
}

//DTO avec l'attribut form, owner, listQuestion
public class FormDTO_With_Form_QuestionsDTO : FormDTO {
    public ICollection<Question_CompleteDTO> ListQuestions { get; set; } = new List<Question_CompleteDTO>();
}