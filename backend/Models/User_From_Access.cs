using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Security.AccessControl;

namespace prid_2425_a01.Models;

public enum AccesType
{
    User = 0, Manager = 1,
}

public class User_Form_Access {

    public int IdUser { get; set; }
    public int IdForm { get; set; }
    public User User{ get; set; } = null!;
    public Form Form{ get; set; } = null!;
    public AccesType Enum { get; set; } 
}