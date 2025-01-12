namespace prid_2425_a01.Models.User;

public class UserFormAccessDTO {
    
    public Models.User.User User{ get; set; } = null!;
    public Form.Form Form{ get; set; } = null!;
    public AccessType AccessType { get; set; } 
}

public class UserFormAccessDTO_Only_Id {
    public int UserId { get; set; }
    public int FormId { get; set; }
    public AccessType AccessType { get; set; } 
}