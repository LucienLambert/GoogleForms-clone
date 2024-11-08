namespace prid_2425_a01.Models;

public class UserDTO
{
    public int Id { get; set; }
    public string Email { get; set; } = null!;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public Role Role { get; set; }
    public DateTimeOffset? BirthDate { get; set; }
    public string? Token { get; set; }

    
}

public class User_With_PasswordDTO {

    public string Password { get; set; } = null!;
}