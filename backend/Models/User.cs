using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace prid_2425_a01.Models;

public enum Role
{
    Admin = 2, User = 1, Guest = 0
}

public class User {
    [Key]
    public int Id { get; set; }
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public Role Role { get; set; }
    public DateTimeOffset? BirthDate { get; set; }
    
    [NotMapped]
    public string? Token { get; set; }
}