using System.ComponentModel.DataAnnotations.Schema;

namespace prid_2425_a01.Models.User;

public enum AccessType {
    User = 0,
    Editor = 1,
}

public class UserFormAccess {

    public int UserId { get; set; }
    public int FormId { get; set; }
    public AccessType AccessType { get; set; } 

    
    [ForeignKey(nameof(UserId))]
    public Models.User.User User{ get; set; } = null!;
    [ForeignKey(nameof(FormId))]
    public Form.Form Form{ get; set; } = null!;

    
}