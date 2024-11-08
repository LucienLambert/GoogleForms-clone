using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace prid_2425_a01.Models;

public class Form {
    [Key]
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public User Owner { get; set; } = null!;
    public bool isPublic { get; set; }


    //il faut encore créer la class (Itération 2);
    //public ICollection<Question> ListQuestion { get; set; } = new List<Question>();
}

public class From_ListInstanceDTO{
    
    public ICollection<Instance> ListInstances { get; set; } = new List<Instance>();

}