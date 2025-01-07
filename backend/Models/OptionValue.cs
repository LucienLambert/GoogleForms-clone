using CsvHelper.Configuration;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace prid_2425_a01.Models;


public class OptionValue {

    public int Idx { get; set; }
    public int OptionListId { get; set; }
    public string Value { get; set; } = "";
    
    [ForeignKey(nameof(OptionListId))]
    //[NotMapped]
    public OptionList OptionList { get; set; } = null!;
}
