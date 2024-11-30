using AutoMapper;

namespace prid_2425_a01.Models;

public class MappingProfile : Profile
{
    private FormContext _context;

    public MappingProfile(FormContext context) {
        _context = context;
        
        CreateMap<User, UserDTO>();
        CreateMap<UserDTO, User>();

        CreateMap<User, User_With_PasswordDTO>();
        CreateMap<User_With_PasswordDTO, User>();

        CreateMap<UserFormAccess, UserFormAccessDTO>();
        CreateMap<UserFormAccessDTO, UserFormAccess>();

        CreateMap<Form, FormDTO>();
        CreateMap<FormDTO, Form>();

        CreateMap<Form, Form_With_QuestionsDTO>();
        CreateMap<Form_With_QuestionsDTO, Form>();
        
        CreateMap<Instance, InstanceDTO>();
        CreateMap<InstanceDTO, Instance>();

        CreateMap<Instance, Instance_With_AnswersDTO>();
        CreateMap<Instance_With_AnswersDTO, Instance>();

        CreateMap<Answer, AnswerDTO>();
        CreateMap<AnswerDTO, Answer>();
        
        CreateMap<Question, QuestionDTO>();
        CreateMap<QuestionDTO, Question>();
        
        CreateMap<OptionList, OptionListDTO>();
        CreateMap<OptionListDTO, OptionList>();
        
        CreateMap<OptionList, OptionList_With_OptionValuesDTO>();
        CreateMap<OptionList_With_OptionValuesDTO, OptionList>();
        
        CreateMap<OptionValue, OptionValueDTO>();
        CreateMap<OptionValueDTO, OptionValue>();
        
    }
    
}
