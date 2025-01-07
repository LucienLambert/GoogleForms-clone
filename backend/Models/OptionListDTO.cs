namespace prid_2425_a01.Models
{
    public class OptionListDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public int? OwnerId { get; set; } 
    }
    
    public class OptionList_With_OptionValuesDTO : OptionListDTO
    {
        public ICollection<OptionValueDTO> ListOptionValues { get; set; } = new List<OptionValueDTO>();
    }

    public class OptionList_With_NotReferencedDTO : OptionList_With_OptionValuesDTO
    {
        public bool NotReferenced { get; set; }
    }
}