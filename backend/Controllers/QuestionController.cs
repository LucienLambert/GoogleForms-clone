using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using prid_2425_a01.Models;


namespace prid_2425_a01.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class QuestionController : ControllerBase {
    private readonly FormContext _context;
    private readonly IMapper _mapper;

    public QuestionController (FormContext context, IMapper mapper) {
        _context = context;
        _mapper = mapper;
    }

}