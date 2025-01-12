using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace prid_2425_a01.Models.OptionList;


public class OptionList {
    [Key]
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public int? OwnerId { get; set; } 

    [ForeignKey(nameof(OwnerId))]
    public User.User Owner { get; set; }= null!;
    

    public ICollection<OptionValue.OptionValue> ListOptionValues { get; set; } = new HashSet<OptionValue.OptionValue>();
}
