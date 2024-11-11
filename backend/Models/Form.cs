using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace prid_2425_a01.Models;

public class Form {
    [Key]
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public int IdOwner { get; set; }
    public User Owner { get; set; } = null!;
    public bool IsPublic { get; set; }
}