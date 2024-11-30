using CsvHelper.Configuration;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace prid_2425_a01.Models;


public class OptionList {
    [Key]
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public int? OwnerId { get; set; } 

    [ForeignKey(nameof(OwnerId))]
    public User Owner { get; set; }= null!;
    

    public ICollection<OptionValue> ListOptionValues { get; set; } = new HashSet<OptionValue>();
}
