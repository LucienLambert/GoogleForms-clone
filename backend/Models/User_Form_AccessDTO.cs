using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace prid_2425_a01.Models;

public class User_Form_AccessDTO {
    
    public User User{ get; set; } = null!;
    public Form Form{ get; set; } = null!;
    public AccesType Enum { get; set; } 
}