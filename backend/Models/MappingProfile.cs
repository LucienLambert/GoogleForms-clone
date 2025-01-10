using AutoMapper;
using prid_2425_a01.Models.form;

namespace prid_2425_a01.Models;

public class MappingProfile : Profile
{
    private ApplicationDbContext _context;

    public MappingProfile(ApplicationDbContext context) {
        _context = context;
        
        //USER
        CreateMap<User, UserDTO>();
        CreateMap<UserDTO, User>();

        CreateMap<User, User_With_PasswordDTO>();
        CreateMap<User_With_PasswordDTO, User>();

        CreateMap<User, User_Base_DTO>();
        CreateMap<User_Base_DTO, User>();
        
        CreateMap<User, User_Base_With_FormAccessesDTO>();
        CreateMap<User_Base_With_FormAccessesDTO, User>();

        CreateMap<User, User_Base_With_PasswordDTO>();
        CreateMap<User_Base_With_PasswordDTO, User>();

        //FORM
        CreateMap<Form, FormDTO>();
        CreateMap<FormDTO, Form>();

        CreateMap<Form, Form_with_LastInstanceDTO>();
        CreateMap<Form_with_LastInstanceDTO, Form>();

        CreateMap<Form, Form_With_QuestionsDTO>();
        CreateMap<Form_With_QuestionsDTO, Form>();

        
        CreateMap<Form, FormDTO_With_Form_QuestionsDTO>();
        CreateMap<FormDTO_With_Form_QuestionsDTO, Form>();

        CreateMap<Form, FormDTO_With_All_ListDTO>();
        CreateMap<FormDTO_With_All_ListDTO, Form>();
        
        //INSTANCE
        CreateMap<Instance, InstanceDTO>();
        CreateMap<InstanceDTO, Instance>();

        CreateMap<Instance, Instance_With_AnswersDTO>();
        CreateMap<Instance_With_AnswersDTO, Instance>();

        CreateMap<Instance, Instance_only_DateDTO>();
        CreateMap<Instance_only_DateDTO, Instance>();

        CreateMap<Instance, Instance_With_Answers_And_Form_With_Questions_CompleteDTO>();
        CreateMap<Instance_With_Answers_And_Form_With_Questions_CompleteDTO, Instance>();
        
        //ANSWER
        CreateMap<Answer, AnswerDTO>();
        CreateMap<AnswerDTO, Answer>();
        
        //QUESTION
        CreateMap<Question, QuestionDTO>();
        CreateMap<QuestionDTO, Question>();
        
        CreateMap<Question, Question_CompleteDTO>();
        CreateMap<Question_CompleteDTO, Question>();
        
        CreateMap<Question, Question_CompleteDTO_With_AnswersDTO>()
            .IncludeBase<Question, Question_CompleteDTO>()
            .ForMember(dest => dest.AnswersList, opt => opt.Ignore());
        
        //OPTION_LIST
        CreateMap<OptionList, OptionListDTO>();
        CreateMap<OptionListDTO, OptionList>();
        
        CreateMap<OptionList, OptionList_With_OptionValuesDTO>();
        CreateMap<OptionList_With_OptionValuesDTO, OptionList>();
        
        //OPTION_VALUE
        CreateMap<OptionValue, OptionValueDTO>();
        CreateMap<OptionValueDTO, OptionValue>();

        //USERFORMACCES
        CreateMap<UserFormAccess, UserFormAccessDTO_Only_Id>();
        CreateMap<UserFormAccessDTO_Only_Id, UserFormAccess>();
        
        CreateMap<UserFormAccess, UserFormAccessDTO>();
        CreateMap<UserFormAccessDTO, UserFormAccess>();
        
        

        CreateMap<Form, FormDetailsDTO>()
            .IncludeBase<Form, FormDTO>()
            .ForMember(dest => dest.Owner, opt => opt.MapFrom(src => src.Owner))
            .ForMember(dest => dest.LastInstance, opt => opt.Ignore());

    }
}
