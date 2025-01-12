using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace prid_2425_a01.Models.Answer;

public class Answer {

    [Key]
    public int InstanceId { get; set; }

    [Key]
    public int QuestionId { get; set; }

    [Key]
    public int Idx { get; set; }

    public string Value { get; set; } = "";


    [ForeignKey(nameof(InstanceId))]
    public Instance.Instance Instance { get; set; }= null!;

    [ForeignKey(nameof(QuestionId))]
    public Question.Question Question { get; set; }= null!;


}