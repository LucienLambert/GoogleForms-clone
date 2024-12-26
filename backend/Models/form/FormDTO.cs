namespace prid_2425_a01.Models.form;


public class FormDTO {
    
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public int OwnerId { get; set; }
    public bool IsPublic { get; set; }

}

public class Form_With_QuestionsDTO : FormDTO {
    public ICollection<Question_CompleteDTO> ListQuestions { get; set; } = new List<Question_CompleteDTO>();
}


public class Form_with_LastInstanceDTO : FormDTO {
    //référence la dernière instance du form
    public ICollection<Instance_only_DateDTO>? ListInstances { get; set; }
}

//DTO avec l'attribut form, owner, listQuestion
public class FormDTO_With_Form_QuestionsDTO : FormDTO {
    public ICollection<Question_CompleteDTO> ListQuestions { get; set; } = new List<Question_CompleteDTO>();
    public ICollection<Instance_only_DateDTO>? ListInstances { get; set; } = new List<Instance_only_DateDTO>();
}

public class FormDTO_With_All_ListDTO : FormDTO {
    public UserDTO Owner { get; set; } = null!;
    public ICollection<Question_CompleteDTO>? ListQuestions { get; set; } = new List<Question_CompleteDTO>();
    public ICollection<Instance_only_DateDTO>? ListInstances { get; set; } = new List<Instance_only_DateDTO>();
    public ICollection<UserFormAccessDTO_Only_Id>? ListUserFormAccesses { get; set; } = new List<UserFormAccessDTO_Only_Id>();
}

public class FormDetailsDTO : FormDTO {
    public UserDTO Owner { get; set; } = null!;
    public Instance_only_DateDTO? LastInstance { get; set; }
}

