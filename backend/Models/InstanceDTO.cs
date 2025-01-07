using prid_2425_a01.Models.form;

namespace prid_2425_a01.Models;

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