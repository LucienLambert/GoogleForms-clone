using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace prid_2425_a01.Models;

public class InstanceDTO {

    [Key]
    public int Id { get; set; }
    public Form Form { get; set; } = null!;
    public User User{ get; set; } = null!;
    public DateTime Started { get; set; }
    public DateTime Completed { get; set; }
    
}