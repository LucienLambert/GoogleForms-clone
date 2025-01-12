using prid_2425_a01.Models.Answer;
using prid_2425_a01.Models.Form;
using prid_2425_a01.Models.User;

namespace prid_2425_a01.Models.Instance;

public class InstanceDTO {

    public int Id { get; set; }
    public int FormId { get; set; }
    public int UserId { get; set; }
    public DateTime Started { get; set; }
    public DateTime? Completed { get; set; }
    
}

public class Instance_With_AnswersDTO : InstanceDTO {
    public ICollection<AnswerDTO> ListAnswers { get; set; } = new HashSet<AnswerDTO>();
}

public class Instance_With_Answers_And_Form_With_Questions_CompleteDTO : Instance_With_AnswersDTO {
    public Form_With_QuestionsDTO Form { get; set; }
}

public class Instance_only_DateDTO {
    public int Id { get; set; }
    public DateTime Started { get; set; }
    public DateTime? Completed {get; set;}
}

public class Instance_With_OwnerDTO : InstanceDTO {
    public UserDTO Owner { get; set; }
}