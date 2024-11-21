using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Security.AccessControl;

namespace prid_2425_a01.Models;

public enum AccessType
{
    User = 0, Editor = 1,
}

public class UserFormAccess {

    public int UserId { get; set; }
    public int FormId { get; set; }
    public AccessType AccessType { get; set; } 

    
    [ForeignKey(nameof(UserId))]
    public User User{ get; set; } = null!;
    [ForeignKey(nameof(FormId))]
    public Form Form{ get; set; } = null!;

    
}