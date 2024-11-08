using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace prid_2425_a01.Models;

public class Instance {

    [Key]
    public int Id { get; set; }
    public int IdForm { get; set; }
    public Form Form { get; set; } = null!;
    public int IdUser { get; set; }
    public User User{ get; set; } = null!;
    public DateTime Started { get; set; }
    public DateTime Completed { get; set; }

    //il faut encore créer la class (Itération 2);
    //public ICollection<Answer> ListAnswers { get; set; } = new List<Answer>();

}