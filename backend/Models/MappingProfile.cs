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

        CreateMap<User_Form_Access, User_Form_AccessDTO>();
        CreateMap<User_Form_AccessDTO, User_Form_Access>();

        CreateMap<Form, FormDTO>();
        CreateMap<FormDTO, Form>();

        CreateMap<Instance, InstanceDTO>();
        CreateMap<InstanceDTO, Instance>();
    }
    
}
