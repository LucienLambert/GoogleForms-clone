using prid_2425_a01.Models.Form;

namespace prid_2425_a01.Models.User;

public class UserDTO {
    public int Id { get; set; }
    public string Email { get; set; } = null!;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public Role Role { get; set; }
    public DateTimeOffset? BirthDate { get; set; }
    public string? Token { get; set; }
}

public class User_With_PasswordDTO {
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
}

public class User_Base_DTO
{
    public int Id { get; set; }
    public string Email { get; set; } = null!;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public Role Role { get; set; }
}
public class User_Base_With_FormAccessesDTO : User_Base_DTO {
    public ICollection<UserFormAccessDTO_Only_Id> FormAccesses { get; set; } = new HashSet<UserFormAccessDTO_Only_Id>();
}

public class User_Base_With_PasswordDTO : User_Base_DTO
{
    public string Password { get; set; } = null!;
}

public class User_With_ListFormDTO : UserDTO {

    public ICollection<FormDTO> ListFormsDTO { get; set; } = new HashSet<FormDTO>();
}