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
    
    public class QuestionCompleteDTO
    {
        public int Id { get; set; }

        public int FormId { get; set; }
        public FormDTO Form { get; set; } = null!;
        
        public int Idx { get; set; }
        
        public string Title { get; set; } = null!;

        public string? Description { get; set; }
        
        public QuestionType QuestionType { get; set; } 
        
        public bool Required { get; set; }

        public int? OptionListId { get; set; }
        
        
        public OptionListDTO OptionList { get; set; }
        
        public ICollection<AnswerDTO> ListAnswers { get; set; } = new List<AnswerDTO>();
    }
}