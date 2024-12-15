using prid_2425_a01.Models.form;

namespace prid_2425_a01.Models;

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

public class User_With_ListFormDTO : UserDTO {

    public ICollection<FormDTO> ListFormsDTO { get; set; } = new HashSet<FormDTO>();
}