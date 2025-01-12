using System.ComponentModel.DataAnnotations.Schema;

namespace prid_2425_a01.Models.OptionValue;


public class OptionValue {

    public int Idx { get; set; }
    public int OptionListId { get; set; }
    public string Value { get; set; } = "";
    
    [ForeignKey(nameof(OptionListId))]
    //[NotMapped]
    public OptionList.OptionList OptionList { get; set; } = null!;
}
