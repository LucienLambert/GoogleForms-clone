using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace prid_2425_a01.Models;

public class UserFormAccessDTO {
    
    public User User{ get; set; } = null!;
    public Form Form{ get; set; } = null!;
    public AccessType Enum { get; set; } 
}