using prid_2425_a01.Models.Answer;
using prid_2425_a01.Models.Form;
using prid_2425_a01.Models.OptionList;

namespace prid_2425_a01.Models.Question
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
    
    public class Question_CompleteDTO : QuestionDTO
    { 
        //permet de récupérer le formulaire complète sur la question et évite une requêt DB inutile
        public FormDTO? Form { get; set; }
        public OptionList_With_OptionValuesDTO? OptionList { get; set; }
    }

    public class Question_CompleteDTO_With_AnswersDTO : Question_CompleteDTO
    {
        public ICollection<AnswerDTO> AnswersList { get; set; } = new List<AnswerDTO>();
    }
}