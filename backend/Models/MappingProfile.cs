using AutoMapper;
using prid_2425_a01.Models.Answer;
using prid_2425_a01.Models.Form;
using prid_2425_a01.Models.Instance;
using prid_2425_a01.Models.OptionList;
using prid_2425_a01.Models.OptionValue;
using prid_2425_a01.Models.Question;
using prid_2425_a01.Models.User;

namespace prid_2425_a01.Models;

public class MappingProfile : Profile
{
    private ApplicationDbContext _context;

    public MappingProfile(ApplicationDbContext context) {
        _context = context;
        
        //USER
        CreateMap<User.User, UserDTO>();
        CreateMap<UserDTO, User.User>();

        CreateMap<User.User, User_With_PasswordDTO>();
        CreateMap<User_With_PasswordDTO, User.User>();

        CreateMap<User.User, User_Base_DTO>();
        CreateMap<User_Base_DTO, User.User>();
        
        CreateMap<User.User, User_Base_With_FormAccessesDTO>();
        CreateMap<User_Base_With_FormAccessesDTO, User.User>();

        CreateMap<User.User, User_Base_With_PasswordDTO>();
        CreateMap<User_Base_With_PasswordDTO, User.User>();

        //FORM
        CreateMap<Form.Form, FormDTO>();
        CreateMap<FormDTO, Form.Form>();

        CreateMap<Form.Form, Form_with_LastInstanceDTO>();
        CreateMap<Form_with_LastInstanceDTO, Form.Form>();

        CreateMap<Form.Form, Form_With_QuestionsDTO>();
        CreateMap<Form_With_QuestionsDTO, Form.Form>();

        
        CreateMap<Form.Form, FormDTO_With_Form_QuestionsDTO>();
        CreateMap<FormDTO_With_Form_QuestionsDTO, Form.Form>();

        CreateMap<Form.Form, FormDTO_With_All_ListDTO>();
        CreateMap<FormDTO_With_All_ListDTO, Form.Form>();

        CreateMap<Form.Form, FormDTO_With_All_InstanceDTO>();
        CreateMap<FormDTO_With_All_InstanceDTO, Form.Form>();

        
        //INSTANCE
        CreateMap<Instance.Instance, InstanceDTO>();
        CreateMap<InstanceDTO, Instance.Instance>();

        CreateMap<Instance.Instance, Instance_With_AnswersDTO>();
        CreateMap<Instance_With_AnswersDTO, Instance.Instance>();

        CreateMap<Instance.Instance, Instance_only_DateDTO>();
        CreateMap<Instance_only_DateDTO, Instance.Instance>();

        CreateMap<Instance.Instance, Instance_With_Answers_And_Form_With_Questions_CompleteDTO>();
        CreateMap<Instance_With_Answers_And_Form_With_Questions_CompleteDTO, Instance.Instance>();

        CreateMap<Instance.Instance, Instance_With_OwnerDTO>();
        CreateMap<Instance_With_OwnerDTO, Instance.Instance>();
        
        //ANSWER
        CreateMap<Answer.Answer, AnswerDTO>();
        CreateMap<AnswerDTO, Answer.Answer>();
        
        //QUESTION
        CreateMap<Question.Question, QuestionDTO>();
        CreateMap<QuestionDTO, Question.Question>();
        
        CreateMap<Question.Question, Question_CompleteDTO>();
        CreateMap<Question_CompleteDTO, Question.Question>();
        
        CreateMap<Question.Question, Question_CompleteDTO_With_AnswersDTO>()
            .IncludeBase<Question.Question, Question_CompleteDTO>()
            .ForMember(dest => dest.AnswersList, opt => opt.Ignore());
        
        //OPTION_LIST
        CreateMap<OptionList.OptionList, OptionListDTO>();
        CreateMap<OptionListDTO, OptionList.OptionList>();
        
        CreateMap<OptionList.OptionList, OptionList_With_OptionValuesDTO>();
        CreateMap<OptionList_With_OptionValuesDTO, OptionList.OptionList>();
        
        //OPTION_VALUE
        CreateMap<OptionValue.OptionValue, OptionValueDTO>();
        CreateMap<OptionValueDTO, OptionValue.OptionValue>();

        //USERFORMACCES
        CreateMap<UserFormAccess, UserFormAccessDTO_Only_Id>();
        CreateMap<UserFormAccessDTO_Only_Id, UserFormAccess>();
        
        CreateMap<UserFormAccess, UserFormAccessDTO>();
        CreateMap<UserFormAccessDTO, UserFormAccess>();
        
        

        CreateMap<Form.Form, FormDetailsDTO>()
            .IncludeBase<Form.Form, FormDTO>()
            .ForMember(dest => dest.Owner, opt => opt.MapFrom(src => src.Owner))
            .ForMember(dest => dest.LastInstance, opt => opt.Ignore());

    }
}
