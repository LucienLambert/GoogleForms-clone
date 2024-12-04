using prid_2425_a01.Models;

namespace prid_2425_a01.Models
{
    
    public class QuestionDTO
    {
        public int Id { get; set; }

        public int FormId { get; set; }
        
        public int Idx { get; set; }
        
        public string Title { get; set; } = null!;

        public string? Description { get; set; }
        
        public QuestionType QuestionType { get; set; } 
        
        public bool Required { get; set; }

        public int? OptionListId { get; set; }
    }
    
    public class Question_CompleteDTO
    {
        public int Id { get; set; }

        public int FormId { get; set; }
        
        public int Idx { get; set; }
        
        public string Title { get; set; } = null!;

        public string? Description { get; set; }
        
        public QuestionType QuestionType { get; set; } 
        
        public bool Required { get; set; }

        public int? OptionListId { get; set; }
        
        
        public OptionList_With_OptionValuesDTO? OptionList { get; set; }
    }
}