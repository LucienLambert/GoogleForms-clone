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
public class InstanceController : ControllerBase {
    private readonly FormContext _context;
    private readonly IMapper _mapper;
    
    public InstanceController(FormContext context, IMapper mapper) {
        _context = context;
        _mapper = mapper;
    }
    
    /*
     
     Contrôleur pour les Instances
     
     */
}