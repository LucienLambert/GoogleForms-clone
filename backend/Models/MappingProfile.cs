using AutoMapper;

namespace prid_2425_a01.Models;

public class MappingProfile : Profile
{
    private FormContext _context;

    public MappingProfile(FormContext context) {
        _context = context;
        
        //USER
        CreateMap<User, UserDTO>();
        CreateMap<UserDTO, User>();

        CreateMap<User, User_With_PasswordDTO>();
        CreateMap<User_With_PasswordDTO, User>();

        CreateMap<UserFormAccess, UserFormAccessDTO>();
        CreateMap<UserFormAccessDTO, UserFormAccess>();

        //FORM
        CreateMap<Form, FormDTO>();
        CreateMap<FormDTO, Form>();

        CreateMap<Form, Form_with_LastInstanceDTO>();
        CreateMap<Form_with_LastInstanceDTO, Form>();

        CreateMap<Form, Form_With_QuestionsDTO>();
        CreateMap<Form_With_QuestionsDTO, Form>();
        
        //INSTANCE
        CreateMap<Instance, InstanceDTO>();
        CreateMap<InstanceDTO, Instance>();

        CreateMap<Instance, Instance_With_AnswersDTO>();
        CreateMap<Instance_With_AnswersDTO, Instance>();

        CreateMap<Instance, Instance_only_DateDTO>();
        CreateMap<Instance_only_DateDTO, Instance>();
        //ANSWER
        CreateMap<Answer, AnswerDTO>();
        CreateMap<AnswerDTO, Answer>();
        
        //QUESTION
        CreateMap<Question, QuestionDTO>();
        CreateMap<QuestionDTO, Question>();
        
        CreateMap<Question, Question_CompleteDTO>();
        CreateMap<Question_CompleteDTO, Question>();
        
        //OPTION_LIST
        CreateMap<OptionList, OptionListDTO>();
        CreateMap<OptionListDTO, OptionList>();
        
        CreateMap<OptionList, OptionList_With_OptionValuesDTO>();
        CreateMap<OptionList_With_OptionValuesDTO, OptionList>();
        
        //OPTION_VALUE
        CreateMap<OptionValue, OptionValueDTO>();
        CreateMap<OptionValueDTO, OptionValue>();
        
    }
    
}
