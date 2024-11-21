using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace prid_2425_a01.Models;

public class Form {
    [Key]
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public int OwnerId { get; set; }
    public bool IsPublic { get; set; }

    [ForeignKey(nameof(OwnerId))]
    public User Owner { get; set; } = null!;


    public ICollection<Instance> ListInstances { get; set; } = new List<Instance>();

}