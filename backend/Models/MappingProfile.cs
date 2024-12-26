using AutoMapper;
using prid_2425_a01.Models.form;

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

        CreateMap<Form, FormWithQuestionsDTO>();
        CreateMap<FormWithQuestionsDTO, Form>();
        
        CreateMap<Instance, InstanceDTO>();
        CreateMap<InstanceDTO, Instance>();

        CreateMap<Instance, Instance_With_AnswersDTO>();
        CreateMap<Instance_With_AnswersDTO, Instance>();

        CreateMap<Answer, AnswerDTO>();
        CreateMap<AnswerDTO, Answer>();
        
        CreateMap<Question, QuestionDTO>();
        CreateMap<QuestionDTO, Question>();
        
        CreateMap<Question, Question_CompleteDTO>();
        CreateMap<Question_CompleteDTO, Question>();
        
        CreateMap<OptionList, OptionListDTO>();
        CreateMap<OptionListDTO, OptionList>();
        
        CreateMap<OptionList, OptionList_With_OptionValuesDTO>();
        CreateMap<OptionList_With_OptionValuesDTO, OptionList>();
        
        CreateMap<OptionValue, OptionValueDTO>();
        CreateMap<OptionValueDTO, OptionValue>();

        CreateMap<Form, FormDetailsDTO>()
            .IncludeBase<Form, FormDTO>()
            .ForMember(dest => dest.Owner, opt => opt.MapFrom(src => src.Owner))
            .ForMember(dest => dest.LastInstance, opt => opt.Ignore());
    }
}
