using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using prid_2425_a01.Helpers;
using prid_2425_a01.Models;

namespace prid_2425_a01.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class User_Form_AccessController : ControllerBase {
    private readonly FormContext _context;
    private readonly IMapper _mapper;
    
    public User_Form_AccessController(FormContext context, IMapper mapper) {
        _context = context;
        _mapper = mapper;
    }
    
    /*
     
     Contrôleur pour les User_Form_Access
     
     */
}