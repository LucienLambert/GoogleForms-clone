using Microsoft.AspNetCore.Mvc;
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
    //Guest is the default user
    public Role Role { get; set; } = Role.Guest;
    [NotMapped]
    public string? Token { get; set; }
    public DateTimeOffset? BirthDate { get; set; }

    public int? Age {
    get {
        if (!BirthDate.HasValue)
            return null;
        var today = DateTime.Today;
        var age = today.Year - BirthDate.Value.Year;
        if (BirthDate.Value.Date > today.AddYears(-age)) age--;
        return age;
        }
    }
    
    //prévilégie les HashSet par la suite. plus adapté que les List standard.
    public ICollection<Form> ListForms{ get; set; } = new HashSet<Form>();
    
    public ICollection<Instance> ListInstances{ get; set; } = new List<Instance>();
    public ICollection<UserFormAccess> ListUserFormAccesses { get; set; } = new List<UserFormAccess>();
    //il faut encore créer la class (Itération 2);
    //public ICollection<OptionsList> ListOptionsLists{ get; set; } = new List<OptionList>();


    public bool IsInRole(Role role){
        return role == this.Role;
    }


}