using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace prid_2425_a01.Models;

public class InstanceDTO {

    public int Id { get; set; }
    public int FormId { get; set; }
    public int UserId { get; set; }
    public DateTime Started { get; set; }
    public DateTime? Completed { get; set; }
    
}
public class Instance_With_AnswersDTO {

    public int Id { get; set; }
    public int FormId { get; set; }
    public int UserId { get; set; }
    public DateTime Started { get; set; }
    public DateTime? Completed { get; set; }
    
    public ICollection<AnswerDTO> ListAnswers { get; set; } = new HashSet<AnswerDTO>();
    
}

public class Instance_only_DateDTO {
    public DateTime started { get; set; }
    public DateTime Completed {get; set;}
}