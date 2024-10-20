using AutoMapper;

namespace prid_2425_a01.Models;

public class MappingProfile : Profile
{
    private FormContext _context;

    public MappingProfile(FormContext context) {
        _context = context;
        
        CreateMap<User, UserDTO>();
        CreateMap<UserDTO, User>();
    }
    
    
}
